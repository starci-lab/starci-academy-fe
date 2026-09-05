import { Badge, EmptyNotice, Heading, PageContainer, SurfaceCard, Tabs, Text, WorkspaceShell } from "@starci/grammar/common"
import { Article } from "@/components/branches/Article"
import { MarkdownCodeBlock } from "@/components/branches/MarkdownCodeBlock"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"
import { SelectionList } from "@/components/leaves/SelectionList"
import type { ConceptActivity, ConceptDetail, ConceptSection, ConceptWorkspaceFile } from "@/modules/api/graphql/queries/types/concept"
import {
    activityCardClassName,
    activityStackClassName,
    contextGroupClassName,
    contextStackClassName,
    detailBackClassName,
    detailHeaderClassName,
    detailMetaClassName,
    detailPageClassName,
    lessonHeaderClassName,
    navigationClassName,
    navigationHeaderClassName,
    optionClassName,
    optionListClassName,
    primaryClassName,
    referenceClassName,
    sourceStackClassName,
    statementListClassName,
} from "./classNames"

/** Peer material views within one selected lesson section. */
export type ConceptReaderTab = "lesson" | "source" | "practice"
/** Transport states the concept reader can truthfully present. */
export type ConceptDetailState = "pending" | "ready" | "missing" | "failed"

/** Localized copy required by the pure concept reader. */
export interface ConceptDetailLabels {
    readonly back: string
    readonly loadingTitle: string
    readonly loadingDescription: string
    readonly failed: string
    readonly missing: string
    readonly retry: string
    readonly minutes: (count: number) => string
    readonly overview: string
    readonly overviewPosition: string
    readonly path: string
    readonly position: (current: number, total: number) => string
    readonly tabs: { readonly group: string; readonly lesson: string; readonly source: string; readonly practice: string }
    readonly outcomes: string
    readonly prerequisites: string
    readonly sources: string
    readonly sourceUnavailable: string
    readonly runCommand: string
    readonly practice: string
    readonly practiceUnavailable: string
    readonly currentPrompt: string
    readonly references: string
    readonly noActivities: string
    readonly diagnostic: string
    readonly delayed: (days: number) => string
    readonly category: (value: string) => string
    readonly difficulty: (value: string) => string
    readonly phase: (value: string) => string
    readonly activity: (value: string) => string
}

/** Closed API data, local view selection, and callbacks for one concept. */
export interface ConceptDetailPageProps {
    readonly state: ConceptDetailState
    readonly concept?: ConceptDetail | null
    readonly selectedSectionId: string
    readonly selectedTab: ConceptReaderTab
    readonly catalogHref: string
    readonly labels: ConceptDetailLabels
    readonly onSelectSection?: (id: string) => void
    readonly onSelectTab?: (id: ConceptReaderTab) => void
    readonly onRetry?: () => void
}

type ActivityCardProps = { readonly activity: ConceptActivity; readonly labels: ConceptDetailLabels }
type LessonPanelProps = { readonly concept: ConceptDetail; readonly section?: ConceptSection; readonly labels: ConceptDetailLabels }
type SourcePanelProps = { readonly concept: ConceptDetail; readonly labels: ConceptDetailLabels }
type PracticePanelProps = { readonly activities: ReadonlyArray<ConceptActivity>; readonly labels: ConceptDetailLabels }

const languageOf = (path: string): string => {
    const extension = path.split(".").pop()?.toLowerCase()
    return extension === "ts" ? "typescript" : extension === "js" ? "javascript" : extension ?? "text"
}

const ActivityCard = ({ activity, labels }: ActivityCardProps) => {
    const seen = new Set([activity.prompt.trim()])
    const exerciseBody = activity.exercise == null ? "" : [activity.exercise.submissionInstructions, activity.exercise.verificationInstructions]
        .map((value) => value.trim())
        .filter((value) => {
            if (value === "" || seen.has(value)) return false
            seen.add(value)
            return true
        })
        .join("\n\n")
    return (
        <SurfaceCard composition="single" label={labels.activity(activity.kind)} state={activity.isDiagnostic === true ? "informative" : "neutral"}>
            <div className={activityCardClassName}>
                <Article props={{ body: activity.prompt, measure: "compact" }} />
                {activity.isDiagnostic === true ? <Badge tone="accent">{labels.diagnostic}</Badge> : null}
                {activity.afterDays == null ? null : <Text size="sm" tone="muted">{labels.delayed(activity.afterDays)}</Text>}
                {(activity.options?.length ?? 0) === 0 ? null : (
                    <ul className={optionListClassName}>
                        {activity.options?.map((option) => <li className={optionClassName} key={option.id}>{option.label}</li>)}
                    </ul>
                )}
                {exerciseBody === "" ? null : <Article props={{ body: exerciseBody, measure: "compact" }} />}
            </div>
        </SurfaceCard>
    )
}

const LessonPanel = ({ concept, section, labels }: LessonPanelProps) => {
    const isOverview = section === undefined
    const outcomes = concept.learningOutcomes ?? []
    const prerequisites = concept.prerequisites ?? []
    return (
        <section id="concept-panel-lesson" role="tabpanel" className={primaryClassName}>
            <header className={lessonHeaderClassName}>
                {isOverview ? null : <Badge tone="accent">{labels.phase(section.phase)}</Badge>}
                <Heading level={2}>{section?.title ?? labels.overview}</Heading>
            </header>
            <Article props={{ body: section?.body ?? concept.body ?? concept.description }} />
            {!isOverview || outcomes.length === 0 ? null : (
                <SurfaceCard label={labels.outcomes} composition="single">
                    <ul className={statementListClassName}>{outcomes.map((item) => <li key={item.id}>{item.text}</li>)}</ul>
                </SurfaceCard>
            )}
            {!isOverview || prerequisites.length === 0 ? null : (
                <SurfaceCard label={labels.prerequisites} composition="single">
                    <ul className={statementListClassName}>{prerequisites.map((item) => <li key={item.id}>{item.text}</li>)}</ul>
                </SurfaceCard>
            )}
        </section>
    )
}

const SourcePanel = ({ concept, labels }: SourcePanelProps) => {
    const files = (concept.workspace?.files ?? []).filter((file): file is ConceptWorkspaceFile & { readonly content: string } => typeof file.content === "string")
    const command = concept.workspace?.commands?.windows ?? concept.workspace?.commands?.unix
    return (
        <section id="concept-panel-source" role="tabpanel" className={sourceStackClassName}>
            <div className={lessonHeaderClassName}>
                <Heading level={2}>{labels.sources}</Heading>
                {concept.workspace?.runtime === undefined ? null : <Badge>{concept.workspace.runtime}</Badge>}
            </div>
            {command == null ? null : (
                <SurfaceCard label={labels.runCommand} composition="single">
                    <MarkdownCodeBlock props={{ code: command, language: "shell" }} />
                </SurfaceCard>
            )}
            {files.length === 0 ? <EmptyNotice message={labels.sourceUnavailable} /> : files.map((file) => (
                <SurfaceCard key={file.path} label={file.path} fact={file.role} composition="single">
                    <MarkdownCodeBlock props={{ code: file.content, language: languageOf(file.path) }} />
                </SurfaceCard>
            ))}
        </section>
    )
}

const PracticePanel = ({ activities, labels }: PracticePanelProps) => (
    <section id="concept-panel-practice" role="tabpanel" className={activityStackClassName}>
        <div className={lessonHeaderClassName}>
            <Heading level={2}>{labels.practice}</Heading>
            <Text tone="muted">{labels.practiceUnavailable}</Text>
        </div>
        {activities.length === 0 ? <EmptyNotice message={labels.noActivities} /> : activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} labels={labels} />
        ))}
    </section>
)

/** Draw one API-backed concept as a responsive navigation, lesson, and context workspace. */
export const ConceptDetailPageBase = (props: ConceptDetailPageProps) => {
    const { concept, labels } = props
    if (props.state === "failed") {
        return <main><PageContainer className={detailPageClassName}><EmptyNotice message={labels.failed} actionLabel={labels.retry} onAction={props.onRetry} /></PageContainer></main>
    }
    if (props.state === "missing") {
        return <main><PageContainer className={detailPageClassName}><EmptyNotice message={labels.missing} /></PageContainer></main>
    }
    if (props.state === "pending" || concept == null) {
        return <main><PageContainer className={detailPageClassName}><Heading level={1} isSkeleton>{labels.loadingTitle}</Heading><Text isSkeleton>{labels.loadingDescription}</Text></PageContainer></main>
    }

    const sections = [...concept.sections].sort((left, right) => left.sortIndex - right.sortIndex)
    const section = sections.find((item) => item.displayId === props.selectedSectionId)
    const currentIndex = section === undefined ? undefined : sections.findIndex((item) => item.displayId === section.displayId) + 1
    const activities = section?.activities ?? concept.activities ?? []
    const navigationItems = [
        { id: "overview", label: labels.overview, source: iconSourceFor("course", "leading") },
        ...sections.map((item) => ({ id: item.displayId, label: item.title, source: iconSourceFor("courseContent", "leading"), trailing: <Badge key={item.displayId}>{labels.phase(item.phase)}</Badge> })),
    ]
    const tabs = [
        { id: "lesson", label: labels.tabs.lesson, leading: <Icon source={iconSourceFor("course", "leading")} usage="leading" /> },
        { id: "source", label: labels.tabs.source, leading: <Icon source={iconSourceFor("personalProject", "leading")} usage="leading" /> },
        { id: "practice", label: labels.tabs.practice, leading: <Icon source={iconSourceFor("practice", "leading")} usage="leading" /> },
    ]
    const primary = (
        <div className={primaryClassName}>
            <Tabs label={labels.tabs.group} selectedKey={props.selectedTab} items={tabs} labelVisibility="always" panelId={(key) => `concept-panel-${key}`} onSelect={(key) => props.onSelectTab?.(key as ConceptReaderTab)} />
            {props.selectedTab === "source" ? <SourcePanel concept={concept} labels={labels} /> : props.selectedTab === "practice" ? <PracticePanel activities={activities} labels={labels} /> : <LessonPanel concept={concept} section={section} labels={labels} />}
        </div>
    )
    const navigation = (
        <div className={navigationClassName}>
            <div className={navigationHeaderClassName}>
                <Heading level={3}>{labels.path}</Heading>
                <Text size="sm" tone="muted">{currentIndex === undefined ? labels.overviewPosition : labels.position(currentIndex, sections.length)}</Text>
            </div>
            <SelectionList props={{
                id: "concept-section-list",
                label: labels.path,
                variant: "outline",
                selectedKey: props.selectedSectionId,
                items: navigationItems.map((item) => ({ id: item.id, textValue: item.label, title: item.label, icon: item.id === "overview" ? "course" : "courseContent" })),
            }} on={{ activate: props.onSelectSection }} />
        </div>
    )
    const currentActivity = activities[0]
    const linkedReferences = (concept.references ?? []).filter((reference): reference is typeof reference & { readonly url: string } => typeof reference.url === "string" && /^https?:\/\//i.test(reference.url))
    const rail = (
        <div className={contextStackClassName}>
            <SurfaceCard label={labels.currentPrompt} composition="single">
                <div className={contextGroupClassName}>
                    {currentActivity === undefined ? <Text tone="muted">{labels.noActivities}</Text> : <>
                        <Badge tone="accent">{labels.activity(currentActivity.kind)}</Badge>
                        <Article props={{ body: currentActivity.prompt, measure: "compact" }} />
                        {(currentActivity.options?.length ?? 0) === 0 ? null : <ul className={optionListClassName}>{currentActivity.options?.map((option) => <li className={optionClassName} key={option.id}>{option.label}</li>)}</ul>}
                        <Text size="sm" tone="muted">{labels.practiceUnavailable}</Text>
                    </>}
                </div>
            </SurfaceCard>
            {linkedReferences.length === 0 ? null : (
                <SurfaceCard label={labels.references} composition="single">
                    <ul className={statementListClassName}>{linkedReferences.map((reference) => <li key={reference.id}><a className={referenceClassName} href={reference.url} rel="noreferrer" target="_blank">{reference.label}</a></li>)}</ul>
                </SurfaceCard>
            )}
        </div>
    )

    return (
        <main>
            <PageContainer className={detailPageClassName} measure="full">
                <header className={detailHeaderClassName}>
                    <a className={detailBackClassName} href={props.catalogHref}>{labels.back}</a>
                    <div className={detailMetaClassName}>
                        <Badge tone="accent">{labels.category(concept.category)}</Badge><Badge>{labels.difficulty(concept.difficulty)}</Badge><Badge>{concept.implementation}</Badge><Text size="sm" tone="muted">{labels.minutes(concept.minutesRead)}</Text>
                    </div>
                    <Heading level={1}>{concept.title}</Heading>
                    <Text tone="muted">{concept.description}</Text>
                </header>
                <WorkspaceShell
                    mainLandmark="caller"
                    navigation={navigation}
                    navigationLabel={labels.path}
                    navigationTrack="fixed"
                    navigationVisibility="wide"
                    compactNavigation={<Tabs label={labels.path} selectedKey={props.selectedSectionId} items={navigationItems.map((item) => ({ id: item.id, label: item.label }))} labelVisibility="always" onSelect={props.onSelectSection} />}
                    compactNavigationLabel={labels.path}
                    primary={primary}
                    rail={rail}
                    railLabel={labels.currentPrompt}
                    railMode="sticky"
                    railWidth="standard"
                    align="start"
                />
            </PageContainer>
        </main>
    )
}
