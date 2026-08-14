"use client"

import { useEffect, useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryContentSwr } from "@/hooks/swr/useQueryContentSwr"
import { useQueryModuleSwr } from "@/hooks/swr/useQueryModuleSwr"
import { useQueryContentReactionsSwr } from "@/hooks/swr/useQueryContentReactionsSwr"
import { useMutateReactContentSwr } from "@/hooks/swr/useMutateReactContentSwr"
import { useQueryContentCommentsSwr } from "@/hooks/swr/useQueryContentCommentsSwr"
import { useMutateSubmitContentCommentSwr } from "@/hooks/swr/useMutateSubmitContentCommentSwr"
import { useRepoSandpackFiles } from "@/hooks/swr/useRepoSandpackFiles"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import { useLearnMobileView } from "@/components/layouts/LearnShellLayout"
import { useGlobalAiChat } from "@/components/layouts/GlobalAiChatLayout"
import type { ContentFaceId } from "@/components/blocks/learn/ContentTabRow/component"
import {
    CONTENT_AI_SELECTION_MAX,
    CONTENT_AI_SELECTION_MIN,
} from "@/modules/ai/content-ai-selection-context"
import { sandboxFileCode, type SandboxCodeSelection } from "@/modules/code/sandbox-repo"
import type { SandpackFiles } from "@codesandbox/sandpack-react"
import {
    _CourseLearnContentPage,
    type ContentOutlineEntry,
    type CourseLearnContentPageState,
} from "@/components/pages/CourseLearnContentPage/component"

/**
 * The content reader, connected.
 *
 * IT READS TWO ANSWERS BECAUSE THEY CHANGE AT DIFFERENT RATES. The content is replaced on every
 * page turn; the module around it stays exactly true while that happens. One document for both
 * would re-fetch the whole map each time the reader moved inside it, and the rail would blink on
 * every turn of the page it is supposed to hold still for.
 *
 * LOCKED IS A STATE, NOT AN ERROR, and the server decides it. A premium content arrives with its
 * body already truncated and `isPremium` set; this maps that pair to `locked` and hands the page
 * the body it was given. Nothing here decides how much of a paid lesson a reader may see - a client
 * that cut the body would be a client that could be asked not to.
 *
 * FAILURE IS NOT EMPTINESS. `error` means the request failed and the reader is told so; a settled
 * request with no content is the same sentence for a different reason, and both are `failed`
 * rather than an empty reading surface pretending the lesson has no words.
 *
 * THE OUTLINE IS READ FROM THE MARKDOWN, not from the rendered DOM. The reference scans headings
 * out of the article element after it paints, which needs a live document and a scroll observer;
 * this derives the same list from the source the article is drawn from, so the rail is correct on
 * the first frame. Which entry the reader is LEVEL with still needs that observer, and until it
 * exists no entry claims to be current - a wrong current entry is worse than none.
 */

/** What the route hands this page. */
export interface CourseLearnContentPageProps {
    /** The course this reading belongs to, as its display id. */
    displayId: string
    /** The module the content sits in. */
    moduleId: string
    /** The content being read. */
    contentId: string
}

/** Markdown headings, in order, with the depth the outline indents by. */
const outlineOf = (body: string): Array<ContentOutlineEntry> => {
    const entries: Array<ContentOutlineEntry> = []
    for (const line of body.split(/\r?\n/)) {
        const heading = /^(#{2,4})\s+(.*\S)\s*$/.exec(line)
        if (heading === null) continue
        const depth = heading[1].length - 1
        entries.push({
            id: `${entries.length + 1}`,
            label: heading[2],
            depth: depth <= 1 ? 1 : depth === 2 ? 2 : 3,
        })
    }
    return entries
}

/**
 * Read one content.
 *
 * @param input - {@link CourseLearnContentPageProps}
 */
export const CourseLearnContentPage = (input: CourseLearnContentPageProps) => {
    const t = useTranslations("learn.content")
    const locale = useLocale()
    const reactionText = useTranslations("dashboard.explore.reactions")
    const router = useRouter()
    const content = useQueryContentSwr({ id: input.contentId })
    const module = useQueryModuleSwr({ id: input.moduleId })
    const reactions = useQueryContentReactionsSwr(input.contentId)
    const react = useMutateReactContentSwr()
    const comments = useQueryContentCommentsSwr({ contentId: input.contentId })
    const submitComment = useMutateSubmitContentCommentSwr()
    const ai = useGlobalAiChat()
    const { view } = useLearnMobileView()
    const [isMobile, setIsMobile] = useState(false)
    const [discussionDraft, setDiscussionDraft] = useState("")
    const [discussionDraftKey, setDiscussionDraftKey] = useState(0)
    const [discussionError, setDiscussionError] = useState(false)
    const [selectedFace, setSelectedFace] = useState<ContentFaceId>("reading")
    const [sourceFiles, setSourceFiles] = useState<SandpackFiles>({})
    const [activeSourcePath, setActiveSourcePath] = useState("")
    const [editedSourcePaths, setEditedSourcePaths] = useState<ReadonlyArray<string>>([])
    const [sourceRuntimeError, setSourceRuntimeError] = useState<string>()

    useEffect(() => {
        const query = window.matchMedia("(max-width: 767px)")
        const sync = () => setIsMobile(query.matches)
        sync()
        query.addEventListener("change", sync)
        return () => query.removeEventListener("change", sync)
    }, [])

    const isPending = content.data === undefined && content.error === undefined
    const hasFailed = content.error !== undefined || (content.data === null && !isPending)
    const isLocked = content.data?.isPremium === true
    const state: CourseLearnContentPageState = isPending
        ? "pending"
        : hasFailed ? "failed" : isLocked ? "locked" : "ready"

    const hasSource = content.data?.isSandbox === true
        && content.data.githubBaseUrl !== null
        && content.data.githubDir !== null
        && !isLocked
    const source = useRepoSandpackFiles({
        contentId: content.data?.id,
        githubBaseUrl: content.data?.githubBaseUrl,
        githubDir: content.data?.githubDir,
        isPremium: content.data?.isPremium,
        enabled: selectedFace === "source" && hasSource,
    })

    useEffect(() => {
        setSelectedFace("reading")
        setSourceFiles({})
        setActiveSourcePath("")
        setEditedSourcePaths([])
        setSourceRuntimeError(undefined)
    }, [input.contentId])

    useEffect(() => {
        if (selectedFace !== "source") ai.clearCodeContext()
    }, [ai, selectedFace])

    useEffect(() => {
        if (source.data === undefined) return
        const paths = Object.keys(source.data.files)
        setSourceFiles(source.data.files)
        setActiveSourcePath((current) => current !== "" && paths.includes(current) ? current : paths[0] ?? "")
        setEditedSourcePaths([])
        setSourceRuntimeError(undefined)
    }, [source.data])

    const body = content.data?.body
    const outline = useMemo(() => body === undefined ? [] : outlineOf(body), [body])

    // The reader's place in the module: the pager counts contents, and the module states how many.
    const contents = module.data?.contents ?? []
    const ordered = useMemo(
        () => [...contents].sort((first, second) => first.orderIndex - second.orderIndex),
        [contents],
    )
    const position = ordered.findIndex((sibling) => sibling.id === input.contentId)
    const challenges = useMemo(
        () => [...(content.data?.challenges ?? [])].sort((first, second) => first.orderIndex - second.orderIndex),
        [content.data?.challenges],
    )
    const discussionComments = useMemo(() => (comments.data?.comments ?? []).map((comment) => ({
        id: comment.id,
        author: comment.author.username,
        meta: t("discussionMeta", {
            date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(comment.createdAt)),
            replies: comment.replyCount,
        }),
        body: comment.body,
    })), [comments.data?.comments, locale, t])
    const discussionFailed = discussionError || comments.error !== undefined || comments.data === null
    const discussionPending = comments.data === undefined && comments.error === undefined
    const discussionState = discussionFailed
        ? "failed"
        : discussionPending
            ? "pending"
            : submitComment.isMutating
                ? "submitting"
                : discussionComments.length === 0
                    ? "empty"
                    : "ready"

    const openContent = (id: string) => {
        router.push(`/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${id}`)
    }

    return (
        <_CourseLearnContentPage
            state={state}
            props={{
                labels: {
                    navCourse: t("navCourse"),
                    navModule: content.data?.module.title ?? t("navModule"),
                    facesLabel: t("facesLabel"),
                    searchPlaceholder: t("searchPlaceholder"),
                    searchLabel: t("searchLabel"),
                    searchClearLabel: t("searchClearLabel"),
                    outlineTitle: t("outlineTitle"),
                    pageLabel: t("pageLabel"),
                    previousLabel: t("previousLabel"),
                    nextLabel: t("nextLabel"),
                    reactionsLabel: t("reactionsLabel"),
                    reactionPrompt: t("reactionPrompt"),
                    nextTitle: t("nextTitle"),
                },
                mobileView: isMobile
                    ? view === "contents" || view === "outline" ? view : "lesson"
                    : undefined,
                title: content.data?.title,
                faces: [
                    { id: "reading", label: t("readingFace"), icon: "course" },
                    ...(hasSource ? [{ id: "source" as const, label: t("sourceFace"), icon: "practice" as const }] : []),
                    {
                        id: "challenge",
                        label: t("challengeFace"),
                        icon: "practice",
                        disabled: challenges.length === 0,
                        locked: isLocked,
                    },
                ],
                selectedFace,
                ...(selectedFace !== "source" || !hasSource ? {} : {
                    sourceState: source.error !== undefined
                        ? "failed" as const
                        : source.data === undefined ? "pending" as const : "ready" as const,
                    source: {
                        files: sourceFiles,
                        dependencies: source.dependencies,
                        activePath: activeSourcePath,
                        editedPaths: editedSourcePaths,
                        ...(sourceRuntimeError === undefined ? {} : { runtimeError: sourceRuntimeError }),
                        filesLabel: t("sourceFiles"),
                        editorLabel: t("sourceEditor"),
                        editedLabel: t("sourceEdited"),
                        identity: t("sourceIdentity", { path: activeSourcePath }),
                        loadingLabel: t("sourceLoading"),
                        failedLabel: t("sourceFailed"),
                        retryLabel: t("sourceRetry"),
                        resetLabel: t("sourceReset"),
                        localChangesLabel: t("sourceEdited"),
                        runtimeErrorLabel: t("sourceRuntimeError"),
                        askErrorLabel: t("sourceDebugError"),
                    },
                }),
                body,
                selectionHint: t("selectionHint"),
                // A premium content and a failed request are told apart by which sentence they get,
                // in the same place, with the same one way out.
                noticeMessage: isLocked ? t("lockedMessage") : hasFailed ? t("failedMessage") : undefined,
                noticeActionLabel: isLocked ? t("lockedAction") : hasFailed ? t("failedAction") : undefined,
                outline,
                nextSteps: [
                    ...challenges.map((challenge) => ({ id: challenge.id, label: challenge.title })),
                    ...(ordered[position + 1] === undefined
                        ? []
                        : [{ id: ordered[position + 1].id, label: ordered[position + 1].title }]),
                ],
                reactions: reactions.data === null || reactions.data === undefined ? undefined : {
                    count: reactions.data.total,
                    selected: reactions.data.myReaction,
                    isPending: react.isMutating,
                    labels: {
                        [ReactionType.Like]: reactionText("like"),
                        [ReactionType.Love]: reactionText("love"),
                        [ReactionType.Haha]: reactionText("haha"),
                        [ReactionType.Wow]: reactionText("wow"),
                        [ReactionType.Sad]: reactionText("sad"),
                        [ReactionType.Angry]: reactionText("angry"),
                    },
                },
                discussion: {
                    state: discussionState,
                    props: {
                        labels: {
                            title: t("discussionTitle"),
                            composerLabel: t("discussionComposerLabel"),
                            placeholder: t("discussionPlaceholder"),
                            submit: t("discussionSubmit"),
                            submitting: t("discussionSubmitting"),
                            empty: t("discussionEmpty"),
                            failed: t("discussionFailed"),
                            retry: t("discussionRetry"),
                        },
                        draft: discussionDraft,
                        draftKey: discussionDraftKey,
                        comments: discussionComments,
                    },
                },
                modules: module.data === null || module.data === undefined ? [] : [{
                    id: module.data.id,
                    title: module.data.title,
                    countLabel: t("moduleCount", { total: module.data.numContents }),
                    isOpen: true,
                    contents: ordered.map((sibling) => ({
                        id: sibling.id,
                        title: sibling.title,
                        meta: t("minutes", { minutes: sibling.minutesRead }),
                        isCurrent: sibling.id === input.contentId,
                    })),
                }],
                page: position === -1 ? 1 : position + 1,
                totalPages: ordered.length === 0 ? 1 : ordered.length,
            }}
            on={{
                changePage: (page: number) => {
                    const target = ordered[page - 1]
                    if (target === undefined) return
                    openContent(target.id)
                },
                openContent,
                goCourse: () => router.push(`/courses/${input.displayId}`),
                goModule: () => router.push(`/courses/${input.displayId}/learn/content/modules/${input.moduleId}`),
                act: isLocked
                    ? () => router.push(`/courses/${input.displayId}`)
                    : hasFailed
                        ? () => {
                            void Promise.all([
                                content.mutate(),
                                module.mutate(),
                                reactions.mutate(),
                            ])
                        }
                        : undefined,
                selectReading: () => setSelectedFace("reading"),
                selectSource: hasSource ? () => setSelectedFace("source") : undefined,
                selectChallenge: () => {
                    const challenge = challenges[0]
                    if (challenge === undefined) return
                    router.push(`/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${input.contentId}/challenges/${challenge.id}`)
                },
                source: selectedFace !== "source" || !hasSource ? undefined : {
                    activateFile: setActiveSourcePath,
                    updateFile: (path: string, code: string) => {
                        setSourceFiles((current) => {
                            const previous = current[path]
                            return {
                                ...current,
                                [path]: typeof previous === "string"
                                    ? code
                                    : { ...previous, code },
                            }
                        })
                        setEditedSourcePaths((current) => current.includes(path) ? current : [...current, path])
                    },
                    reset: () => {
                        setSourceFiles(source.files)
                        setEditedSourcePaths([])
                        setSourceRuntimeError(undefined)
                        ai.clearCodeContext()
                    },
                    selectCode: (selection?: SandboxCodeSelection) => {
                        if (selection === undefined) {
                            ai.clearCodeContext()
                            return
                        }
                        if (selection.text.length < CONTENT_AI_SELECTION_MIN
                            || selection.text.length > CONTENT_AI_SELECTION_MAX) return
                        ai.setCodeContext({
                            kind: "code",
                            quote: selection.text,
                            path: selection.path,
                            startLine: selection.startLine,
                            endLine: selection.endLine,
                            hasLocalEdit: editedSourcePaths.includes(selection.path),
                        })
                        ai.open()
                    },
                    askError: () => {
                        if (sourceRuntimeError === undefined) return
                        const currentCode = sandboxFileCode(sourceFiles, activeSourcePath)
                        ai.setCodeContext({
                            kind: "code",
                            quote: (currentCode || sourceRuntimeError).slice(0, CONTENT_AI_SELECTION_MAX),
                            path: activeSourcePath || undefined,
                            runtimeError: sourceRuntimeError,
                            hasLocalEdit: editedSourcePaths.includes(activeSourcePath),
                        })
                        ai.open()
                    },
                    runtimeError: setSourceRuntimeError,
                    retry: () => { void source.mutate() },
                },
                selectReaction: (type) => {
                    void react.trigger({ contentId: input.contentId, type }).then((result) => {
                        const next = result.data?.reactToContent?.data
                        if (next !== null && next !== undefined) void reactions.mutate(next, { revalidate: false })
                    })
                },
                changeDiscussionDraft: setDiscussionDraft,
                submitDiscussion: () => {
                    const body = discussionDraft.trim()
                    if (body === "") return
                    setDiscussionError(false)
                    void submitComment.trigger({ contentId: input.contentId, parentCommentId: null, body })
                        .then(async (result) => {
                            if (result.data?.createComment?.success !== true) {
                                setDiscussionError(true)
                                return
                            }
                            setDiscussionDraft("")
                            setDiscussionDraftKey((current) => current + 1)
                            await comments.mutate()
                        })
                        .catch(() => setDiscussionError(true))
                },
                retryDiscussion: () => {
                    setDiscussionError(false)
                    void comments.mutate()
                },
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
