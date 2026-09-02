import type { ComponentType } from "react"
import { Input, SurfaceAccordionCard, Button } from "@starci/grammar/common"
import { SurfaceCard } from "@starci/grammar/common"
import { Article } from "@/components/branches/Article"
import { EmptyNotice } from "@starci/grammar/common"
import { Badge } from "@starci/grammar/common"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { ExtendedTabs } from "@/components/leaves/ExtendedTabs"
import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { Progress } from "@starci/grammar/common"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Select } from "@/components/leaves/Select"
import { ModalBranch } from "@/components/branches/ModalBranch"
import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { CourseContentMapBase } from "@/components/blocks/learn/CourseContentMap/component"
import type { CourseContentMapProps } from "@/components/blocks/learn/CourseContentMap/component"
import type { ContentAiSelectionContext } from "@/modules/ai/content-ai-selection-context"
import type { ChallengeAttemptHistoryDrawerProps } from "@/components/overlays/learn/ChallengeAttemptHistoryDrawer"
import type { ChallengeGradingModelDrawerProps } from "@/components/overlays/learn/ChallengeGradingModelDrawer"
import type { CourseLearnAiDrawerProps } from "@/components/overlays/learn/CourseLearnAiDrawer"
import {
    challengeActionsClassName,
    challengeBriefColumnClassName,
    challengeConsoleClassName,
    challengeDeliverableClassName,
    challengeGridClassName,
    challengeGuidanceClassName,
    challengeHeaderClassName,
    challengeMetaClassName,
    challengeSubmissionLauncherClassName,
    challengeToolbarClassName,
    challengeWorkbenchClassName,
} from "./classNames"
/** One challenge deliverable. */
export type CourseLearnChallengeDeliverable = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly score: number;
  readonly url?: string;
  readonly modelId?: string;
  readonly modelLabel?: string;
};
/** One authored guidance item. */
export type CourseLearnChallengeGuidanceItem = {
  readonly id: string;
  readonly title?: string;
  readonly body: string;
};
/** One scored requirement. */
export type CourseLearnChallengeRequirement = {
  readonly id: string;
  readonly title: string;
  readonly body?: string;
  readonly score: number;
};
/** Challenge transport and interaction state. */
export type CourseLearnChallengeBlockState =
  | "pending"
  | "ready"
  | "saving"
  | "saveFailed"
  | "conflict"
  | "submitting"
  | "evaluating"
  | "evaluationUnavailable"
  | "passed"
  | "needsRevision"
  | "failed";
/** Localized copy for the challenge workspace. */
export type CourseLearnChallengeLabels = {
  readonly backToLesson: string;
  readonly openCourseMap: string;
  readonly brief: string;
  readonly deliverables: string;
  readonly repositoryPlaceholder: string;
  readonly saved: string;
  readonly required?: string;
  readonly validEvidence?: string;
  readonly saveDraft: string;
  readonly retrySave: string;
  readonly submitAttempt: string;
  readonly confirmTitle: string;
  readonly confirmDescription: string;
  readonly confirmSubmit: string;
  readonly cancel: string;
  readonly breadcrumb: string;
  readonly retry: string;
  readonly result: string;
  readonly points: (score: number) => string;
  readonly readinessTitle?: string;
  readonly readinessReady?: string;
  readonly readinessIncomplete?: (complete: number, total: number) => string;
  readonly reviewAttempt?: string;
  readonly reviewTitle?: string;
  readonly reviewDescription?: string;
  readonly returnToEdit?: string;
  readonly gradingModel?: string;
  readonly changeModel?: string;
  readonly language?: string;
  readonly askAi?: string;
  readonly saveAndExit?: string;
  readonly exitTitle?: string;
  readonly exitDescription?: string;
  readonly exitWithoutSaving?: string;
  readonly explainSelection?: string;
  readonly translateSelection?: string;
  readonly dismissSelection?: string;
  readonly closeCourseMap?: string;
  readonly score?: string;
  readonly saving?: string;
  readonly saveFailed?: string;
  readonly conflict?: string;
  readonly submit?: string;
  readonly submitting?: string;
  readonly scoreValue?: (score: number, maximum: number) => string;
  readonly passing?: (score: number) => string;
  readonly scoreCaption?: string;
  readonly prerequisites?: string;
  readonly requirements?: string;
  readonly steps?: string;
  readonly expectedOutputs?: string;
  readonly hintLabel?: string;
  readonly evidenceLabel?: string;
  readonly history?: string;
  readonly analysisPlan?: string;
  readonly cachePolicy?: string;
  readonly openSubmission?: string;
  readonly closeSubmission?: string;
  readonly workspaceLabel?: string;
  readonly contentView?: string;
};
/** Props and actions for the presentational challenge block. */
export type CourseLearnChallengeBlockProps = {
  readonly blockState: CourseLearnChallengeBlockState;
  readonly props: {
    readonly displayId?: string;
    readonly courseId?: string;
    readonly challengeId?: string;
    readonly title: string;
    readonly courseTitle: string;
    readonly moduleTitle: string;
    readonly contentTitle: string;
    readonly description: string;
    readonly difficultyLabel: string;
    readonly statusLabel: string;
    readonly hint?: string;
    readonly prerequisites?: ReadonlyArray<CourseLearnChallengeGuidanceItem>;
    readonly requirements?: ReadonlyArray<CourseLearnChallengeRequirement>;
    readonly steps?: ReadonlyArray<CourseLearnChallengeGuidanceItem>;
    readonly outputs?: ReadonlyArray<CourseLearnChallengeGuidanceItem>;
    readonly maximumScore: number;
    readonly deliverables: ReadonlyArray<CourseLearnChallengeDeliverable>;
    readonly expandedRequirementIds: ReadonlyArray<string>;
    readonly expandedStepIds: ReadonlyArray<string>;
    readonly failedSubmissionId?: string;
    readonly notice?: string;
    readonly draftStatus?: string;
    readonly isConfirmOpen: boolean;
    readonly isExitConfirmOpen?: boolean;
    readonly isReviewing?: boolean;
    readonly isModelDrawerOpen?: boolean;
    readonly isAiDrawerOpen?: boolean;
    readonly allDraftsComplete: boolean;
    readonly isCourseMapOpen: boolean;
    readonly courseMap: CourseContentMapProps;
    readonly languageOptions?: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
    }>;
    readonly selectedLanguage?: string;
    readonly defaultModelId?: string;
    readonly aiSelection?: ContentAiSelectionContext;
    readonly aiSelectionPosition?: { readonly x: number; readonly y: number };
    readonly aiStarterPrompt?: string;
    readonly labels: CourseLearnChallengeLabels;
    readonly activeSubmissionId?: string;
    readonly earnedScore?: number;
    readonly isSubmissionOpen?: boolean;
  };
  readonly on?: {
    readonly requestExit?: () => void;
    readonly cancelExit?: () => void;
    readonly confirmExit?: () => void;
    readonly openCourseMap?: () => void;
    readonly searchCourseMap?: (query: string) => void;
    readonly toggleCourseMapModule?: (id: string, open: boolean) => void;
    readonly openCourseMapItem?: (id: string) => void;
    readonly explainSelection?: () => void;
    readonly translateSelection?: () => void;
    readonly dismissSelection?: () => void;
    readonly closeCourseMap?: () => void;
    readonly toggleRequirement?: (id: string, open: boolean) => void;
    readonly toggleStep?: (id: string, open: boolean) => void;
    readonly changeUrl?: (id: string, value: string) => void;
    readonly retry?: (id?: string) => void;
    readonly openResult?: (id: string) => void;
    readonly saveDraft?: () => void;
    readonly reviewAttempt?: () => void;
    readonly returnToEdit?: () => void;
    readonly submitAttempt?: () => void;
    readonly confirmSubmit?: () => void;
    readonly cancelSubmit?: () => void;
    readonly openCourse?: () => void;
    readonly openModule?: () => void;
    readonly openContent?: () => void;
    readonly selectLanguage?: (language: string) => void;
    readonly openModelDrawer?: () => void;
    readonly closeModelDrawer?: () => void;
    readonly selectDefaultModel?: (modelId: string) => void;
    readonly applyDefaultModel?: () => void;
    readonly overrideModel?: (deliverableId: string, modelId: string) => void;
    readonly openAi?: () => void;
    readonly closeAi?: () => void;
    readonly clearAiSelection?: () => void;
    readonly openHistory?: () => void;
    readonly toggleSubmission?: () => void;
  };
  readonly historyOverlay?: ComponentType<ChallengeAttemptHistoryDrawerProps>;
  readonly historyOverlayProps?: ChallengeAttemptHistoryDrawerProps;
  readonly modelOverlay?: ComponentType<ChallengeGradingModelDrawerProps>;
  readonly modelOverlayProps?: ChallengeGradingModelDrawerProps;
  readonly aiOverlay?: ComponentType<CourseLearnAiDrawerProps>;
  readonly aiOverlayProps?: CourseLearnAiDrawerProps;
};
/** Compatibility alias for route fixtures. */
export type CourseLearnChallengePageProps = CourseLearnChallengeBlockProps;
/** Render the challenge brief, evidence inputs and submission controls. */
export const CourseLearnChallengeBlockBase = (
    props: CourseLearnChallengeBlockProps,
) => {
    const loading = props.blockState === "pending"
    const passed = props.blockState === "passed"
    const busy = props.blockState === "saving" || props.blockState === "submitting" || props.blockState === "evaluating"
    const labels = props.props.labels
    const deliverables = loading
        ? [{ id: "loading-1", title: "", score: 0 }, { id: "loading-2", title: "", score: 0 }]
        : props.props.deliverables
    const completed = deliverables.filter(
        (item) => item.url !== undefined && item.url !== "",
    ).length
    const requirements = props.props.requirements ?? []
    const steps = props.props.steps ?? []
    const hasBlockingNotice = Boolean(props.props.notice?.trim())
    const renderGuidance = (items: ReadonlyArray<CourseLearnChallengeGuidanceItem>, label: string, accordion: boolean) => items.length === 0 ? null : (
        <section className={challengeGuidanceClassName}>
            <Heading level={2}>{label}</Heading>
            {accordion ? <SurfaceAccordionCard
                depth="top"
                items={items.map((item, index) => ({
                    id: item.id,
                    isOpen: props.props.expandedStepIds.includes(item.id),
                    summaryRender: <><Text weight={"semibold"}>{item.title ?? `${label} ${index + 1}`}</Text><DisclosureIndicator props={{ isOpen: props.props.expandedStepIds.includes(item.id) }} /></>,
                    bodyRender: <Article props={{ body: item.body, measure: "compact" }} isLoading={loading} />,
                }))}
                renderSummary={(summary) => <>{summary}</>}
                renderBody={(body) => <>{body}</>}
                onItemOpenChange={(id, open) => props.on?.toggleStep?.(id, open)}
            /> : items.map((item, index) => (
                <article key={item.id}><Heading level={3} isSkeleton={loading}>{item.title ?? `${label} ${index + 1}`}</Heading><Article props={{ body: item.body, measure: "compact" }} isLoading={loading} /></article>
            ))}
        </section>
    )
    const activeView = props.props.isSubmissionOpen === true ? "submission" : "content"
    const selectView = (key: string) => {
        const shouldOpenSubmission = key === "submission"
        if (shouldOpenSubmission !== props.props.isSubmissionOpen) props.on?.toggleSubmission?.()
    }
    return (
        <main className={challengeWorkbenchClassName}>
            <Breadcrumbs props={{ label: labels.breadcrumb, backLabel: labels.backToLesson, steps: [
                { id: "course", label: props.props.courseTitle }, { id: "module", label: props.props.moduleTitle },
                { id: "content", label: props.props.contentTitle }, { id: "challenge", label: props.props.title },
            ] }} on={{ course: props.on?.openCourse, module: props.on?.openModule, content: props.on?.openContent }} />
            <div className={challengeToolbarClassName}>
                <Button variant="outline" size="sm" onPress={props.on?.openCourseMap}>{labels.openCourseMap}</Button>
                <Text size={"xs"} tone={"muted"}>{props.props.courseMap.props.progressFact ?? ""}</Text>
            </div>
            <header className={challengeHeaderClassName}>
                <Heading level={1} isSkeleton={loading}>{props.props.title}</Heading>
                <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.description}</Text>
                <div className={challengeMetaClassName}><Badge isSkeleton={loading}>{props.props.difficultyLabel}</Badge>
                <Badge tone={passed ? "success" : "neutral"} isSkeleton={loading}>{props.props.statusLabel}</Badge>
                <Badge isSkeleton={loading}>{labels.points(props.props.maximumScore)}</Badge></div>
                {props.props.languageOptions === undefined ? null : <Select props={{ id: "challenge-language", name: "challenge-language", label: labels.language ?? "Language", options: props.props.languageOptions, selectedKey: props.props.selectedLanguage }} on={{ select: props.on?.selectLanguage }} />}
            </header>
            <div className={challengeSubmissionLauncherClassName}><ExtendedTabs props={{ label: labels.workspaceLabel ?? labels.deliverables, selectedKey: activeView, labelVisibility: "always", inset: "none", tabs: [
                { id: "content", label: labels.contentView ?? labels.brief, icon: "course" },
                { id: "submission", label: labels.deliverables, icon: "review" },
            ] }} on={{ select: selectView }} isLoading={loading} /></div>
            <div className={challengeGridClassName}><div className={challengeBriefColumnClassName} data-active={activeView === "content"}><SurfaceCard label={labels.brief} composition="single">
                <Article
                    props={{ body: props.props.description, measure: "compact" }}
                    isLoading={loading}
                />
                {props.props.hint === undefined ? null : (
                    <Text size={"sm"} tone={"muted"}>{props.props.hint}</Text>
                )}
                {renderGuidance(props.props.prerequisites ?? [], labels.prerequisites ?? "Prerequisites", false)}
                {requirements.length === 0 ? null : <section className={challengeGuidanceClassName}><Heading level={2}>{labels.requirements ?? "Requirements"}</Heading><SurfaceAccordionCard depth="top" items={requirements.map((item) => ({ id: item.id, isOpen: props.props.expandedRequirementIds.includes(item.id), summaryRender: <><Text weight={"semibold"}>{item.title}</Text><Badge>{labels.points(item.score)}</Badge><DisclosureIndicator props={{ isOpen: props.props.expandedRequirementIds.includes(item.id) }} /></>, bodyRender: item.body === undefined ? null : <Article props={{ body: item.body, measure: "compact" }} /> }))} renderSummary={(summary) => <>{summary}</>} renderBody={(body) => <>{body}</>} onItemOpenChange={(id, open) => props.on?.toggleRequirement?.(id, open)} /></section>}
                {renderGuidance(steps, labels.steps ?? "Steps", true)}
                {renderGuidance(props.props.outputs ?? [], labels.expectedOutputs ?? "Expected outputs", false)}
            </SurfaceCard></div><aside className={challengeConsoleClassName} data-active={activeView === "submission"}><SurfaceCard label={labels.deliverables} measure={"form"} composition="single">
                <Text size={"sm"} tone={"muted"}>{labels.analysisPlan}</Text>
                {props.props.notice === undefined ? null : <EmptyNotice message={props.props.notice} actionLabel={labels.retrySave} onAction={({ act: () => props.on?.retry?.() })?.act} />}
                {deliverables.length === 0 ? <Text live={"assertive"}>{props.props.notice ?? ""}</Text> : (
                    deliverables.map((item) => (
                        <section className={challengeDeliverableClassName} key={item.id}>
                            <Heading level={2} isSkeleton={loading}>{item.title}</Heading>
                            <Text size={"sm"} tone={"muted"}>{item.description}</Text>
                            <Badge tone={item.url?.trim() ? "success" : "neutral"}>{labels.points(item.score)}</Badge>
                            {passed || props.props.isReviewing === true ? <Text size={"sm"}>{item.url ?? ""}</Text> : <Input
                                id={`challenge-${item.id}`}
                                name={`challenge-${item.id}`}
                                label={labels.evidenceLabel ?? labels.repositoryPlaceholder}
                                placeholder={labels.repositoryPlaceholder}
                                value={item.url}
                                variant="secondary"
                                isDisabled={loading || busy || hasBlockingNotice}
                                isError={props.props.failedSubmissionId === item.id}
                                onValueChange={(value) => props.on?.changeUrl?.(item.id, value)}
                            />}
                            <Text size={"xs"} tone={"muted"}>{`${labels.gradingModel ?? "Model"}: ${item.modelLabel ?? item.modelId ?? "auto"}`}</Text>
                            <Button variant="ghost" size="sm" isDisabled={hasBlockingNotice} onPress={props.on?.openModelDrawer}>{labels.changeModel ?? "Choose grading model"}</Button>
                        </section>
                    ))
                )}
            </SurfaceCard>
            {hasBlockingNotice ? null : <SurfaceCard label={labels.readinessTitle ?? labels.deliverables} measure={"form"} composition="single">
                <Text size={"sm"} tone={"muted"} live={"polite"}>{labels.readinessIncomplete?.(
                  completed,
                  props.props.deliverables.length,
              ) ?? ""}</Text>
                <Progress label={labels.readinessTitle ?? labels.deliverables} value={props.props.deliverables.length === 0
                  ? 0
                  : Math.round(
                      (completed / props.props.deliverables.length) * 100,
                  )} isSkeleton={loading} />
                {props.props.draftStatus === undefined ? null : <Text size={"sm"} tone={"muted"} live={"polite"}>{props.props.draftStatus}</Text>}
                <Text size={"xs"} tone={"muted"}>{labels.cachePolicy}</Text>
                {props.props.isReviewing ? <section><Heading level={2}>{labels.reviewTitle ?? labels.submitAttempt}</Heading><Text size={"sm"} tone={"muted"}>{labels.reviewDescription ?? labels.confirmDescription}</Text>{deliverables.map((item) => <Text key={item.id} size={"sm"}>{`${item.title}: ${item.url ?? ""}`}</Text>)}<Button variant="outline" onPress={props.on?.returnToEdit}>{labels.returnToEdit ?? labels.cancel}</Button><Button variant="primary" onPress={props.on?.submitAttempt}>{labels.submitAttempt}</Button></section> : <><Button variant="outline" isDisabled={loading || busy} isPending={props.blockState === "saving"} onPress={passed ? () => props.on?.openResult?.(deliverables[0]?.id ?? "") : props.on?.saveDraft}>{passed ? labels.result : labels.saveDraft}</Button><Button variant="primary" isDisabled={loading || busy || !props.props.allDraftsComplete} onPress={passed
                    ? () => props.on?.openResult?.(deliverables[0]?.id ?? "")
                    : props.on?.reviewAttempt ?? props.on?.submitAttempt}>{loading || busy ? labels.submitAttempt : labels.reviewAttempt ?? labels.submitAttempt}</Button></>}
            </SurfaceCard>}<div className={challengeActionsClassName}><Button variant="ghost" size="sm" onPress={props.on?.openHistory}>{labels.history ?? "Attempt history"}</Button><Button variant="secondary" size="sm" onPress={props.on?.openAi}>{labels.askAi ?? "Ask AI"}</Button><Button variant="ghost" size="sm" onPress={props.on?.requestExit}>{labels.saveAndExit ?? labels.backToLesson}</Button></div></aside></div>
            {props.props.isCourseMapOpen ? <DrawerBranch isOpen placement="left" title={labels.openCourseMap} onDismiss={() => props.on?.closeCourseMap?.()}><CourseContentMapBase {...props.props.courseMap} /></DrawerBranch> : null}
            <ModalBranch isOpen={props.props.isConfirmOpen} size="sm" onDismiss={() => props.on?.cancelSubmit?.()}><Heading level={2}>{labels.confirmTitle}</Heading><Text tone={"muted"}>{labels.confirmDescription}</Text><Button variant="outline" onPress={props.on?.cancelSubmit}>{labels.cancel}</Button><Button variant="primary" onPress={props.on?.confirmSubmit}>{labels.confirmSubmit}</Button></ModalBranch>
            <ModalBranch isOpen={props.props.isExitConfirmOpen === true} size="sm" onDismiss={() => props.on?.cancelExit?.()}><Heading level={2}>{labels.exitTitle ?? labels.saveAndExit ?? labels.backToLesson}</Heading><Text tone={"muted"}>{labels.exitDescription}</Text><Button variant="outline" onPress={props.on?.cancelExit}>{labels.cancel}</Button><Button variant="primary" onPress={props.on?.confirmExit}>{labels.exitWithoutSaving ?? labels.saveAndExit ?? labels.backToLesson}</Button></ModalBranch>
            {props.historyOverlay === undefined || props.historyOverlayProps === undefined ? null : <props.historyOverlay {...props.historyOverlayProps} />}
            {props.modelOverlay === undefined || props.modelOverlayProps === undefined ? null : <props.modelOverlay {...props.modelOverlayProps} />}
            {props.aiOverlay === undefined || props.aiOverlayProps === undefined ? null : <props.aiOverlay {...props.aiOverlayProps} />}
        </main>
    )
}
