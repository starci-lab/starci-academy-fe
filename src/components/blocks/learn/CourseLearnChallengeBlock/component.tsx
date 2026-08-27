import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Article } from "@/components/branches/Article"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Field } from "@/components/composites/Field"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { Progress } from "@/components/leaves/Progress"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Select } from "@/components/leaves/Select"
import { ModalBranch } from "@/components/branches/ModalBranch"
import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { CourseContentMapBase } from "@/components/blocks/learn/CourseContentMap/component"
import type { CourseContentMapProps } from "@/components/blocks/learn/CourseContentMap/component"
import type { ContentAiSelectionContext } from "@/modules/ai/content-ai-selection-context"
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
  };
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
    const renderGuidance = (items: ReadonlyArray<CourseLearnChallengeGuidanceItem>, label: string, accordion: boolean) => items.length === 0 ? null : (
        <section>
            <Heading props={{ content: label, level: 2 }} />
            {items.map((item, index) => accordion ? (
                <details key={item.id} open={props.props.expandedStepIds.includes(item.id)} onToggle={(event) => props.on?.toggleStep?.(item.id, event.currentTarget.open)}>
                    <summary><strong>{item.title ?? `${label} ${index + 1}`}</strong></summary>
                    <Article props={{ body: item.body, measure: "compact" }} isLoading={loading} />
                </details>
            ) : (
                <article key={item.id}><Heading props={{ content: item.title ?? `${label} ${index + 1}`, level: 3 }} isLoading={loading} /><Article props={{ body: item.body, measure: "compact" }} isLoading={loading} /></article>
            ))}
        </section>
    )
    return (
        <main>
            <Breadcrumbs props={{ label: labels.breadcrumb, showFullTrail: true, steps: [
                { id: "course", label: props.props.courseTitle }, { id: "module", label: props.props.moduleTitle },
                { id: "content", label: props.props.contentTitle }, { id: "challenge", label: props.props.title },
            ] }} on={{ course: props.on?.openCourse, module: props.on?.openModule, content: props.on?.openContent }} />
            <div>
                <Button props={{ label: labels.openCourseMap, variant: "outline", size: "sm" }} on={{ press: props.on?.openCourseMap }} />
                <Text props={{ content: props.props.courseMap.props.progressFact ?? "", size: "xs", tone: "muted" }} />
            </div>
            <header>
                <Heading
                    props={{ content: props.props.title, level: 1 }}
                    isLoading={loading}
                />
                <Text
                    props={{
                        content: props.props.description,
                        size: "sm",
                        tone: "muted",
                    }}
                    isLoading={loading}
                />
                <Badge
                    props={{ content: props.props.difficultyLabel }}
                    isLoading={loading}
                />
                <Badge
                    props={{
                        content: props.props.statusLabel,
                        tone: passed ? "success" : "neutral",
                    }}
                    isLoading={loading}
                />
                <Badge props={{ content: labels.points(props.props.maximumScore) }} isLoading={loading} />
                {props.props.languageOptions === undefined ? null : <Select props={{ id: "challenge-language", name: "challenge-language", label: labels.language ?? "Language", options: props.props.languageOptions, selectedKey: props.props.selectedLanguage }} on={{ select: props.on?.selectLanguage }} />}
            </header>
            <SurfaceCard props={{ label: labels.brief }}>
                <Article
                    props={{ body: props.props.description, measure: "compact" }}
                    isLoading={loading}
                />
                {props.props.hint === undefined ? null : (
                    <Text
                        props={{ content: props.props.hint, size: "sm", tone: "muted" }}
                    />
                )}
                {renderGuidance(props.props.prerequisites ?? [], labels.prerequisites ?? "Prerequisites", false)}
                {requirements.length === 0 ? null : <section><Heading props={{ content: labels.requirements ?? "Requirements", level: 2 }} />{requirements.map((item) => <details key={item.id} open={props.props.expandedRequirementIds.includes(item.id)} onToggle={(event) => props.on?.toggleRequirement?.(item.id, event.currentTarget.open)}><summary><strong>{item.title}</strong> <Badge props={{ content: labels.points(item.score) }} /></summary>{item.body === undefined ? null : <Article props={{ body: item.body, measure: "compact" }} />}</details>)}</section>}
                {renderGuidance(steps, labels.steps ?? "Steps", true)}
                {renderGuidance(props.props.outputs ?? [], labels.expectedOutputs ?? "Expected outputs", false)}
            </SurfaceCard>
            <SurfaceCard props={{ label: labels.deliverables }}>
                {props.props.notice === undefined ? null : <EmptyNotice props={{ message: props.props.notice, actionLabel: labels.retrySave }} on={{ act: () => props.on?.retry?.() }} />}
                {deliverables.length === 0 ? <Text props={{ content: props.props.notice ?? "", live: "assertive" }} /> : (
                    deliverables.map((item) => (
                        <section key={item.id}>
                            <Heading
                                props={{ content: item.title, level: 2 }}
                                isLoading={loading}
                            />
                            <Text
                                props={{ content: item.description, size: "sm", tone: "muted" }}
                            />
                            <Badge
                                props={{
                                    content: labels.points(item.score),
                                    tone: item.url === undefined ? "neutral" : "success",
                                }}
                            />
                            {passed || props.props.isReviewing === true ? <Text props={{ content: item.url ?? "", size: "sm" }} /> : <Field
                                props={{
                                    id: `challenge-${item.id}`,
                                    name: `challenge-${item.id}`,
                                    label: labels.evidenceLabel ?? labels.repositoryPlaceholder,
                                    placeholder: labels.repositoryPlaceholder,
                                    disabled: busy,
                                    isInvalid: props.props.failedSubmissionId === item.id,
                                }}
                                on={{
                                    change: (value) => props.on?.changeUrl?.(item.id, value),
                                }}
                                isLoading={loading}
                            />}
                            <Text props={{ content: `${labels.gradingModel ?? "Model"}: ${item.modelLabel ?? item.modelId ?? "auto"}`, size: "xs", tone: "muted" }} />
                            <Button props={{ label: labels.changeModel ?? "Choose grading model", variant: "ghost", size: "sm" }} on={{ press: props.on?.openModelDrawer }} />
                        </section>
                    ))
                )}
            </SurfaceCard>
            <SurfaceCard
                props={{ label: labels.readinessTitle ?? labels.deliverables }}
            >
                <Text
                    props={{
                        content:
              labels.readinessIncomplete?.(
                  completed,
                  props.props.deliverables.length,
              ) ?? "",
                        size: "sm",
                        tone: "muted",
                        live: "polite",
                    }}
                />
                <Progress
                    props={{
                        value:
              props.props.deliverables.length === 0
                  ? 0
                  : Math.round(
                      (completed / props.props.deliverables.length) * 100,
                  ),
                        label: labels.readinessTitle ?? labels.deliverables,
                    }}
                    isLoading={loading}
                />
                {props.props.draftStatus === undefined ? null : <Text props={{ content: props.props.draftStatus, size: "sm", tone: "muted", live: "polite" }} />}
                {props.props.isReviewing ? <section><Heading props={{ content: labels.reviewTitle ?? labels.submitAttempt, level: 2 }} /><Text props={{ content: labels.reviewDescription ?? labels.confirmDescription, size: "sm", tone: "muted" }} />{deliverables.map((item) => <Text key={item.id} props={{ content: `${item.title}: ${item.url ?? ""}`, size: "sm" }} />)}<Button props={{ label: labels.returnToEdit ?? labels.cancel, variant: "outline" }} on={{ press: props.on?.returnToEdit }} /><Button props={{ label: labels.submitAttempt, variant: "primary" }} on={{ press: props.on?.submitAttempt }} /></section> : <><Button props={{ label: passed ? labels.result : labels.saveDraft, variant: "outline", disabled: loading || busy, isPending: props.blockState === "saving" }} on={{ press: passed ? () => props.on?.openResult?.(deliverables[0]?.id ?? "") : props.on?.saveDraft }} /><Button
                    props={{
                        label: loading || busy ? labels.submitAttempt : labels.reviewAttempt ?? labels.submitAttempt,
                        variant: "primary",
                        disabled: loading || busy || !props.props.allDraftsComplete,
                    }}
                    on={{
                        press: passed
                            ? () => props.on?.openResult?.(deliverables[0]?.id ?? "")
                            : props.on?.reviewAttempt ?? props.on?.submitAttempt,
                    }}
                /></>}
            </SurfaceCard>
            <div><Button props={{ label: labels.askAi ?? "Ask AI", variant: "secondary" }} on={{ press: props.on?.openAi }} /><Button props={{ label: labels.saveAndExit ?? labels.backToLesson, variant: "ghost" }} on={{ press: props.on?.requestExit }} /></div>
            {props.props.isCourseMapOpen ? <DrawerBranch isOpen placement="left" title={labels.openCourseMap} onDismiss={() => props.on?.closeCourseMap?.()}><CourseContentMapBase {...props.props.courseMap} /></DrawerBranch> : null}
            <ModalBranch isOpen={props.props.isConfirmOpen} size="sm" onDismiss={() => props.on?.cancelSubmit?.()}><Heading props={{ content: labels.confirmTitle, level: 2 }} /><Text props={{ content: labels.confirmDescription, tone: "muted" }} /><Button props={{ label: labels.cancel, variant: "outline" }} on={{ press: props.on?.cancelSubmit }} /><Button props={{ label: labels.confirmSubmit, variant: "primary" }} on={{ press: props.on?.confirmSubmit }} /></ModalBranch>
        </main>
    )
}
