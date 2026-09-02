import type { ComponentType } from "react"
import type { PersonalProjectHistoryAttempt } from "@/components/blocks/learn/PersonalProjectHistory"
import { Input, SurfaceAccordionCard, Button } from "@starci/grammar/common"
import { SurfaceCard } from "@starci/grammar/common"
import { SurfaceListCard } from "@starci/grammar/common"
import { ExtendedTabs } from "@/components/leaves/ExtendedTabs"
import { Article, segmentArticleSurfaces } from "@/components/branches/Article"
import { Badge } from "@starci/grammar/common"

import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Heading } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Icon } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
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
import { TextAction } from "@starci/grammar/common"


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
        if (section.kind === "peer-list") return <SurfaceListCard key={section.id} label={section.label ?? props.props.labels.guidance} labelHidden={section.label === undefined} isLoading={isLoading}>{section.items.map((item) => <div className={personalProjectTaskPeerItemClassName} key={item.id}><Article props={{ body: item.body }} isLoading={isLoading} /></div>)}</SurfaceListCard>
        if (section.kind === "accordion") return <div key={section.id}><Heading level={3}>{section.label ?? props.props.labels.guidance}</Heading><SurfaceAccordionCard depth="top" items={section.items.map((item) => ({ id: item.id, isOpen: props.props.expandedBriefSectionIds.includes(item.id), summaryRender: <><Text weight={"semibold"} isSkeleton={isLoading}>{item.title}</Text><DisclosureIndicator props={{ isOpen: props.props.expandedBriefSectionIds.includes(item.id) }} /></>, bodyRender: <Article props={{ body: item.body }} isLoading={isLoading} />}))} renderSummary={(summary) => <>{summary}</>} renderBody={(body) => <>{body}</>} onItemOpenChange={(id, open) => props.on?.toggleBriefSection?.(id, open)} /></div>
        const visibleHint = props.props.hint?.trim()
        return <SurfaceCard key={section.id} label={section.label} composition="single" state={isLoading ? "pending" : "neutral"}><Article props={{ body: section.body }} isLoading={isLoading} />{index === 0 && visibleHint ? <Text size={"sm"} tone={"muted"} startContent={<Icon source={iconSourceFor("review", "chip")} usage="chip" />}>{visibleHint}</Text> : null}</SurfaceCard>
    })
    const implementation = props.props.implementation === undefined ? null : <SurfaceCard label={props.props.labels.implementation} composition="single"><Article props={{ body: props.props.implementation }} /></SurfaceCard>
    const criteria = props.props.criteria.length === 0 && !isLoading ? null : <SurfaceListCard label={props.props.labels.criteria} isLoading={isLoading}>{props.props.criteria.map((criterion) => <div className={personalProjectTaskPeerItemClassName} key={criterion.id}><Text size={"sm"} isSkeleton={isLoading}>{criterion.text}</Text><Badge isSkeleton={isLoading}>{props.props.labels.points(criterion.score)}</Badge></div>)}</SurfaceListCard>
    const status = props.props.notice === undefined ? null : <Text size={"sm"} tone={"muted"} live={"assertive"}>{props.props.notice}</Text>
    const briefContent = props.state === "forbidden" ? <SurfaceCard label={props.props.labels.lockedTitle} composition="single">{status}<TextAction startContent={<Icon source={iconSourceFor("back", "chip")} usage="chip" />} onPress={props.on?.back}>{props.props.labels.back}</TextAction></SurfaceCard> : props.state === "task-error" ? <SurfaceCard composition="single">{status}<Button variant="primary" onPress={props.on?.retry}>{props.props.labels.retry}</Button></SurfaceCard> : <>{brief}{implementation}{criteria}</>
    const submission = <SurfaceCard label={props.props.labels.submission} measure={"form"} composition="single"><div className={personalProjectTaskConsoleBodyClassName}>
        <div className={personalProjectTaskStepClassName}><span className={personalProjectTaskStepNumberClassName}>1</span><div className={personalProjectTaskStepBodyClassName}><Text weight={"semibold"}>{props.props.labels.sourceStep ?? props.props.labels.repository}</Text><div className={personalProjectTaskRepositoryFieldClassName}><Input id="personal-project-repository" name="personal-project-repository" label={props.props.labels.repository} hint={props.props.labels.repositoryDescription} placeholder={props.props.labels.repositoryPlaceholder} value={props.props.repositoryDraft ?? props.props.repositoryUrl} variant="secondary" isDisabled={disabled || isLoading} isError={repositoryInvalid} errorMessage={repositoryInvalid ? props.props.notice : undefined} onValueChange={props.on?.changeRepository} /></div>{repositoryInvalid ? null : status}</div></div>
        <div className={personalProjectTaskStepClassName}><span className={personalProjectTaskStepNumberClassName}>2</span><div className={personalProjectTaskStepBodyClassName}><Text weight={"semibold"}>{props.props.labels.analysisStep ?? props.props.labels.settings}</Text><Text size={"sm"} tone={"muted"}>{props.props.labels.analysisDescription}</Text>{props.props.repositoryBranch === undefined ? null : <Text size={"xs"} tone={"muted"}>{props.props.labels.branchFact?.(props.props.repositoryBranch) ?? `${props.props.labels.branch}: ${props.props.repositoryBranch}`}</Text>}{props.props.reviewLanguage === undefined ? null : <Text size={"xs"} tone={"muted"}>{props.props.labels.languageFact?.(props.props.reviewLanguage) ?? `${props.props.labels.language}: ${props.props.reviewLanguage}`}</Text>}{props.props.reviewModelLabel === undefined ? null : <Text size={"xs"} tone={"muted"}>{props.props.labels.modelFact?.(props.props.reviewModelLabel) ?? `${props.props.labels.model}: ${props.props.reviewModelLabel}`}</Text>}{props.props.tokenLast4 === undefined ? <Text size={"xs"} tone={"muted"}>{props.props.labels.tokenMissing}</Text> : <Text size={"xs"} tone={"muted"}>{props.props.labels.tokenReady?.(props.props.tokenLast4) ?? props.props.labels.tokenStored(props.props.tokenLast4)}</Text>}<Text size={"xs"} tone={"muted"}>{props.props.labels.promptCache}</Text><Button variant="outline" size="sm" isDisabled={disabled} onPress={props.on?.openSettings}>{props.props.labels.settings}</Button></div></div>
        <div className={personalProjectTaskStepClassName}><span className={personalProjectTaskStepNumberClassName}>3</span><div className={personalProjectTaskStepBodyClassName}><Text weight={"semibold"}>{props.props.labels.reviewStep ?? props.props.labels.evaluate}</Text>{props.props.latestAttempt === undefined ? null : <div className={personalProjectTaskLatestClassName}><Text size={"xs"} tone={"muted"}>{props.props.labels.latest}</Text><Text weight={"semibold"}>{`${props.props.latestAttempt.passed ? props.props.labels.passed : props.props.labels.needsWork} · ${props.props.labels.points(props.props.latestAttempt.score)}`}</Text></div>}{recovery ? <Button variant="primary" onPress={props.on?.retry}>{props.props.labels.retry}</Button> : <Button variant={"primary"} isDisabled={disabled || repositoryInvalid || (props.props.repositoryDraft ?? props.props.repositoryUrl ?? "").trim() === ""} isPending={props.state === "submitting"} isSkeleton={isLoading} onPress={({ press: props.on?.submit })?.press}>{props.props.labels.evaluate}</Button>}<div className={personalProjectTaskActionClassName}><Button variant="ghost" size="sm" isDisabled={isLoading} onPress={props.on?.openHistory}>{props.props.labels.history}</Button>{props.props.latestAttempt === undefined ? null : <Button variant="ghost" size="sm" onPress={props.on?.openFeedback}>{props.props.labels.feedback}</Button>}</div></div></div>
    </div></SurfaceCard>
    const activeView = props.props.isSubmissionOpen === true ? "submission" : "content"
    const selectView = (key: string) => {
        const shouldOpenSubmission = key === "submission"
        if (shouldOpenSubmission !== props.props.isSubmissionOpen) props.on?.toggleSubmission?.()
    }
    return (
        <div className={personalProjectTaskClassName}>
            <TextAction appearance={"muted"} startContent={<Icon source={iconSourceFor("back", "chip")} usage="chip" />} onPress={props.on?.back}>{props.props.labels.back}</TextAction>
            <header className={personalProjectTaskHeaderClassName}>
                <Heading level={1} isSkeleton={isLoading}>{props.props.title}</Heading>
                <Text isSkeleton={isLoading}>{props.props.description}</Text>
                <div className={personalProjectTaskMetaClassName}>
                    {props.props.difficulty === undefined ? null : <Badge isSkeleton={isLoading}>{props.props.difficulty}</Badge>}
                    <Badge isSkeleton={isLoading}>{props.props.labels.points(props.props.maxScore)}</Badge>
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
                        <Button variant={"primary"} isSkeleton={isLoading} onPress={({ press: props.on?.toggleSubmission })?.press}>{props.props.labels.openSubmission ?? props.props.labels.submission}</Button>
                    </div>}
                </div>
                <aside className={personalProjectTaskConsoleClassName} data-active={activeView === "submission"}>{submission}</aside>
            </main>
            {props.settingsOverlay === undefined || props.settingsOverlayProps === undefined ? null : <props.settingsOverlay {...props.settingsOverlayProps} />}
            {props.historyOverlay === undefined || props.historyOverlayProps === undefined ? null : <props.historyOverlay {...props.historyOverlayProps} />}
        </div>
    )
}
