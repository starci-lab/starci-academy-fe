import type { ComponentType } from "react"
import type { PersonalProjectHistoryAttempt } from "@/components/blocks/learn/PersonalProjectHistory"
import { SurfaceAccordionCard } from "@starci/grammar/core"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { Field } from "@/components/composites/Field"
import { ExtendedTabs } from "@/components/leaves/ExtendedTabs"
import { Article, segmentArticleSurfaces } from "@/components/branches/Article"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Heading } from "@/components/leaves/Heading"
import { Link } from "@/components/leaves/Link"
import { Text } from "@/components/leaves/Text"
import {
    personalProjectTaskActionClassName,
    personalProjectTaskBriefClassName,
    personalProjectTaskClassName,
    personalProjectTaskConsoleBodyClassName,
    personalProjectTaskConsoleClassName,
    personalProjectTaskGridClassName,
    personalProjectTaskHeaderClassName,
    personalProjectTaskLatestClassName,
    personalProjectTaskLauncherClassName,
    personalProjectTaskMetaClassName,
    personalProjectTaskPeerItemClassName,
    personalProjectTaskRepositoryFieldClassName,
    personalProjectTaskStepBodyClassName,
    personalProjectTaskStepClassName,
    personalProjectTaskStepNumberClassName,
    personalProjectTaskTerminalClassName,
} from "./classNames"

/** One scored requirement authored for a personal-project task. */
export type PersonalProjectCriterion = { readonly id: string; readonly text: string; readonly score: number }
/** The settled loading, interaction and recovery conditions of the task page. */
export type PersonalProjectTaskState = "pending" | "ready" | "task-error" | "ancillary-unavailable" | "invalid-repository" | "submitting" | "submission-error" | "latest-result" | "forbidden"
/** Localized words and fact formatters owned by the connected task page. */
export type PersonalProjectTaskLabels = { readonly back: string; readonly guidance: string; readonly criteria: string; readonly showCriteria: string; readonly hideCriteria: string; readonly implementation: string; readonly points: (score: number) => string; readonly submission: string; readonly repository: string; readonly repositoryDescription: string; readonly repositoryPlaceholder: string; readonly settings: string; readonly language: string; readonly model: string; readonly branch: string; readonly branchPlaceholder: string; readonly token: string; readonly tokenPlaceholder: string; readonly tokenStored: (last4: string) => string; readonly settingsSaved: string; readonly evaluate: string; readonly feedback: string; readonly history: string; readonly latest: string; readonly passed: string; readonly needsWork: string; readonly saveSettings: string; readonly retry: string; readonly lockedTitle: string; readonly workspaceLabel?: string; readonly contentView?: string; readonly sourceStep?: string; readonly analysisStep?: string; readonly reviewStep?: string; readonly analysisDescription?: string; readonly branchFact?: (branch: string) => string; readonly languageFact?: (language: string) => string; readonly modelFact?: (model: string) => string; readonly tokenReady?: (last4: string) => string; readonly tokenMissing?: string; readonly promptCache?: string; readonly openSubmission?: string; readonly closeSubmission?: string }
type PersonalProjectSettingsOverlayProps = { readonly courseId: string; readonly taskId: string; readonly repositoryUrl?: string; readonly initialLanguage?: string; readonly initialModelId?: string; readonly isOpen: boolean; readonly onDismiss: () => void; readonly onApplied?: (selection: { readonly language: string; readonly modelId: string }) => void }
/** Complete authored task, submission and grading-settings props for the task renderer. */
export type PersonalProjectTaskProps = { readonly state: PersonalProjectTaskState; readonly props: { readonly title: string; readonly description: string; readonly difficulty?: string; readonly maxScore: number; readonly brief?: string; readonly hint?: string; readonly criteria: ReadonlyArray<PersonalProjectCriterion>; readonly expandedBriefSectionIds: ReadonlyArray<string>; readonly implementation?: string; readonly repositoryUrl?: string; readonly repositoryDraft?: string; readonly repositoryBranch?: string; readonly reviewLanguage?: string; readonly reviewModelLabel?: string; readonly tokenLast4?: string; readonly repositoryState: "ready" | "saving" | "invalid" | "failed"; readonly latestAttempt?: { readonly score: number; readonly passed: boolean }; readonly notice?: string; readonly isSubmissionOpen?: boolean; readonly labels: PersonalProjectTaskLabels }; readonly on?: { readonly back?: () => void; readonly toggleBriefSection?: (id: string, isOpen: boolean) => void; readonly toggleSubmission?: () => void; readonly changeRepository?: (value: string) => void; readonly openSettings?: () => void; readonly closeSettings?: () => void; readonly submit?: () => void; readonly retry?: () => void; readonly openFeedback?: () => void; readonly openHistory?: () => void }; readonly settingsOverlay?: ComponentType<PersonalProjectSettingsOverlayProps>; readonly settingsOverlayProps?: PersonalProjectSettingsOverlayProps; readonly historyOverlay?: ComponentType<{ readonly isOpen: boolean; readonly courseId?: string; readonly taskId: string; readonly onDismiss: () => void; readonly onSelect?: (attempt: PersonalProjectHistoryAttempt) => void }>; readonly historyOverlayProps?: { readonly isOpen: boolean; readonly courseId?: string; readonly taskId: string; readonly onDismiss: () => void; readonly onSelect?: (attempt: PersonalProjectHistoryAttempt) => void } }

/** Draw the task brief, submission controls and grading actions. */
export const PersonalProjectTaskBase = (props: PersonalProjectTaskProps) => {
    const isLoading = props.state === "pending"
    const disabled = isLoading || props.state === "submitting" || props.state === "forbidden" || props.state === "task-error" || props.state === "ancillary-unavailable"
    const repositoryInvalid = props.props.repositoryState === "invalid"
    const recovery = props.state === "ancillary-unavailable" || props.state === "submission-error"
    const sourceSections = segmentArticleSurfaces(props.props.brief)
    const sections = sourceSections.length > 0 ? sourceSections : [{ id: "section-0", kind: "body" as const, body: props.props.brief ?? "", items: [] }]
    const brief = sections.map((section, index) => {
        if (section.kind === "peer-list") return <SurfaceListCard key={section.id} props={{ label: section.label ?? props.props.labels.guidance, isLabelHidden: section.label === undefined }} isLoading={isLoading}>{section.items.map((item) => <div className={personalProjectTaskPeerItemClassName} key={item.id}><Article props={{ body: item.body }} isLoading={isLoading} /></div>)}</SurfaceListCard>
        if (section.kind === "accordion") return <div key={section.id}><Heading props={{ content: section.label ?? props.props.labels.guidance, level: 3 }} /><SurfaceAccordionCard depth="top" items={section.items.map((item) => ({ id: item.id, isOpen: props.props.expandedBriefSectionIds.includes(item.id), summaryRender: <><Text props={{ content: item.title, weight: "semibold" }} isLoading={isLoading} /><DisclosureIndicator props={{ isOpen: props.props.expandedBriefSectionIds.includes(item.id) }} /></>, bodyRender: <Article props={{ body: item.body }} isLoading={isLoading} />}))} renderSummary={(summary) => <>{summary}</>} renderBody={(body) => <>{body}</>} onItemOpenChange={(id, open) => props.on?.toggleBriefSection?.(id, open)} /></div>
        const visibleHint = props.props.hint?.trim()
        return <SurfaceCard key={section.id} props={{ label: section.label, inset: "compact" }} isLoading={isLoading}><Article props={{ body: section.body }} isLoading={isLoading} />{index === 0 && visibleHint ? <Text props={{ content: visibleHint, size: "sm", tone: "muted", icon: "review" }} /> : null}</SurfaceCard>
    })
    const implementation = props.props.implementation === undefined ? null : <SurfaceCard props={{ label: props.props.labels.implementation, inset: "compact" }}><Article props={{ body: props.props.implementation }} /></SurfaceCard>
    const criteria = props.props.criteria.length === 0 && !isLoading ? null : <SurfaceListCard props={{ label: props.props.labels.criteria }} isLoading={isLoading}>{props.props.criteria.map((criterion) => <div className={personalProjectTaskPeerItemClassName} key={criterion.id}><Text props={{ content: criterion.text, size: "sm" }} isLoading={isLoading} /><Badge props={{ content: props.props.labels.points(criterion.score) }} isLoading={isLoading} /></div>)}</SurfaceListCard>
    const status = props.props.notice === undefined ? null : <Text props={{ content: props.props.notice, size: "sm", tone: "muted", live: "assertive" }} />
    const briefContent = props.state === "forbidden" ? <SurfaceCard props={{ label: props.props.labels.lockedTitle, inset: "compact" }}>{status}<Link props={{ label: props.props.labels.back, icon: "back" }} on={{ press: props.on?.back }} /></SurfaceCard> : props.state === "task-error" ? <SurfaceCard props={{ inset: "compact" }}>{status}<Button props={{ label: props.props.labels.retry, variant: "primary" }} on={{ press: props.on?.retry }} /></SurfaceCard> : <>{brief}{implementation}{criteria}</>
    const submission = <SurfaceCard props={{ label: props.props.labels.submission, inset: "compact", measure: "form" }}><div className={personalProjectTaskConsoleBodyClassName}>
        <div className={personalProjectTaskStepClassName}><span className={personalProjectTaskStepNumberClassName}>1</span><div className={personalProjectTaskStepBodyClassName}><Text props={{ content: props.props.labels.sourceStep ?? props.props.labels.repository, weight: "semibold" }} /><div className={personalProjectTaskRepositoryFieldClassName}><Field props={{ id: "personal-project-repository", name: "personal-project-repository", label: props.props.labels.repository, description: props.props.labels.repositoryDescription, placeholder: props.props.labels.repositoryPlaceholder, defaultValue: props.props.repositoryDraft ?? props.props.repositoryUrl, disabled, isInvalid: repositoryInvalid, hint: repositoryInvalid ? props.props.notice : undefined }} on={{ change: props.on?.changeRepository }} isLoading={isLoading} /></div>{repositoryInvalid ? null : status}</div></div>
        <div className={personalProjectTaskStepClassName}><span className={personalProjectTaskStepNumberClassName}>2</span><div className={personalProjectTaskStepBodyClassName}><Text props={{ content: props.props.labels.analysisStep ?? props.props.labels.settings, weight: "semibold" }} /><Text props={{ content: props.props.labels.analysisDescription, size: "sm", tone: "muted" }} />{props.props.repositoryBranch === undefined ? null : <Text props={{ content: props.props.labels.branchFact?.(props.props.repositoryBranch) ?? `${props.props.labels.branch}: ${props.props.repositoryBranch}`, size: "xs", tone: "muted" }} />}{props.props.reviewLanguage === undefined ? null : <Text props={{ content: props.props.labels.languageFact?.(props.props.reviewLanguage) ?? `${props.props.labels.language}: ${props.props.reviewLanguage}`, size: "xs", tone: "muted" }} />}{props.props.reviewModelLabel === undefined ? null : <Text props={{ content: props.props.labels.modelFact?.(props.props.reviewModelLabel) ?? `${props.props.labels.model}: ${props.props.reviewModelLabel}`, size: "xs", tone: "muted" }} />}{props.props.tokenLast4 === undefined ? <Text props={{ content: props.props.labels.tokenMissing, size: "xs", tone: "muted" }} /> : <Text props={{ content: props.props.labels.tokenReady?.(props.props.tokenLast4) ?? props.props.labels.tokenStored(props.props.tokenLast4), size: "xs", tone: "muted" }} />}<Text props={{ content: props.props.labels.promptCache, size: "xs", tone: "muted" }} /><Button props={{ label: props.props.labels.settings, size: "sm", variant: "outline", icon: "settings", disabled }} on={{ press: props.on?.openSettings }} /></div></div>
        <div className={personalProjectTaskStepClassName}><span className={personalProjectTaskStepNumberClassName}>3</span><div className={personalProjectTaskStepBodyClassName}><Text props={{ content: props.props.labels.reviewStep ?? props.props.labels.evaluate, weight: "semibold" }} />{props.props.latestAttempt === undefined ? null : <div className={personalProjectTaskLatestClassName}><Text props={{ content: props.props.labels.latest, size: "xs", tone: "muted" }} /><Text props={{ content: `${props.props.latestAttempt.passed ? props.props.labels.passed : props.props.labels.needsWork} · ${props.props.labels.points(props.props.latestAttempt.score)}`, weight: "semibold" }} /></div>}{recovery ? <Button props={{ label: props.props.labels.retry, variant: "primary", icon: "retry" }} on={{ press: props.on?.retry }} /> : <Button props={{ label: props.props.labels.evaluate, variant: "primary", icon: "review", isPending: props.state === "submitting", disabled: disabled || repositoryInvalid || (props.props.repositoryDraft ?? props.props.repositoryUrl ?? "").trim() === "" }} on={{ press: props.on?.submit }} isLoading={isLoading} />}<div className={personalProjectTaskActionClassName}><Button props={{ label: props.props.labels.history, size: "sm", variant: "ghost", icon: "saved", disabled: isLoading }} on={{ press: props.on?.openHistory }} />{props.props.latestAttempt === undefined ? null : <Button props={{ label: props.props.labels.feedback, size: "sm", variant: "ghost", icon: "review" }} on={{ press: props.on?.openFeedback }} />}</div></div></div>
    </div></SurfaceCard>
    const activeView = props.props.isSubmissionOpen === true ? "submission" : "content"
    const selectView = (key: string) => {
        const shouldOpenSubmission = key === "submission"
        if (shouldOpenSubmission !== props.props.isSubmissionOpen) props.on?.toggleSubmission?.()
    }
    return (
        <div className={personalProjectTaskClassName}>
            <Link props={{ label: props.props.labels.back, icon: "back", emphasis: "muted" }} on={{ press: props.on?.back }} />
            <header className={personalProjectTaskHeaderClassName}>
                <Heading props={{ content: props.props.title, level: 1 }} isLoading={isLoading} />
                <Text props={{ content: props.props.description }} isLoading={isLoading} />
                <div className={personalProjectTaskMetaClassName}>
                    {props.props.difficulty === undefined ? null : <Badge props={{ content: props.props.difficulty }} isLoading={isLoading} />}
                    <Badge props={{ content: props.props.labels.points(props.props.maxScore) }} isLoading={isLoading} />
                </div>
            </header>
            <div className={personalProjectTaskLauncherClassName}>
                <ExtendedTabs
                    props={{
                        label: props.props.labels.workspaceLabel ?? props.props.labels.submission,
                        selectedKey: activeView,
                        labelVisibility: "always",
                        inset: "none",
                        tabs: [
                            { id: "content", label: props.props.labels.contentView ?? props.props.labels.guidance, icon: "course" },
                            { id: "submission", label: props.props.labels.submission, icon: "review" },
                        ],
                    }}
                    on={{ select: selectView }}
                    isLoading={isLoading}
                />
            </div>
            <main className={personalProjectTaskGridClassName}>
                <div className={personalProjectTaskBriefClassName} data-active={activeView === "content"}>{briefContent}
                    {props.state === "forbidden" || props.state === "task-error" ? null : <div className={personalProjectTaskTerminalClassName}>
                        <Button props={{ label: props.props.labels.openSubmission ?? props.props.labels.submission, variant: "primary", icon: "review", disabled }} on={{ press: props.on?.toggleSubmission }} isLoading={isLoading} />
                    </div>}
                </div>
                <aside className={personalProjectTaskConsoleClassName} data-active={activeView === "submission"}>{submission}</aside>
            </main>
            {props.settingsOverlay === undefined || props.settingsOverlayProps === undefined ? null : <props.settingsOverlay {...props.settingsOverlayProps} />}
            {props.historyOverlay === undefined || props.historyOverlayProps === undefined ? null : <props.historyOverlay {...props.historyOverlayProps} />}
        </div>
    )
}
