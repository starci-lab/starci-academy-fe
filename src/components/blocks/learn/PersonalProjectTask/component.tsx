import type { ComponentType } from "react"
import { SurfaceAccordionCard } from "@starci/grammar/core"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceFormCard } from "@/components/branches/SurfaceFormCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { Field } from "@/components/composites/Field"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent, type LeafProps } from "@/components/contracts/props"
import { Article, segmentArticleSurfaces } from "@/components/branches/Article"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Heading } from "@/components/leaves/Heading"
import { Link } from "@/components/leaves/Link"
import { Text } from "@/components/leaves/Text"

/** One scored requirement authored for a personal-project task. */
export type PersonalProjectCriterion = { readonly id: string; readonly text: string; readonly score: number }
/** One selectable language or grading-model choice exposed by the task workspace. */
export type PersonalProjectModelOption = { readonly id: string; readonly label: string; readonly disabled?: boolean }
/** The settled loading, interaction and recovery conditions of the task page. */
export type PersonalProjectTaskState =
    | "pending"
    | "ready"
    | "task-error"
    | "ancillary-unavailable"
    | "invalid-repository"
    | "submitting"
    | "submission-error"
    | "latest-result"
    | "forbidden"

/** Localized words and fact formatters owned by the connected task page. */
export type PersonalProjectTaskLabels = {
    readonly back: string
    readonly guidance: string
    readonly criteria: string
    readonly showCriteria: string
    readonly hideCriteria: string
    readonly implementation: string
    readonly points: (score: number) => string
    readonly submission: string
    readonly repository: string
    readonly repositoryDescription: string
    readonly repositoryPlaceholder: string
    readonly settings: string
    readonly language: string
    readonly model: string
    readonly branch: string
    readonly branchPlaceholder: string
    readonly token: string
    readonly tokenPlaceholder: string
    readonly tokenStored: (last4: string) => string
    readonly settingsSaved: string
    readonly evaluate: string
    readonly feedback: string
    readonly history: string
    readonly latest: string
    readonly passed: string
    readonly needsWork: string
    readonly saveSettings: string
    readonly retry: string
    readonly lockedTitle: string
}

/** Complete authored task, submission and grading-settings input for the pure page. */
export type PersonalProjectTaskBaseProps = {
    readonly state: PersonalProjectTaskState
    readonly props: {
        readonly title: string
        readonly description: string
        readonly difficulty?: string
        readonly maxScore: number
        readonly brief?: string
        readonly hint?: string
        readonly criteria: ReadonlyArray<PersonalProjectCriterion>
        readonly expandedBriefSectionIds: ReadonlyArray<string>
        readonly implementation?: string
        readonly repositoryUrl?: string
        readonly repositoryDraft?: string
        readonly repositoryState: "ready" | "saving" | "invalid" | "failed"
        readonly latestAttempt?: { readonly score: number; readonly passed: boolean }
        readonly notice?: string
    readonly labels: PersonalProjectTaskLabels
    }
    readonly on?: {
        readonly back?: () => void
        readonly toggleBriefSection?: (id: string, isOpen: boolean) => void
        readonly changeRepository?: (value: string) => void
        readonly openSettings?: () => void
        readonly closeSettings?: () => void
        readonly submit?: () => void
        readonly retry?: () => void
        readonly openFeedback?: () => void
        readonly openHistory?: () => void
    }
    readonly settingsOverlay?: ComponentType<{ readonly courseId: string; readonly taskId: string; readonly isOpen: boolean; readonly onDismiss: () => void }>
    readonly settingsOverlayProps?: { readonly courseId: string; readonly taskId: string; readonly isOpen: boolean; readonly onDismiss: () => void }
}

const factRun = (input: PersonalProjectTaskBaseProps, isLoading: boolean) => [
    defineLeafComponent("badge", {}, () => (
        <Badge props={{ content: input.props.labels.points(input.props.maxScore) }} isLoading={isLoading} />
    )),
    ...(input.props.difficulty === undefined ? [] : [defineLeafComponent("badge", {}, () => (
        <Badge props={{ content: input.props.difficulty }} isLoading={isLoading} />
    ))]),
]

type PersonalProjectGuidanceListData = SurfaceListCardData & {
    readonly rows: ReadonlyArray<{ readonly id: string, readonly body: string }>
}

const PersonalProjectGuidanceListView = ({ props, isLoading = false }: LeafProps<PersonalProjectGuidanceListData>) => (
    <Tree contract="personal-project-guidance-list" render={defineContractComponent("personal-project-guidance-list", {
        item: props.rows.map((item) => defineContractComponent("personal-project-guidance-row", {
            body: defineLeafComponent("article", {}, () => <Article props={{ body: item.body }} isLoading={isLoading} />),
        })),
    })} />
)
const PersonalProjectGuidanceList = defineContractComponent("personal-project-guidance-list", PersonalProjectGuidanceListView)

type PersonalProjectCriteriaListData = SurfaceListCardData & {
    readonly rows: ReadonlyArray<{ readonly id: string, readonly text: string, readonly scoreLabel: string }>
}

const PersonalProjectCriteriaListView = ({ props, isLoading = false }: LeafProps<PersonalProjectCriteriaListData>) => (
    <Tree contract="personal-project-criteria-list" render={defineContractComponent("personal-project-criteria-list", {
        criterion: props.rows.map((criterion) => defineContractComponent("personal-project-criterion-row", {
            text: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: criterion.text, size: "sm" }} isLoading={isLoading} />
            )),
            score: defineLeafComponent("badge", {}, () => (
                <Badge props={{ content: criterion.scoreLabel }} isLoading={isLoading} />
            )),
        })),
    })} />
)
const PersonalProjectCriteriaList = defineContractComponent("personal-project-criteria-list", PersonalProjectCriteriaListView)

/** Draws the accepted long brief, persistent submission panel and grading-settings drawer. */
export const PersonalProjectTaskBase = (input: PersonalProjectTaskBaseProps) => {
    const isLoading = input.state === "pending"
    const disabled = isLoading
        || input.state === "submitting"
        || input.state === "forbidden"
        || input.state === "task-error"
        || input.state === "ancillary-unavailable"
    const repositoryInvalid = input.props.repositoryState === "invalid"
    const evaluationRecovery = input.state === "ancillary-unavailable" || input.state === "submission-error"
    const criteriaRows = input.props.criteria.map((criterion) => ({
        id: criterion.id,
        text: criterion.text,
        scoreLabel: input.props.labels.points(criterion.score),
    }))
    const authoredSections = segmentArticleSurfaces(input.props.brief)
    const contentSections = authoredSections.length > 0
        ? authoredSections
        : [{ id: "section-0", kind: "body" as const, body: input.props.brief ?? "", items: [] }]
    const authoredSurfaces = contentSections.map((section, index) => {
        if (section.kind === "peer-list") {
            const props: PersonalProjectGuidanceListData = {
                label: section.label ?? input.props.labels.guidance,
                isLabelHidden: section.label === undefined,
                rows: section.items.map((item) => ({ id: item.id, body: item.body })),
            }
            return defineContractProjection("personal-project-task-brief", () => (
                <SurfaceListCard
                    key={section.id}
                    props={props}
                    contract="personal-project-guidance-list"
                    render={PersonalProjectGuidanceList}
                    isLoading={isLoading}
                />
            ))
        }
        if (section.kind === "accordion") {
            const accordionItems = section.items.map((item) => ({
                id: item.id,
                isOpen: input.props.expandedBriefSectionIds.includes(item.id),
                summaryRender: defineContractComponent("personal-project-guidance-disclosure-summary", {
                    title: defineLeafComponent("text", { weight: "semibold" }, () => (
                        <Text props={{ content: item.title, weight: "semibold" }} isLoading={isLoading} />
                    )),
                    indicator: defineLeafComponent("disclosure-indicator", {}, () => (
                        <DisclosureIndicator props={{ isOpen: input.props.expandedBriefSectionIds.includes(item.id) }} />
                    )),
                }),
                bodyRender: defineContractComponent("personal-project-guidance-disclosure-body", {
                    body: defineLeafComponent("article", {}, () => <Article props={{ body: item.body }} isLoading={isLoading} />),
                }),
            }))
            return defineContractProjection("personal-project-task-brief", () => (
                <Tree key={section.id} contract="personal-project-guidance-accordion" render={defineContractComponent("personal-project-guidance-accordion", {
                    heading: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: section.label ?? input.props.labels.guidance, level: 3 }} />
                    )),
                    disclosure: defineContractProjection("personal-project-guidance-disclosure", () => (
                        <SurfaceAccordionCard
                            depth="top"
                            items={accordionItems}
                            renderSummary={(summary) => <Tree contract="personal-project-guidance-disclosure-summary" render={summary} />}
                            renderBody={(body) => <Tree contract="personal-project-guidance-disclosure-body" render={body} />}
                            onItemOpenChange={(id, isOpen) => input.on?.toggleBriefSection?.(id, isOpen)}
                        />
                    )),
                })} />
            ))
        }
        return defineContractProjection("personal-project-task-brief", () => (
            <SurfaceCard
                key={section.id}
                props={section.label === undefined ? undefined : { label: section.label }}
                contract="personal-project-task-brief"
                render={defineContractComponent("personal-project-task-brief", {
                    body: defineLeafComponent("article", {}, () => <Article props={{ body: section.body }} isLoading={isLoading} />),
                    ...(index !== 0 || input.props.hint === undefined ? {} : {
                        hint: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                            <Text props={{ content: input.props.hint, size: "sm", tone: "muted", icon: "review" }} />
                        )),
                    }),
                })}
            />
        ))
    })
    const implementationCard = input.props.implementation === undefined ? [] : [
        defineContractProjection("personal-project-task-brief", () => (
            <SurfaceCard props={{ label: input.props.labels.implementation }} contract="personal-project-task-brief" render={defineContractComponent("personal-project-task-brief", {
                implementation: defineLeafComponent("article", {}, () => <Article props={{ body: input.props.implementation }} />),
            })} />
        )),
    ]
    const criteriaCard = input.props.criteria.length === 0 && !isLoading ? [] : [
        defineContractProjection("personal-project-task-brief", () => (
            <SurfaceListCard
                props={{ label: input.props.labels.criteria, rows: criteriaRows }}
                contract="personal-project-criteria-list"
                render={PersonalProjectCriteriaList}
                isLoading={isLoading}
            />
        )),
    ]
    const taskErrorCard = defineContractProjection("personal-project-task-brief", () => (
        <SurfaceCard contract="personal-project-task-brief" render={defineContractComponent("personal-project-task-brief", {
            hint: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: input.props.notice, size: "sm", tone: "muted", live: "assertive" }} />
            )),
            action: defineLeafComponent("button", {}, () => (
                <Button props={{ label: input.props.labels.retry, variant: "primary" }} on={{ press: input.on?.retry }} />
            )),
        })} />
    ))
    const lockedCard = defineContractProjection("personal-project-task-brief", () => (
        <SurfaceCard props={{ label: input.props.labels.lockedTitle }} contract="personal-project-task-brief" render={defineContractComponent("personal-project-task-brief", {
            hint: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: input.props.notice, size: "sm", tone: "muted", live: "assertive" }} />
            )),
            linkAction: defineLeafComponent("link", {}, () => (
                <Link props={{ label: input.props.labels.back, icon: "back" }} on={{ press: input.on?.back }} />
            )),
        })} />
    ))
    const brief = defineContractProjection("personal-project-task-brief-stack", () => (
        <Tree contract="personal-project-task-brief-stack" render={defineContractComponent("personal-project-task-brief-stack", {
            ...(input.state === "forbidden" ? {} : {
                heading: defineLeafComponent("text", { weight: "semibold" }, () => (
                    <Text props={{ content: input.props.labels.guidance, weight: "semibold" }} isLoading={isLoading} />
                )),
            }),
            section: input.state === "forbidden"
                ? [lockedCard]
                : input.state === "task-error"
                    ? [taskErrorCard]
                    : [...authoredSurfaces, ...implementationCard, ...criteriaCard],
        })} />
    ))
    const submissionContent = defineContractComponent("personal-project-submission-panel", {
        repository: defineCompositeComponent("field", {}, () => (
            <Field
                props={{
                    id: "personal-project-repository",
                    name: "personal-project-repository",
                    label: input.props.labels.repository,
                    description: input.props.labels.repositoryDescription,
                    placeholder: input.props.repositoryUrl ?? input.props.labels.repositoryPlaceholder,
                    disabled,
                    isInvalid: repositoryInvalid,
                    hint: repositoryInvalid ? input.props.notice : input.props.repositoryUrl,
                }}
                on={{ change: input.on?.changeRepository }}
                isLoading={isLoading}
            />
        )),
        ...(input.state === "task-error" || (input.state !== "forbidden" && input.props.repositoryState === "ready" && !evaluationRecovery) ? {} : {
            status: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{
                    content: input.props.notice,
                    size: "xs",
                    tone: "muted",
                    live: repositoryInvalid || input.props.repositoryState === "failed" || evaluationRecovery ? "assertive" : "polite",
                }} />
            )),
        }),
        settings: defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.props.labels.settings, size: "sm", disabled }} on={{ press: input.on?.openSettings }} />
        )),
        actions: defineContractComponent("personal-project-evaluation-actions", {
            primary: evaluationRecovery
                ? defineLeafComponent("button", {}, () => (
                    <Button props={{ label: input.props.labels.retry, variant: "primary" }} on={{ press: input.on?.retry }} />
                ))
                : defineLeafComponent("button", {}, () => (
                    <Button
                        props={{
                            label: input.props.labels.evaluate,
                            variant: "primary",
                            isPending: input.state === "submitting",
                            disabled: disabled || repositoryInvalid || (input.props.repositoryDraft ?? input.props.repositoryUrl ?? "").trim() === "",
                        }}
                        on={{ press: input.on?.submit }}
                        isLoading={isLoading}
                    />
                )),
            secondary: evaluationRecovery ? undefined : defineLeafComponent("button", {}, () => (
                <Button props={{ label: input.props.labels.feedback, disabled }} on={{ press: input.on?.openFeedback }} />
            )),
        }),
        ...(input.props.latestAttempt === undefined ? {} : {
            latest: defineContractComponent("personal-project-latest-result", {
                label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: input.props.labels.latest, size: "xs", tone: "muted" }} />
                )),
                result: defineContractComponent("profile-fact-run", { fact: [
                    defineLeafComponent("badge", {}, () => (
                        <Badge props={{ content: input.props.labels.points(input.props.latestAttempt?.score ?? 0) }} />
                    )),
                    defineLeafComponent("badge", {}, () => (
                        <Badge props={{
                            content: input.props.latestAttempt?.passed === true ? input.props.labels.passed : input.props.labels.needsWork,
                            tone: input.props.latestAttempt?.passed === true ? "success" : "warning",
                        }} />
                    )),
                ] }),
                action: defineLeafComponent("button", {}, () => (
                    <Button props={{ label: input.props.labels.history, size: "sm" }} on={{ press: input.on?.openHistory }} />
                )),
            }),
        }),
    })
    const submission = defineContractProjection("personal-project-submission-panel", () => (
        <SurfaceFormCard props={{ label: input.props.labels.submission }} contract="personal-project-submission-panel" render={submissionContent} />
    ))
    return <>
        <Tree contract="personal-project-task-content" render={defineContractComponent("personal-project-task-content", {
            header: defineContractComponent("personal-project-task-header", {
                back: defineLeafComponent("link", {}, () => <Link props={{ label: input.props.labels.back, icon: "back", emphasis: "muted" }} on={{ press: input.on?.back }} />),
                title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.title, level: 1 }} isLoading={isLoading} />),
                description: defineLeafComponent("text", {}, () => <Text props={{ content: input.props.description }} isLoading={isLoading} />),
                meta: defineContractComponent("profile-fact-run", { fact: factRun(input, isLoading) }),
            }),
            workspace: defineContractComponent("personal-project-task-workspace", { brief, submission }),
        })} />
        {input.settingsOverlay === undefined || input.settingsOverlayProps === undefined ? null : <input.settingsOverlay {...input.settingsOverlayProps} />}
    </>
}

/** Source-level ownership marker for the pure learning page. */
/** Source-level ownership marker for the pure task renderer. */
export const meta = { world: "pure", domain: "learn" } as const
