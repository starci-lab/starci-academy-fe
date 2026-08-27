import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { ModalBranch } from "@/components/branches/ModalBranch"
import { SurfaceAccordionCard } from "@/components/branches/SurfaceAccordionCard"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { courseContentMapPanel, type CourseContentMapBaseProps } from "@/components/blocks/learn/CourseContentMap/component"
import { ChallengeGradingModelDrawer } from "@/components/overlays/learn/ChallengeGradingModelDrawer"
import { CourseLearnAiDrawer } from "@/components/overlays/learn/CourseLearnAiDrawer"
import { StarCiAiSelectionAskBase } from "@/components/blocks/ai/StarCiAiSelectionAsk/component"
import { Field } from "@/components/composites/Field"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import { Badge } from "@/components/leaves/Badge"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { Select } from "@/components/leaves/Select"
import { Text } from "@/components/leaves/Text"
import type { ContentAiSelectionContext } from "@/modules/ai/content-ai-selection-context"

/** One authored deliverable and the learner-owned evidence/model snapshot being prepared. */
export type CourseLearnChallengeDeliverable = {
    readonly id: string; readonly title: string; readonly description?: string; readonly score: number
    readonly url?: string; readonly modelId?: string; readonly modelLabel?: string
}
/** Every persisted or transient state rendered by the Challenge workspace. */
export type CourseLearnChallengeBlockState = "pending" | "ready" | "saving" | "saveFailed" | "conflict" | "submitting" | "evaluating" | "evaluationUnavailable" | "passed" | "needsRevision" | "failed"
/** Localized copy required by the pure Challenge renderer. */
export type CourseLearnChallengeLabels = {
    readonly backToLesson: string; readonly openCourseMap: string; readonly brief: string; readonly deliverables: string
    readonly repositoryPlaceholder: string; readonly saved: string; readonly required?: string; readonly validEvidence?: string
    readonly saveDraft: string; readonly retrySave: string; readonly submitAttempt: string; readonly confirmTitle: string
    readonly confirmDescription: string; readonly confirmSubmit: string; readonly cancel: string; readonly breadcrumb: string
    readonly retry: string; readonly result: string; readonly points: (score: number) => string
    readonly readinessTitle?: string; readonly readinessReady?: string
    readonly readinessIncomplete?: (complete: number, total: number) => string
    readonly reviewAttempt?: string; readonly reviewTitle?: string; readonly reviewDescription?: string; readonly returnToEdit?: string
    readonly gradingModel?: string; readonly changeModel?: string; readonly language?: string; readonly askAi?: string
    readonly saveAndExit?: string; readonly exitTitle?: string; readonly exitDescription?: string; readonly exitWithoutSaving?: string
    readonly explainSelection?: string; readonly translateSelection?: string; readonly dismissSelection?: string
    readonly closeCourseMap?: string; readonly score?: string; readonly saving?: string; readonly saveFailed?: string
    readonly conflict?: string; readonly submit?: string; readonly submitting?: string
    readonly scoreValue?: (score: number, maximum: number) => string; readonly passing?: (score: number) => string
    readonly scoreCaption?: string
}
/** Closed pure-render contract for the full Challenge workspace branch. */
export type CourseLearnChallengeBlockProps = {
    readonly blockState: CourseLearnChallengeBlockState
    readonly props: {
        readonly displayId?: string; readonly courseId?: string; readonly challengeId?: string
        readonly title: string; readonly courseTitle: string; readonly moduleTitle: string; readonly contentTitle: string
        readonly description: string; readonly difficultyLabel: string; readonly statusLabel: string; readonly hint?: string
        readonly maximumScore: number; readonly deliverables: ReadonlyArray<CourseLearnChallengeDeliverable>
        readonly expandedRequirementIds: ReadonlyArray<string>; readonly failedSubmissionId?: string; readonly notice?: string
        readonly draftStatus?: string; readonly isConfirmOpen: boolean; readonly isExitConfirmOpen?: boolean
        readonly isReviewing?: boolean; readonly isModelDrawerOpen?: boolean; readonly isAiDrawerOpen?: boolean
        readonly allDraftsComplete: boolean; readonly isCourseMapOpen: boolean; readonly courseMap: CourseContentMapBaseProps
        readonly languageOptions?: ReadonlyArray<{ readonly id: string; readonly label: string }>; readonly selectedLanguage?: string
        readonly defaultModelId?: string; readonly aiSelection?: ContentAiSelectionContext
        readonly aiSelectionPosition?: { readonly x: number; readonly y: number }; readonly aiStarterPrompt?: string
        readonly labels: CourseLearnChallengeLabels
        readonly activeSubmissionId?: string; readonly earnedScore?: number
    }
    readonly on?: {
        readonly requestExit?: () => void; readonly cancelExit?: () => void; readonly confirmExit?: () => void
        readonly openCourseMap?: () => void; readonly closeCourseMap?: () => void; readonly searchCourseMap?: (query: string) => void
        readonly toggleCourseMapModule?: (id: string, isOpen: boolean) => void; readonly openCourseMapItem?: (id: string) => void
        readonly toggleRequirement?: (id: string, isOpen: boolean) => void; readonly changeUrl?: (id: string, value: string) => void
        readonly retry?: (id?: string) => void; readonly openResult?: (id: string) => void; readonly saveDraft?: () => void
        readonly reviewAttempt?: () => void; readonly returnToEdit?: () => void; readonly submitAttempt?: () => void
        readonly confirmSubmit?: () => void; readonly cancelSubmit?: () => void
        readonly openCourse?: () => void; readonly openModule?: () => void; readonly openContent?: () => void
        readonly selectLanguage?: (language: string) => void; readonly openModelDrawer?: () => void; readonly closeModelDrawer?: () => void
        readonly selectDefaultModel?: (modelId: string) => void; readonly applyDefaultModel?: () => void
        readonly overrideModel?: (deliverableId: string, modelId: string) => void
        readonly openAi?: () => void; readonly closeAi?: () => void; readonly clearAiSelection?: () => void
        readonly explainSelection?: () => void; readonly translateSelection?: () => void; readonly dismissSelection?: () => void
    }
}
/** Compatibility alias retained for route-level Challenge fixtures. */
export type CourseLearnChallengePageProps = CourseLearnChallengeBlockProps
const restingDeliverables: ReadonlyArray<CourseLearnChallengeDeliverable> = [0, 1].map((index) => ({ id: `resting-${index}`, title: "", score: 0, modelId: "auto", modelLabel: "" }))

type ChallengeRequirementInput = {
    readonly item: CourseLearnChallengeDeliverable
    readonly isLoading: boolean
    readonly isOpen: boolean
    readonly points: (score: number) => string
    readonly onToggle: (isOpen: boolean) => void
}

const buildChallengeRequirement = (input: ChallengeRequirementInput) => defineContractProjection("challenge-requirement-disclosure", () => (
    <SurfaceAccordionCard
        isOpen={input.isOpen}
        summaryContract="challenge-requirement-summary"
        summaryRender={defineContractComponent("challenge-requirement-summary", {
            title: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: input.item.title, size: "sm", weight: "semibold" }} isLoading={input.isLoading} />),
            score: defineLeafComponent("badge", {}, () => <Badge props={{ content: input.points(input.item.score) }} isLoading={input.isLoading} />),
        })}
        bodyContract="challenge-requirement-body"
        bodyRender={defineContractComponent("challenge-requirement-body", {
            description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.item.description, size: "sm", tone: "muted" }} isLoading={input.isLoading} />),
        })}
        onOpenChange={input.onToggle}
    />
))

/** Draw the complete Challenge workspace, review and support overlays without fetching. */
export const CourseLearnChallengeBlockBase = (input: CourseLearnChallengeBlockProps) => {
    const isLoading = input.blockState === "pending"
    const isBusy = input.blockState === "saving" || input.blockState === "submitting" || input.blockState === "evaluating"
    const isPassed = input.blockState === "passed"
    const defaultModelId = input.props.defaultModelId ?? "auto"
    const deliverables = isLoading ? restingDeliverables : input.props.deliverables
    const completedCount = deliverables.filter((item) => (item.url?.trim().length ?? 0) > 0).length
    const labels = {
        required: input.props.labels.required ?? "Required",
        validEvidence: input.props.labels.validEvidence ?? input.props.labels.saved,
        readinessTitle: input.props.labels.readinessTitle ?? input.props.labels.deliverables,
        readinessReady: input.props.labels.readinessReady ?? input.props.labels.saved,
        readinessIncomplete: input.props.labels.readinessIncomplete ?? ((complete: number, total: number) => `${complete}/${total}`),
        reviewAttempt: input.props.labels.reviewAttempt ?? input.props.labels.submitAttempt,
        reviewTitle: input.props.labels.reviewTitle ?? input.props.labels.submitAttempt,
        reviewDescription: input.props.labels.reviewDescription ?? input.props.labels.confirmDescription,
        returnToEdit: input.props.labels.returnToEdit ?? input.props.labels.cancel,
        gradingModel: input.props.labels.gradingModel ?? "Model",
        changeModel: input.props.labels.changeModel ?? "Model",
        language: input.props.labels.language ?? "Language",
        askAi: input.props.labels.askAi ?? "Ask AI",
        saveAndExit: input.props.labels.saveAndExit ?? input.props.labels.backToLesson,
        exitTitle: input.props.labels.exitTitle ?? input.props.labels.backToLesson,
        exitDescription: input.props.labels.exitDescription ?? input.props.labels.confirmDescription,
        exitWithoutSaving: input.props.labels.exitWithoutSaving ?? input.props.labels.backToLesson,
        explainSelection: input.props.labels.explainSelection ?? "Explain selection",
        translateSelection: input.props.labels.translateSelection ?? "Translate selection",
        dismissSelection: input.props.labels.dismissSelection ?? input.props.labels.cancel,
    }
    const courseMap = courseContentMapPanel({ ...input.props.courseMap, on: { search: input.on?.searchCourseMap, toggleModule: input.on?.toggleCourseMapModule, openLesson: input.on?.openCourseMapItem } })
    const requirements = deliverables
        .filter((item) => item.description !== undefined || isLoading)
        .map((item) => buildChallengeRequirement({
            item,
            isLoading,
            isOpen: input.props.expandedRequirementIds.includes(item.id),
            points: input.props.labels.points,
            onToggle: (isOpen) => input.on?.toggleRequirement?.(item.id, isOpen),
        }))
    const brief = defineContractComponent("challenge-brief", {
        overview: defineLeafComponent("text", {}, () => <Text props={{ content: input.props.description }} isLoading={isLoading} />),
        ...(requirements.length === 0 ? {} : { requirement: requirements }),
        ...(input.props.hint === undefined ? {} : { hint: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.hint, size: "sm", tone: "muted", icon: "review" }} />) }),
    })
    const rows = deliverables.map((item) => {
        const failed = input.props.failedSubmissionId === item.id
        const complete = (item.url?.trim().length ?? 0) > 0
        let hint: string | undefined = labels.required
        if (complete) hint = labels.validEvidence
        if (failed) hint = input.props.notice
        return defineContractComponent("challenge-deliverable-row", {
            heading: defineContractComponent("challenge-deliverable-heading", {
                title: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: item.title, size: "sm", weight: "semibold" }} isLoading={isLoading} />),
                score: defineLeafComponent("badge", {}, () => <Badge props={{ content: input.props.labels.points(item.score), tone: isPassed ? "success" : "neutral" }} isLoading={isLoading} />),
            }),
            ...(item.description === undefined ? {} : { description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: item.description, size: "sm", tone: "muted" }} />) }),
            ...(isPassed ? {} : { field: defineCompositeComponent("field", {}, () => (
                <Field
                    props={{ id: `challenge-${item.id}`, name: `challenge-${item.id}`, label: item.title, placeholder: input.props.labels.repositoryPlaceholder, kind: "text", disabled: isBusy, hint, isInvalid: failed }}
                    on={{ change: (value) => input.on?.changeUrl?.(item.id, value) }} isLoading={isLoading}
                />
            )) }),
            status: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: hint, size: "xs", tone: "muted", live: failed ? "assertive" : "polite" }} />),
            model: defineContractComponent("challenge-deliverable-model", {
                value: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: `${labels.gradingModel}: ${item.modelLabel ?? item.modelId ?? defaultModelId}`, size: "xs", tone: "muted" }} />),
                action: defineLeafComponent("button", {}, () => <Button props={{ label: labels.changeModel, variant: "ghost", size: "sm" }} on={{ press: input.on?.openModelDrawer }} />),
            }),
        })
    })
    const deliverableList = defineContractComponent("challenge-deliverable-list", {
        ...(input.blockState === "failed" && deliverables.length === 0 ? {
            notice: defineLeafComponent("text", {}, () => <Text props={{ content: input.props.notice, live: "assertive" }} />),
            recovery: defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.retry, variant: "primary", icon: "retry" }} on={{ press: () => input.on?.retry?.() }} />),
        } : {}),
        ...(rows.length === 0 ? {} : { deliverable: rows }),
    })
    const draftStatus = defineContractComponent("challenge-draft-status", { status: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.draftStatus, size: "sm", tone: "muted", live: "polite" }} />) })
    const summary = defineContractComponent("challenge-attempt-readiness-summary", {
        title: defineLeafComponent("text", { weight: "semibold" }, () => <Text props={{ content: labels.readinessTitle, weight: "semibold" }} />),
        status: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.allDraftsComplete ? labels.readinessReady : labels.readinessIncomplete(completedCount, deliverables.length), size: "sm", tone: "muted", live: "polite" }} />),
        progress: defineLeafComponent("progress", {}, () => <Progress props={{ value: deliverables.length === 0 ? 0 : Math.round(completedCount / deliverables.length * 100), label: labels.readinessTitle }} isLoading={isLoading} />),
        model: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: `${labels.gradingModel}: ${deliverables[0]?.modelLabel ?? ""}`, size: "xs", tone: "muted" }} />),
        draftStatus,
        actions: defineContractComponent("challenge-submission-actions", { action: isPassed
            ? [defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.result, variant: "primary" }} on={{ press: () => input.on?.openResult?.(deliverables[0]?.id ?? "") }} />)]
            : [
                defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.saveDraft, variant: "outline", disabled: isLoading || isBusy, isPending: input.blockState === "saving" }} on={{ press: input.on?.saveDraft }} />),
                defineLeafComponent("button", {}, () => <Button props={{ label: labels.reviewAttempt, variant: "primary", disabled: isLoading || isBusy || !input.props.allDraftsComplete }} on={{ press: input.on?.reviewAttempt ?? input.on?.submitAttempt }} />),
            ] }),
    })
    const review = input.props.isReviewing ? defineContractComponent("challenge-attempt-review", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: labels.reviewTitle, level: 2 }} />),
        description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: labels.reviewDescription, size: "sm", tone: "muted" }} />),
        deliverable: deliverables.map((item) => defineContractComponent("challenge-review-deliverable", {
            title: defineLeafComponent("text", { weight: "semibold" }, () => <Text props={{ content: item.title, weight: "semibold" }} />),
            evidence: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: item.url, size: "sm" }} />),
            model: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: `${labels.gradingModel}: ${item.modelLabel ?? item.modelId ?? defaultModelId}`, size: "xs", tone: "muted" }} />),
        })),
        actions: defineContractComponent("challenge-submission-actions", { action: [
            defineLeafComponent("button", {}, () => <Button props={{ label: labels.returnToEdit, variant: "outline" }} on={{ press: input.on?.returnToEdit }} />),
            defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.submitAttempt, variant: "primary" }} on={{ press: input.on?.submitAttempt }} />),
        ] }),
    }) : undefined
    const main = defineContractComponent("challenge-workspace-main", {
        brief: defineContractProjection("challenge-brief", () => <SurfaceCard props={{ label: input.props.labels.brief }} contract="challenge-brief" render={brief} />),
        deliverables: defineContractProjection("challenge-deliverable-list", () => <SurfaceCard props={{ label: input.props.labels.deliverables }} contract="challenge-deliverable-list" render={deliverableList} />),
        review,
    })
    const page = defineContractComponent("challenge-page-document", {
        breadcrumb: defineLeafComponent("breadcrumbs", {}, () => <Breadcrumbs props={{ label: input.props.labels.breadcrumb, steps: [{ id: "course", label: input.props.courseTitle }, { id: "module", label: input.props.moduleTitle }, { id: "content", label: input.props.contentTitle }, { id: "challenge", label: input.props.title }] }} on={{ course: input.on?.openCourse, module: input.on?.openModule, content: input.on?.openContent }} />),
        mobileMap: defineContractComponent("learn-mobile-course-map-row", {
            action: defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.openCourseMap, variant: "outline", size: "sm", icon: "course" }} on={{ press: input.on?.openCourseMap }} />),
            fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: input.props.courseMap.props.progressFact, size: "xs", tone: "muted" }} />),
        }),
        back: defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.backToLesson, variant: "ghost", size: "sm" }} on={{ press: input.on?.requestExit }} />),
        header: defineContractComponent("challenge-header", {
            title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.title, level: 1 }} isLoading={isLoading} />),
            description: defineLeafComponent("text", {}, () => <Text props={{ content: input.props.description, tone: "muted" }} isLoading={isLoading} />),
            meta: defineContractComponent("profile-fact-run", { fact: [
                defineLeafComponent("badge", {}, () => <Badge props={{ content: input.props.difficultyLabel, tone: "warning" }} isLoading={isLoading} />),
                defineLeafComponent("badge", {}, () => <Badge props={{ content: input.props.labels.points(input.props.maximumScore) }} isLoading={isLoading} />),
                defineLeafComponent("badge", {}, () => <Badge props={{ content: input.props.statusLabel, tone: isPassed ? "success" : "neutral" }} isLoading={isLoading} />),
            ] }),
            actions: defineContractComponent("challenge-header-actions", {
                language: defineLeafComponent("select", {}, () => <Select props={{ id: "challenge-language", name: "challenge-language", label: labels.language, options: input.props.languageOptions ?? [{ id: "agnostic", label: labels.language }], selectedKey: input.props.selectedLanguage }} on={{ select: input.on?.selectLanguage }} />),
                model: defineLeafComponent("button", {}, () => <Button props={{ label: labels.changeModel, variant: "outline", size: "sm" }} on={{ press: input.on?.openModelDrawer }} />),
            }),
        }),
        body: defineContractComponent("challenge-workspace", {
            main,
            summary: defineContractProjection("challenge-attempt-readiness-summary", () => (
                <Tree
                    contract="challenge-attempt-workbench"
                    render={defineContractComponent("challenge-attempt-workbench", { summary })}
                />
            )),
        }),
        actionBar: defineContractComponent("challenge-workspace-action-bar", {
            ai: defineLeafComponent("button", {}, () => <Button props={{ label: labels.askAi, variant: "secondary", icon: "aiChatbot" }} on={{ press: input.on?.openAi }} />),
            exit: defineLeafComponent("button", {}, () => <Button props={{ label: labels.saveAndExit, variant: "ghost" }} on={{ press: input.on?.requestExit }} />),
        }),
        selection: input.props.aiSelection === undefined || input.props.aiSelectionPosition === undefined
            ? undefined
            : defineContractProjection("selection-ai-actions", () => (
                <StarCiAiSelectionAskBase
                    state="ready"
                    props={{
                        selection: input.props.aiSelection as ContentAiSelectionContext,
                        appendLabel: labels.explainSelection,
                        tangentLabel: labels.translateSelection,
                        dismissLabel: labels.dismissSelection,
                        position: input.props.aiSelectionPosition as { readonly x: number; readonly y: number },
                    }}
                    on={{
                        append: input.on?.explainSelection,
                        tangent: input.on?.translateSelection,
                        dismiss: input.on?.dismissSelection,
                    }}
                />
            )),
    })
    const confirmation = defineContractComponent("challenge-submit-confirmation", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.labels.confirmTitle, level: 2 }} />),
        description: defineLeafComponent("text", { tone: "muted" }, () => <Text props={{ content: input.props.labels.confirmDescription, tone: "muted" }} />),
        actions: defineContractComponent("challenge-submission-actions", { action: [
            defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.cancel, variant: "outline" }} on={{ press: input.on?.cancelSubmit }} />),
            defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.confirmSubmit, variant: "primary" }} on={{ press: input.on?.confirmSubmit }} />),
        ] }),
    })
    const exitConfirmation = defineContractComponent("challenge-submit-confirmation", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: labels.exitTitle, level: 2 }} />),
        description: defineLeafComponent("text", { tone: "muted" }, () => <Text props={{ content: labels.exitDescription, tone: "muted" }} />),
        actions: defineContractComponent("challenge-submission-actions", { action: [
            defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.cancel, variant: "outline" }} on={{ press: input.on?.cancelExit }} />),
            defineLeafComponent("button", {}, () => <Button props={{ label: labels.exitWithoutSaving, variant: "primary" }} on={{ press: input.on?.confirmExit }} />),
        ] }),
    })
    return <>
        <Tree contract="challenge-page-document" render={page} />
        {input.props.isCourseMapOpen ? <DrawerBranch isOpen placement="left" title={input.props.labels.openCourseMap} onDismiss={() => input.on?.closeCourseMap?.()} contract="content-map-panel" render={courseMap} /> : null}
        {input.props.isModelDrawerOpen === true ? <ChallengeGradingModelDrawer isOpen selectedDefaultModelId={defaultModelId} deliverables={deliverables.map((item) => ({ id: item.id, title: item.title, selectedModelId: item.modelId ?? defaultModelId }))} onDismiss={() => input.on?.closeModelDrawer?.()} onSelectDefault={input.on?.selectDefaultModel} onApplyAll={input.on?.applyDefaultModel} onOverride={input.on?.overrideModel} /> : null}
        {input.props.isAiDrawerOpen === true ? <CourseLearnAiDrawer isOpen displayId={input.props.displayId ?? input.props.courseTitle} courseId={input.props.courseId} challengeId={input.props.challengeId ?? input.props.title} challengeTitle={input.props.title} selection={input.props.aiSelection} initialPrompt={input.props.aiStarterPrompt} onDismiss={() => input.on?.closeAi?.()} onClearSelection={input.on?.clearAiSelection} /> : null}
        <ModalBranch isOpen={input.props.isConfirmOpen} size="sm" contract="challenge-submit-confirmation" render={confirmation} onDismiss={() => input.on?.cancelSubmit?.()} />
        <ModalBranch isOpen={input.props.isExitConfirmOpen === true} size="sm" contract="challenge-submit-confirmation" render={exitConfirmation} onDismiss={() => input.on?.cancelExit?.()} />
    </>
}

/** Architectural identity for the pure Challenge twin. */
export const meta = { world: "pure", domain: "learn" } as const
