"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useMutateSubmitContentChallengeSwr } from "@/hooks/swr/useMutateSubmitContentChallengeSwr"
import { useMutateSyncContentChallengeSwr } from "@/hooks/swr/useMutateSyncContentChallengeSwr"
import { useQueryContentChallengeSubmissionsSwr } from "@/hooks/swr/useQueryContentChallengeSubmissionsSwr"
import { useQueryContentChallengeProgressSwr } from "@/hooks/swr/useQueryContentChallengeProgressSwr"
import { useQueryContentSwr } from "@/hooks/swr/useQueryContentSwr"
import { useQueryCourseOutlineSwr } from "@/hooks/swr/useQueryCourseOutlineSwr"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { filterCourseOutlineModules } from "@/modules/learn/course-outline"
import { useGlobalAiChat } from "@/modules/ai/global-ai-chat-context"
import { ChallengeAttemptHistoryDrawer } from "@/components/overlays/learn/ChallengeAttemptHistoryDrawer"
import { ChallengeGradingModelDrawer } from "@/components/overlays/learn/ChallengeGradingModelDrawer"
import { CourseLearnAiDrawer } from "@/components/overlays/learn/CourseLearnAiDrawer"
import type {
    ContentChallengeRequirementLang,
    ContentChallengeStepLang,
    ContentChallengeTextLang,
} from "@/modules/api/graphql/queries/types/content"
import {
    normalizeContentAiSelection,
    type ContentAiSelectionContext,
} from "@/modules/ai/content-ai-selection-context"
import {
    CourseLearnChallengeBlockBase,
    type CourseLearnChallengeBlockState,
} from "./component"

/** Route identity required to resolve one challenge inside a lesson. */
export type CourseLearnChallengeBlockProps = {
    readonly displayId: string
    readonly moduleId: string
    readonly contentId: string
    readonly challengeId: string
}

type AuthoredOrder = { readonly orderIndex: number; readonly sortIndex: number }
type ChallengeLanguageRow = AuthoredOrder & { readonly lang: string }
const byAuthoredOrder = (first: AuthoredOrder, second: AuthoredOrder) => (
    first.sortIndex - second.sortIndex || first.orderIndex - second.orderIndex
)
const selectChallengeLanguage = <T extends ChallengeLanguageRow>(
    rows: ReadonlyArray<T>,
    language: string | undefined,
): T | undefined => {
    const ordered = [...rows].sort(byAuthoredOrder)
    return ordered.find((row) => row.lang === language)
        ?? ordered.find((row) => row.lang === "agnostic")
        ?? ordered[0]
}

/** Resolves a Challenge, persists its complete draft and submits one logical whole-attempt group. */
export const CourseLearnChallengeBlock = (props: CourseLearnChallengeBlockProps) => {
    const input = { ...props }
    const contentText = useTranslations("learn.content")
    const contentHomeText = useTranslations("learn.contentHome")
    const router = useRouter()
    const globalAi = useGlobalAiChat()
    const content = useQueryContentSwr({ id: input.contentId })
    const course = useQueryCourseSwr({ displayId: input.displayId })
    const courseOutline = useQueryCourseOutlineSwr(input.displayId)
    const progress = useQueryContentChallengeProgressSwr(course.data?.id)
    const submission = useMutateSubmitContentChallengeSwr()
    const draftSync = useMutateSyncContentChallengeSwr()
    const [urls, setUrls] = useState<Readonly<Record<string, string>>>({})
    const [contentSearch, setContentSearch] = useState("")
    const [expandedModuleIds, setExpandedModuleIds] = useState<ReadonlySet<string>>(new Set([input.moduleId]))
    const [isCourseMapOpen, setIsCourseMapOpen] = useState(false)
    const [expandedRequirementIds, setExpandedRequirementIds] = useState<ReadonlyArray<string>>([])
    const [expandedStepIds, setExpandedStepIds] = useState<ReadonlyArray<string>>([])
    const [activeSubmissionId, setActiveSubmissionId] = useState<string>()
    const [failedSubmissionId, setFailedSubmissionId] = useState<string>()
    const [submitError, setSubmitError] = useState<string>()
    const [draftRevisions, setDraftRevisions] = useState<Readonly<Record<string, number>>>({})
    const [draftState, setDraftState] = useState<"ready" | "saving" | "saveFailed" | "conflict">("ready")
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false)
    const [isReviewing, setIsReviewing] = useState(false)
    const [isModelDrawerOpen, setIsModelDrawerOpen] = useState(false)
    const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [isSubmissionOpen, setIsSubmissionOpen] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState<string>()
    const [defaultModelId, setDefaultModelId] = useState("auto")
    const [modelOverrides, setModelOverrides] = useState<Readonly<Record<string, string>>>({})
    const [activeSelection, setActiveSelection] = useState<{
        readonly context: ContentAiSelectionContext
        readonly position: { readonly x: number; readonly y: number }
    }>()
    const [aiStarterPrompt, setAiStarterPrompt] = useState<string>()

    useEffect(() => {
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
    }, [input.challengeId])
    const challenges = useMemo(
        () => [...(content.data?.challenges ?? [])].sort((first, second) => first.orderIndex - second.orderIndex),
        [content.data?.challenges],
    )
    const challenge = challenges.find((candidate) => (
        candidate.id === input.challengeId || candidate.displayId === input.challengeId
    ))
    const challengeLanguages = useMemo(() => [...new Set([
        ...(content.data?.bodies?.map((body) => body.lang) ?? []),
        ...(challenge?.requirements?.flatMap((item) => item.langs.map((row) => row.lang)) ?? []),
        ...(challenge?.steps?.flatMap((item) => item.langs.map((row) => row.lang)) ?? []),
        ...(challenge?.outputs?.flatMap((item) => item.langs.map((row) => row.lang)) ?? []),
        ...(challenge?.prerequisites?.flatMap((item) => item.langs.map((row) => row.lang)) ?? []),
    ])], [challenge, content.data?.bodies])
    const persistedSubmissions = useQueryContentChallengeSubmissionsSwr(course.data?.id, challenge?.id)
    const challengeSubmissions = persistedSubmissions.data ?? challenge?.submissions ?? []
    const challengeProgress = progress.data?.find((candidate) => candidate.id === challenge?.id)

    useEffect(() => {
        setSelectedLanguage((current) => (
            current !== undefined && challengeLanguages.includes(current)
                ? current
                : challengeLanguages[0] ?? "agnostic"
        ))
    }, [challengeLanguages])

    useEffect(() => {
        if (!globalAi.isOpen) return
        globalAi.close()
        setAiStarterPrompt(undefined)
        setIsAiDrawerOpen(true)
    }, [globalAi.isOpen])

    useEffect(() => {
        const readSelection = () => {
            const selection = window.getSelection()
            if (selection === null || selection.isCollapsed || selection.rangeCount === 0) {
                setActiveSelection(undefined)
                return
            }
            const container = selection.getRangeAt(0).commonAncestorContainer
            const element = container instanceof HTMLElement ? container : container.parentElement
            const root = element?.closest("main")
            if (root === null || root === undefined) {
                setActiveSelection(undefined)
                return
            }
            const context = normalizeContentAiSelection({ kind: "prose", quote: selection.toString() })
            if (context === null) {
                setActiveSelection(undefined)
                return
            }
            const rect = selection.getRangeAt(0).getBoundingClientRect()
            setActiveSelection({ context, position: { x: rect.left + rect.width / 2, y: rect.top } })
        }
        document.addEventListener("selectionchange", readSelection)
        return () => document.removeEventListener("selectionchange", readSelection)
    }, [])

    useEffect(() => {
        const firstRequirement = [...(challenge?.requirements ?? [])].sort(byAuthoredOrder)[0]
        setExpandedRequirementIds(firstRequirement === undefined ? [] : [firstRequirement.id])
    }, [challenge?.id, challenge?.requirements])

    useEffect(() => {
        if (persistedSubmissions.data === undefined || persistedSubmissions.data === null) return
        const savedSubmissions = persistedSubmissions.data
        setUrls((current) => Object.keys(current).length > 0
            ? current
            : Object.fromEntries(savedSubmissions.map((item) => [item.id, item.userSubmission?.submissionUrl ?? ""])))
        setDraftRevisions(Object.fromEntries(
            savedSubmissions.map((item) => [item.id, item.userSubmission?.draftRevision ?? 0]),
        ))
    }, [persistedSubmissions.data])

    const pending = content.data === undefined
        || course.data === undefined
    const loadFailed = content.error !== undefined
        || course.error !== undefined
        || (content.data !== undefined && (content.data === null || challenge === undefined))
        || (course.data !== undefined && course.data === null)
        || (challenge !== undefined && challengeSubmissions.length === 0)
    const latestAttempts = persistedSubmissions.data?.flatMap((item) => item.userSubmission?.lastAttempt ?? []) ?? []
    const persistedState = latestAttempts.some((attempt) => attempt.status === "evaluating")
        ? "evaluating"
        : latestAttempts.some((attempt) => attempt.status === "evaluation_unavailable")
            ? "evaluationUnavailable"
            : latestAttempts.length > 0 && latestAttempts.every((attempt) => attempt.platformDecision === "passed")
                ? "passed"
                : latestAttempts.some((attempt) => attempt.platformDecision === "needs_revision")
                    ? "needsRevision"
                    : undefined
    const blockState: CourseLearnChallengeBlockState = pending
        ? "pending"
        : activeSubmissionId !== undefined
            ? "submitting"
            : draftState !== "ready"
                ? draftState
                : loadFailed || submitError !== undefined
                    ? "failed"
                    : persistedState ?? (challengeProgress?.completed === true ? "passed" : "ready")
    const resultPath = (submissionId: string) => (
        `/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${input.contentId}`
        + `/challenges/${input.challengeId}/result?submission=${encodeURIComponent(submissionId)}`
    )
    const lessonPath = `/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${input.contentId}`

    const saveDraft = async (): Promise<boolean> => {
        const courseId = course.data?.id
        if (courseId === undefined) return false
        setDraftState("saving")
        setSubmitError(undefined)
        try {
            const saved = await Promise.all(challengeSubmissions.map(async (deliverable) => {
                const result = await draftSync.trigger({
                    courseId,
                    request: {
                        id: deliverable.id,
                        url: urls[deliverable.id]?.trim() ?? "",
                        expectedDraftRevision: draftRevisions[deliverable.id] ?? 0,
                    },
                })
                return [deliverable.id, result.draftRevision] as const
            }))
            setDraftRevisions(Object.fromEntries(saved))
            setDraftState("ready")
            await persistedSubmissions.mutate()
            return true
        } catch (error) {
            const code = (error as { code?: string }).code
            setDraftState(code === "CHALLENGE_DRAFT_REVISION_CONFLICT_EXCEPTION" ? "conflict" : "saveFailed")
            setSubmitError(error instanceof Error ? error.message : contentText("failedMessage"))
            return false
        }
    }

    const submitAttempt = async () => {
        const courseId = course.data?.id
        if (courseId === undefined || challengeSubmissions.some((item) => (urls[item.id]?.trim().length ?? 0) === 0)) return
        setSubmitError(undefined)
        setFailedSubmissionId(undefined)
        const saved = await saveDraft()
        if (!saved) {
            setIsReviewing(false)
            return
        }
        setActiveSubmissionId(challengeSubmissions[0]?.id)
        try {
            const attemptGroupId = crypto.randomUUID()
            const modelIdFor = (deliverableId: string) => modelOverrides[deliverableId] ?? defaultModelId
            const modelFields = (modelId: string) => {
                if (modelId === "auto") return {}
                const separator = modelId.indexOf(":")
                return separator < 0
                    ? { selectedModel: modelId }
                    : { selectedModelProvider: modelId.slice(0, separator), selectedModel: modelId.slice(separator + 1) }
            }
            const modelIds = [...new Set(challengeSubmissions.map((item) => modelIdFor(item.id)))]
            const results = modelIds.length === 1
                ? [await submission.trigger({
                    courseId,
                    request: {
                        challengeSubmissionId: challengeSubmissions[0]?.id ?? "",
                        deliverables: challengeSubmissions.map((deliverable) => ({
                            challengeSubmissionId: deliverable.id,
                            idempotencyKey: crypto.randomUUID(),
                        })),
                        attemptGroupId,
                        lang: selectedLanguage === "agnostic" ? undefined : selectedLanguage,
                        ...modelFields(modelIds[0] ?? "auto"),
                    },
                })]
                : await Promise.all(challengeSubmissions.map((deliverable) => submission.trigger({
                    courseId,
                    request: {
                        challengeSubmissionId: deliverable.id,
                        idempotencyKey: crypto.randomUUID(),
                        attemptGroupId,
                        lang: selectedLanguage === "agnostic" ? undefined : selectedLanguage,
                        ...modelFields(modelIdFor(deliverable.id)),
                    },
                })))
            const first = challengeSubmissions[0]
            const flattened = results.flatMap((result) => result.items === undefined
                ? [{ challengeSubmissionId: challengeSubmissions[0]?.id ?? "", jobId: result.jobId, attemptId: result.attemptId }]
                : [...result.items])
            const firstResult = flattened[0]
            if (first !== undefined && firstResult !== undefined) {
                const jobs = flattened.map((item) => item.jobId)
                router.push(`${resultPath(first.id)}&attempt=${encodeURIComponent(firstResult.attemptId)}&attemptGroup=${encodeURIComponent(attemptGroupId)}&jobs=${encodeURIComponent(jobs.join(","))}`)
            }
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : contentText("failedMessage"))
            setFailedSubmissionId(challengeSubmissions[0]?.id)
            setIsReviewing(false)
        } finally {
            setActiveSubmissionId(undefined)
        }
    }

    const filteredModules = useMemo(
        () => filterCourseOutlineModules(courseOutline.data?.modules ?? [], contentSearch),
        [contentSearch, courseOutline.data?.modules],
    )

    useEffect(() => {
        setExpandedModuleIds((current) => new Set([...current, input.moduleId]))
    }, [input.moduleId])

    const onSearchCourseMap = (query: string) => {
        setContentSearch(query)
        const matches = filterCourseOutlineModules(courseOutline.data?.modules ?? [], query)
        setExpandedModuleIds(query.trim() === ""
            ? new Set([input.moduleId])
            : new Set(matches.map((courseModule) => courseModule.id)))
    }

    const onToggleCourseMapModule = (moduleId: string, isOpen: boolean) => {
        setExpandedModuleIds((current) => {
            const next = new Set(current)
            if (isOpen) next.add(moduleId)
            else next.delete(moduleId)
            return next
        })
    }
    const courseMapRoutes = useMemo(() => {
        const entries = (courseOutline.data?.modules ?? []).flatMap((courseModule) => (
            courseModule.lessons.flatMap((lesson): ReadonlyArray<readonly [string, string]> => [
                [
                    `lesson:${lesson.id}`,
                    `/courses/${input.displayId}/learn/content/modules/${courseModule.id}/contents/${lesson.id}`,
                ],
                ...lesson.challenges.map((candidate): readonly [string, string] => [
                    `challenge:${candidate.id}`,
                    `/courses/${input.displayId}/learn/content/modules/${courseModule.id}/contents/${lesson.id}/challenges/${candidate.id}`,
                ]),
            ])
        ))
        return new Map(entries)
    }, [courseOutline.data?.modules, input.displayId])
    const courseMapState = courseOutline.data === undefined
        ? courseOutline.error === undefined ? "pending" : "failed"
        : courseOutline.data === null || filteredModules.length === 0
            ? "empty"
            : courseOutline.error === undefined ? "ready" : "partial"
    const maximumScore = challengeProgress?.maxScore ?? challenge?.score ?? 0
    const isPassed = blockState === "passed"
    const allDraftsComplete = challengeSubmissions.length > 0
        && challengeSubmissions.every((deliverable) => (urls[deliverable.id]?.trim().length ?? 0) > 0)
    const draftStatus = draftState === "saving"
        ? contentText("challengeDraftSaving")
        : draftState === "saveFailed"
            ? contentText("challengeDraftSaveFailed")
            : draftState === "conflict"
                ? contentText("challengeDraftConflict")
                : contentText("challengeDraftSaved")
    const prerequisites = [...(challenge?.prerequisites ?? [])].sort(byAuthoredOrder).flatMap((item) => {
        const row = selectChallengeLanguage<ContentChallengeTextLang>(item.langs, selectedLanguage)
        return row?.text === null || row?.text === undefined || row.text.trim() === ""
            ? []
            : [{ id: item.id, body: row.text }]
    })
    const requirements = [...(challenge?.requirements ?? [])].sort(byAuthoredOrder).flatMap((item) => {
        const row = selectChallengeLanguage<ContentChallengeRequirementLang>(item.langs, selectedLanguage)
        if (row === undefined || row.title === null || row.title.trim() === "") return []
        return [{ id: item.id, title: row.title, body: row.body ?? undefined, score: row.score }]
    })
    const steps = useMemo(() => [...(challenge?.steps ?? [])].sort(byAuthoredOrder).flatMap((item) => {
        const row = selectChallengeLanguage<ContentChallengeStepLang>(item.langs, selectedLanguage)
        if (row === undefined || ((row.title?.trim().length ?? 0) === 0 && (row.body?.trim().length ?? 0) === 0)) return []
        return [{ id: item.id, title: row.title ?? undefined, body: row.body ?? row.title ?? "" }]
    }), [challenge?.steps, selectedLanguage])
    const outputs = [...(challenge?.outputs ?? [])].sort(byAuthoredOrder).flatMap((item) => {
        const row = selectChallengeLanguage<ContentChallengeTextLang>(item.langs, selectedLanguage)
        return row?.text === null || row?.text === undefined || row.text.trim() === ""
            ? []
            : [{ id: item.id, body: row.text }]
    })

    useEffect(() => {
        setExpandedStepIds((current) => {
            const validIds = new Set(steps.map((step) => step.id))
            const retained = current.filter((id) => validIds.has(id))
            if (retained.length > 0 || steps[0] === undefined) return retained
            return [steps[0].id]
        })
    }, [steps])

    return (
        <CourseLearnChallengeBlockBase
            blockState={blockState}
            props={{
                displayId: input.displayId,
                courseId: course.data?.id,
                challengeId: challenge?.id ?? input.challengeId,
                title: challenge?.title ?? contentText("failedMessage"),
                courseTitle: course.data?.title ?? input.displayId,
                moduleTitle: courseOutline.data?.modules.find((item) => item.id === input.moduleId)?.title ?? input.moduleId,
                contentTitle: content.data?.title ?? input.contentId,
                description: challenge?.description ?? "",
                difficultyLabel: challenge === undefined
                    ? ""
                    : contentText(`challengeDifficulty.${challenge.difficulty}`),
                statusLabel: isPassed
                    ? contentText("challengePassed")
                    : contentText("challengeNotSubmitted"),
                hint: challenge?.hint ?? undefined,
                prerequisites,
                requirements,
                steps,
                outputs,
                maximumScore,
                expandedRequirementIds,
                expandedStepIds,
                failedSubmissionId,
                notice: submitError ?? (loadFailed ? contentText("failedMessage") : undefined),
                draftStatus,
                isConfirmOpen,
                isExitConfirmOpen,
                isReviewing,
                isModelDrawerOpen,
                isAiDrawerOpen,
                allDraftsComplete,
                isCourseMapOpen,
                isSubmissionOpen,
                languageOptions: challengeLanguages.length === 0
                    ? [{ id: "agnostic", label: contentText("challengeLanguageAgnostic") }]
                    : challengeLanguages.map((language) => ({ id: language, label: language })),
                selectedLanguage,
                defaultModelId,
                aiSelection: activeSelection?.context,
                aiSelectionPosition: activeSelection?.position,
                aiStarterPrompt,
                courseMap: {
                    state: courseMapState,
                    props: {
                        labels: {
                            progress: contentHomeText("progressLabel"),
                            searchPlaceholder: contentText("searchPlaceholder"),
                            searchLabel: contentText("searchLabel"),
                            searchClearLabel: contentText("searchClearLabel"),
                            failed: contentText("failedMessage"),
                        },
                        completionPercent: courseOutline.data?.progress.completionPercent,
                        progressFact: courseOutline.data === null || courseOutline.data === undefined
                            ? undefined
                            : `${courseOutline.data.progress.lessonsRead}/${courseOutline.data.progress.lessonsTotal}`,
                        modules: filteredModules.map((courseModule) => {
                            const lessons = courseModule.lessons.flatMap((lesson) => [
                                {
                                    id: `lesson:${lesson.id}`,
                                    title: lesson.title,
                                    meta: contentText("minutes", { minutes: lesson.minutesRead }),
                                    isComplete: lesson.isRead,
                                    isCurrent: false,
                                },
                                ...lesson.challenges.map((candidate) => ({
                                    id: `challenge:${candidate.id}`,
                                    title: candidate.title,
                                    meta: contentText("challengePoints", { score: candidate.maxScore }),
                                    isComplete: candidate.completed,
                                    isCurrent: candidate.id === challenge?.id,
                                })),
                            ])
                            const completed = lessons.filter((lesson) => lesson.isComplete).length
                            return {
                                id: courseModule.id,
                                title: courseModule.title,
                                countLabel: contentText("moduleProgress", { completed, total: lessons.length }),
                                progressLabel: contentText("moduleProgressLabel", { module: courseModule.title }),
                                completionPercent: lessons.length === 0 ? 0 : Math.round(completed / lessons.length * 100),
                                isOpen: expandedModuleIds.has(courseModule.id),
                                lessons,
                            }
                        }),
                    },
                },
                deliverables: [...challengeSubmissions]
                    .sort((first, second) => first.sortIndex - second.sortIndex)
                    .map((deliverable) => ({
                        id: deliverable.id,
                        title: deliverable.title,
                        description: deliverable.description ?? undefined,
                        score: deliverable.score,
                        url: urls[deliverable.id] ?? "",
                        modelId: modelOverrides[deliverable.id] ?? defaultModelId,
                        modelLabel: (modelOverrides[deliverable.id] ?? defaultModelId) === "auto"
                            ? contentText("challengeModelAuto")
                            : (modelOverrides[deliverable.id] ?? defaultModelId).split(":").at(-1) ?? defaultModelId,
                    })),
                labels: {
                    backToLesson: contentText("challengeBackToLesson"),
                    openCourseMap: contentText("challengeCourseMap"),
                    brief: contentText("challengeBrief"),
                    deliverables: contentText("challengeDeliverables"),
                    prerequisites: contentText("challengePrerequisites"),
                    requirements: contentText("challengeRequirements"),
                    steps: contentText("challengeSteps"),
                    expectedOutputs: contentText("challengeExpectedOutputs"),
                    hintLabel: contentText("challengeHint"),
                    evidenceLabel: contentText("challengeEvidenceLabel"),
                    repositoryPlaceholder: contentText("challengeRepositoryPlaceholder"),
                    saved: contentText("challengeSaved"),
                    required: contentText("challengeEvidenceRequired"),
                    validEvidence: contentText("challengeEvidenceValid"),
                    saveDraft: contentText("challengeSaveDraft"),
                    retrySave: contentText("challengeRetrySave"),
                    submitAttempt: contentText("challengeSubmitAttempt"),
                    confirmTitle: contentText("challengeConfirmTitle"),
                    confirmDescription: contentText("challengeConfirmDescription"),
                    confirmSubmit: contentText("challengeConfirmSubmit"),
                    cancel: contentText("challengeCancel"),
                    breadcrumb: contentText("challengeBreadcrumb"),
                    retry: contentText("challengeRetry"),
                    result: contentText("challengeResult"),
                    points: (score) => contentText("challengePoints", { score }),
                    readinessTitle: contentText("challengeReadinessTitle"),
                    readinessReady: contentText("challengeReadinessReady"),
                    readinessIncomplete: (complete, total) => contentText("challengeReadinessIncomplete", { complete, total }),
                    reviewAttempt: contentText("challengeReviewAttempt"),
                    reviewTitle: contentText("challengeReviewTitle"),
                    reviewDescription: contentText("challengeReviewDescription"),
                    returnToEdit: contentText("challengeReturnToEdit"),
                    gradingModel: contentText("challengeGradingModel"),
                    changeModel: contentText("challengeChangeModel"),
                    language: contentText("challengeLanguage"),
                    askAi: contentText("challengeAskAi"),
                    explainSelection: contentText("challengeExplainSelection"),
                    translateSelection: contentText("challengeTranslateSelection"),
                    dismissSelection: contentText("challengeDismissSelection"),
                    saveAndExit: contentText("challengeExit"),
                    history: contentText("challengeHistoryTitle"),
                    analysisPlan: contentText("challengeAnalysisPlan"),
                    cachePolicy: contentText("challengeCachePolicy"),
                    openSubmission: contentText("challengeOpenSubmission"),
                    closeSubmission: contentText("challengeCloseSubmission"),
                    workspaceLabel: contentText("challengeWorkspaceLabel"),
                    contentView: contentText("challengeContentView"),
                    exitTitle: contentText("challengeExitTitle"),
                    exitDescription: contentText("challengeExitDescription"),
                    exitWithoutSaving: contentText("challengeExitWithoutSaving"),
                },
            }}
            historyOverlay={ChallengeAttemptHistoryDrawer}
            historyOverlayProps={{
                isOpen: isHistoryOpen,
                courseId: course.data?.id,
                submissionId: challengeSubmissions[0]?.id,
                selectedAttemptId: activeSubmissionId,
                onDismiss: () => setIsHistoryOpen(false),
                onSelect: () => {
                    setIsHistoryOpen(false)
                    const submissionId = challengeSubmissions[0]?.id
                    if (submissionId !== undefined) router.push(resultPath(submissionId))
                },
            }}
            modelOverlay={ChallengeGradingModelDrawer}
            modelOverlayProps={{
                isOpen: isModelDrawerOpen,
                selectedDefaultModelId: defaultModelId,
                deliverables: challengeSubmissions.map((item) => ({ id: item.id, title: item.title, selectedModelId: modelOverrides[item.id] ?? defaultModelId })),
                onDismiss: () => setIsModelDrawerOpen(false),
                onSelectDefault: setDefaultModelId,
                onApplyAll: () => {
                    setModelOverrides(Object.fromEntries(challengeSubmissions.map((item) => [item.id, defaultModelId])))
                    setIsModelDrawerOpen(false)
                },
                onOverride: (deliverableId, modelId) => setModelOverrides((current) => ({ ...current, [deliverableId]: modelId })),
            }}
            aiOverlay={CourseLearnAiDrawer}
            aiOverlayProps={{
                isOpen: isAiDrawerOpen,
                displayId: input.displayId,
                courseId: course.data?.id,
                challengeId: challenge?.id ?? input.challengeId,
                challengeTitle: challenge?.title ?? contentText("failedMessage"),
                selection: activeSelection?.context,
                initialPrompt: aiStarterPrompt,
                onDismiss: () => setIsAiDrawerOpen(false),
                onClearSelection: () => {
                    setActiveSelection(undefined)
                    globalAi.clearCodeContext()
                },
            }}
            on={{
                requestExit: () => {
                    if (Object.values(urls).some((url) => url.trim().length > 0) && !isPassed) {
                        setIsExitConfirmOpen(true)
                        return
                    }
                    router.push(lessonPath)
                },
                cancelExit: () => setIsExitConfirmOpen(false),
                confirmExit: () => {
                    setIsExitConfirmOpen(false)
                    router.push(lessonPath)
                },
                openCourseMap: () => setIsCourseMapOpen(true),
                closeCourseMap: () => setIsCourseMapOpen(false),
                searchCourseMap: onSearchCourseMap,
                toggleCourseMapModule: onToggleCourseMapModule,
                openCourseMapItem: (id) => {
                    const path = courseMapRoutes.get(id)
                    if (path !== undefined) router.push(path)
                    setIsCourseMapOpen(false)
                },
                toggleRequirement: (id, isOpen) => setExpandedRequirementIds((current) => (
                    isOpen
                        ? [...new Set([...current, id])]
                        : current.filter((candidate) => candidate !== id)
                )),
                toggleStep: (id, isOpen) => setExpandedStepIds((current) => (
                    isOpen
                        ? [...new Set([...current, id])]
                        : current.filter((candidate) => candidate !== id)
                )),
                changeUrl: (id, value) => setUrls((current) => ({ ...current, [id]: value })),
                saveDraft: () => { void saveDraft() },
                reviewAttempt: () => setIsReviewing(true),
                returnToEdit: () => setIsReviewing(false),
                submitAttempt: () => setIsConfirmOpen(true),
                cancelSubmit: () => setIsConfirmOpen(false),
                confirmSubmit: () => {
                    setIsConfirmOpen(false)
                    void submitAttempt()
                },
                retry: (id) => {
                    if (id !== undefined) {
                        setIsConfirmOpen(true)
                        return
                    }
                    setSubmitError(undefined)
                    setFailedSubmissionId(undefined)
                    void Promise.all([content.mutate(), course.mutate(), courseOutline.mutate(), progress.mutate()])
                },
                openResult: (id) => router.push(resultPath(id)),
                openCourse: () => router.push(`/courses/${input.displayId}/learn`),
                openModule: () => router.push(lessonPath),
                openContent: () => router.push(lessonPath),
                selectLanguage: setSelectedLanguage,
                openModelDrawer: () => setIsModelDrawerOpen(true),
                closeModelDrawer: () => setIsModelDrawerOpen(false),
                selectDefaultModel: setDefaultModelId,
                applyDefaultModel: () => {
                    setModelOverrides(Object.fromEntries(challengeSubmissions.map((item) => [item.id, defaultModelId])))
                    setIsModelDrawerOpen(false)
                },
                overrideModel: (deliverableId, modelId) => setModelOverrides((current) => ({ ...current, [deliverableId]: modelId })),
                openAi: () => {
                    setAiStarterPrompt(undefined)
                    setIsAiDrawerOpen(true)
                },
                openHistory: () => setIsHistoryOpen(true),
                toggleSubmission: () => setIsSubmissionOpen((current) => !current),
                closeAi: () => setIsAiDrawerOpen(false),
                explainSelection: () => {
                    setAiStarterPrompt(contentText("challengeExplainSelectionPrompt"))
                    setIsAiDrawerOpen(true)
                },
                translateSelection: () => {
                    setAiStarterPrompt(contentText("challengeTranslateSelectionPrompt"))
                    setIsAiDrawerOpen(true)
                },
                dismissSelection: () => setActiveSelection(undefined),
                clearAiSelection: () => {
                    setActiveSelection(undefined)
                    globalAi.clearCodeContext()
                },
            }}
        />
    )
}

/** Architectural identity for the connected challenge twin. */
