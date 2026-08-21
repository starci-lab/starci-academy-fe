"use client"

import { useEffect, useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryContentSwr } from "@/hooks/swr/useQueryContentSwr"
import { useQueryModuleSwr } from "@/hooks/swr/useQueryModuleSwr"
import { useQueryCourseOutlineSwr } from "@/hooks/swr/useQueryCourseOutlineSwr"
import { useQueryContentReactionsSwr } from "@/hooks/swr/useQueryContentReactionsSwr"
import { useMutateReactContentSwr } from "@/hooks/swr/useMutateReactContentSwr"
import { useQueryContentCommentsSwr } from "@/hooks/swr/useQueryContentCommentsSwr"
import { useMutateSubmitContentCommentSwr } from "@/hooks/swr/useMutateSubmitContentCommentSwr"
import { useRepoSandpackFiles } from "@/hooks/swr/useRepoSandpackFiles"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import type { ContentBody } from "@/modules/api/graphql/queries/types/content"
import { useLearnMobileView } from "@/components/layouts/LearnShellLayout"
import { useGlobalAiChat } from "@/components/layouts/GlobalAiChatLayout"
import type { ContentFaceId } from "@/components/blocks/learn/ContentTabRow/component"
import {
    CONTENT_AI_SELECTION_MAX,
    CONTENT_AI_SELECTION_MIN,
} from "@/modules/ai/content-ai-selection-context"
import { sandboxFileCode, type SandboxCodeSelection } from "@/modules/code/sandbox-repo"
import { filterCourseOutlineModules } from "@/modules/learn/course-outline"
import type { SandpackFiles } from "@codesandbox/sandpack-react"
import {
    CourseLearnContentPageBase,
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

const mobileViewOf = (isMobile: boolean, view: string): "contents" | "lesson" | "outline" | undefined => {
    if (!isMobile) return undefined
    if (view === "contents" || view === "outline") return view
    return "lesson"
}
const discussionStateOf = (failed: boolean, pending: boolean, submitting: boolean, commentCount: number) => {
    if (failed) return "failed" as const
    if (pending) return "pending" as const
    if (submitting) return "submitting" as const
    return commentCount === 0 ? "empty" as const : "ready" as const
}

const outlineDepthOf = (depth: number) => {
    if (depth <= 1) return 1 as const
    if (depth === 2) return 2 as const
    return 3 as const
}

const contentStateOf = (pending: boolean, failed: boolean, locked: boolean): CourseLearnContentPageState => {
    if (pending) return "pending"
    if (failed) return "failed"
    return locked ? "locked" : "ready"
}

const sourceStateOf = (failed: boolean, pending: boolean) => {
    if (failed) return "failed" as const
    return pending ? "pending" as const : "ready" as const
}

const noticeTextOf = (locked: boolean, failed: boolean, lockedText: string, failedText: string) => {
    if (locked) return lockedText
    if (failed) return failedText
    return undefined
}

const LANGUAGE_LABELS: Readonly<Record<string, string>> = {
    typescript: "TypeScript",
    javascript: "JavaScript",
    java: "Java",
    csharp: "C#",
    "c-sharp": "C#",
    go: "Go",
    golang: "Go",
    python: "Python",
    cpp: "C++",
}

/** Human-facing language name without changing the source identity used by the tab. */
const languageLabelOf = (language: string): string => LANGUAGE_LABELS[language.toLowerCase()] ?? language

/** Pick the routed locale first, then the authored default body. */
const localizedBodyOf = (contentBody: ContentBody, locale: string): string =>
    contentBody.translations.find((translation) => translation.locale === locale)?.body
    ?? contentBody.body
    ?? ""

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
            depth: outlineDepthOf(depth),
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
    const contentHomeT = useTranslations("learn.contentHome")
    const locale = useLocale()
    const reactionText = useTranslations("dashboard.explore.reactions")
    const router = useRouter()
    const content = useQueryContentSwr({ id: input.contentId })
    const module = useQueryModuleSwr({ id: input.moduleId })
    const courseOutline = useQueryCourseOutlineSwr(input.displayId)
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
    const [contentSearch, setContentSearch] = useState("")
    const [expandedModuleIds, setExpandedModuleIds] = useState<ReadonlySet<string>>(new Set([input.moduleId]))
    const [selectedFace, setSelectedFace] = useState<ContentFaceId>("reading")
    const [selectedLanguage, setSelectedLanguage] = useState<string>()
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
    const state = contentStateOf(isPending, hasFailed, isLocked)

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

    const languageBodies = useMemo(
        () => [...(content.data?.bodies ?? [])].sort((first, second) => first.orderIndex - second.orderIndex),
        [content.data?.bodies],
    )
    const activeLanguage = languageBodies.some((candidate) => candidate.lang === selectedLanguage)
        ? selectedLanguage
        : languageBodies[0]?.lang
    const activeLanguageBody = languageBodies.find((candidate) => candidate.lang === activeLanguage)
    const body = activeLanguageBody === undefined
        ? content.data?.body
        : localizedBodyOf(activeLanguageBody, locale)
    const pageOutline = useMemo(() => body === undefined ? [] : outlineOf(body), [body])

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
    const filteredCourseModules = useMemo(
        () => filterCourseOutlineModules(courseOutline.data?.modules ?? [], contentSearch),
        [contentSearch, courseOutline.data?.modules],
    )

    useEffect(() => {
        setExpandedModuleIds((current) => new Set([...current, input.moduleId]))
    }, [input.moduleId])

    const onSearchContent = (query: string) => {
        setContentSearch(query)
        const matches = filterCourseOutlineModules(courseOutline.data?.modules ?? [], query)
        setExpandedModuleIds(query.trim() === ""
            ? new Set([input.moduleId])
            : new Set(matches.map((courseModule) => courseModule.id)))
    }

    const onToggleModule = (moduleId: string, isOpen: boolean) => {
        setExpandedModuleIds((current) => {
            const next = new Set(current)
            if (isOpen) next.add(moduleId)
            else next.delete(moduleId)
            return next
        })
    }
    const lessonRoutes = useMemo(() => new Map(
        (courseOutline.data?.modules ?? []).flatMap((courseModule) => courseModule.lessons.map((lesson) => [
            lesson.id,
            courseModule.id,
        ] as const)),
    ), [courseOutline.data?.modules])
    const activeLesson = courseOutline.data?.modules
        .flatMap((courseModule) => courseModule.lessons)
        .find((lesson) => lesson.id === input.contentId)
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
    const discussionState = discussionStateOf(discussionFailed, discussionPending, submitComment.isMutating, discussionComments.length)

    const openContent = (id: string) => {
        const targetModuleId = lessonRoutes.get(id) ?? input.moduleId
        router.push(`/courses/${input.displayId}/learn/content/modules/${targetModuleId}/contents/${id}`)
    }

    let act: (() => void) | undefined
    if (isLocked) {
        act = () => router.push(`/courses/${input.displayId}`)
    } else if (hasFailed) {
        act = () => {
            void Promise.all([
                content.mutate(),
                module.mutate(),
                courseOutline.mutate(),
                reactions.mutate(),
            ])
        }
    }

    return (
        <CourseLearnContentPageBase
            state={state}
            props={{
                labels: {
                    navCourse: t("navCourse"),
                    navModule: module.data?.title ?? t("navModule"),
                    facesLabel: t("facesLabel"),
                    searchPlaceholder: t("searchPlaceholder"),
                    searchLabel: t("searchLabel"),
                    searchClearLabel: t("searchClearLabel"),
                    resizeRail: t("resizeRail"),
                    outlineTitle: t("outlineTitle"),
                    pageLabel: t("pageLabel"),
                    previousLabel: t("previousLabel"),
                    nextLabel: t("nextLabel"),
                    reactionsLabel: t("reactionsLabel"),
                    reactionPrompt: t("reactionPrompt"),
                    nextTitle: t("nextTitle"),
                },
                mobileView: mobileViewOf(isMobile, view),
                title: content.data?.title,
                description: content.data?.description ?? undefined,
                facts: content.data == null ? [] : [contentHomeT("lessonFact", {
                    minutes: content.data.minutesRead,
                    status: activeLesson?.isRead === true
                        ? contentHomeT("lessonRead")
                        : contentHomeT("lessonUnread"),
                })],
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
                languagesLabel: t("languagesLabel"),
                languages: languageBodies.map((languageBody) => ({
                    id: languageBody.lang,
                    label: languageLabelOf(languageBody.lang),
                })),
                selectedLanguage: activeLanguage,
                ...(selectedFace !== "source" || !hasSource ? {} : {
                    sourceState: sourceStateOf(source.error !== undefined, source.data === undefined),
                    source: {
                        files: sourceFiles,
                        dependencies: source.dependencies,
                        activePath: activeSourcePath,
                        editedPaths: editedSourcePaths,
                        ...(sourceRuntimeError === undefined ? {} : { runtimeError: sourceRuntimeError }),
                        filesLabel: t("sourceFiles"),
                        editorLabel: t("sourceEditor"),
                        previewLabel: t("sourcePreview"),
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
                noticeMessage: noticeTextOf(isLocked, hasFailed, t("lockedMessage"), t("failedMessage")),
                noticeActionLabel: noticeTextOf(isLocked, hasFailed, t("lockedAction"), t("failedAction")),
                outline: pageOutline,
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
                courseProgress: courseOutline.data === null || courseOutline.data === undefined ? undefined : {
                    label: contentHomeT("progressLabel"),
                    value: courseOutline.data.progress.lessonsRead,
                    total: courseOutline.data.progress.lessonsTotal,
                },
                modules: courseOutline.data === null || courseOutline.data === undefined
                    ? module.data === null || module.data === undefined ? [] : [{
                        id: module.data.id,
                        title: module.data.title,
                        countLabel: t("moduleCount", { total: module.data.numContents }),
                        isOpen: expandedModuleIds.has(module.data.id),
                        contents: ordered.map((sibling) => ({
                            id: sibling.id,
                            title: sibling.title,
                            isCurrent: sibling.id === input.contentId,
                        })),
                    }]
                    : filteredCourseModules.map((courseModule) => ({
                        id: courseModule.id,
                        title: courseModule.title,
                        countLabel: t("moduleCount", { total: courseModule.lessons.length }),
                        isOpen: expandedModuleIds.has(courseModule.id),
                        contents: courseModule.lessons.map((lesson) => ({
                            id: lesson.id,
                            title: lesson.title,
                            meta: t("minutes", { minutes: lesson.minutesRead }),
                            isComplete: lesson.isRead,
                            isCurrent: lesson.id === input.contentId,
                        })),
                    })),
                page: position === -1 ? 1 : position + 1,
                totalPages: ordered.length === 0 ? 1 : ordered.length,
            }}
            on={{
                changePage: (page: number) => {
                    const target = ordered[page - 1]
                    if (target === undefined) return
                    openContent(target.id)
                },
                searchContent: onSearchContent,
                toggleModule: onToggleModule,
                openContent,
                goCourse: () => router.push(`/courses/${input.displayId}`),
                goModule: () => router.push(`/courses/${input.displayId}/learn/content/modules/${input.moduleId}`),
                act,
                selectReading: () => setSelectedFace("reading"),
                selectLanguage: setSelectedLanguage,
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
