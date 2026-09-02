import Image from "next/image"
import NextLink from "next/link"
import { PrimaryRailLayout, Rail, SectionHeader } from "@starci/grammar/common"
import { SurfaceCard } from "@starci/grammar/common"
import { SurfaceListCard } from "@starci/grammar/common"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { EmptyNotice } from "@starci/grammar/common"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Badge } from "@starci/grammar/common"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Button } from "@starci/grammar/common"
import { Heading } from "@starci/grammar/common"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Progress } from "@starci/grammar/common"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@starci/grammar/common"
import {
    coursePersonalProjectClassName,
    projectBodyClassName,
    projectActionGlyphClassName,
    projectHeaderClassName,
    projectHeroClassName,
    projectHeroContentClassName,
    projectHeroIntroClassName,
    projectHeroImageClassName,
    projectHeroMediaClassName,
    projectHeroTaskClassName,
    projectHeroTaskMetaClassName,
    projectMetricGridClassName,
    projectMetricItemClassName,
    projectMilestoneIdentityClassName,
    projectMilestoneMarkerClassName,
    projectMilestoneMarkerCompleteClassName,
    projectMilestoneRowClassName,
    projectMilestoneTextClassName,
    projectNextTaskClassName,
    projectPrimaryActionLinkClassName,
    projectRepositoryClassName,
    projectRoadmapClassName,
    projectRoadmapControlsClassName,
    projectRoadmapHeaderClassName,
    projectRoadmapRowsClassName,
    projectSecondaryActionLinkClassName,
    projectSidebarClassName,
    projectStackClassName,
} from "./classNames"
import { Link } from "@starci/grammar/common"


/** One milestone summary in the whole-project roadmap. */
export type CoursePersonalProjectMilestoneRow = {
    readonly id: string
    readonly position?: number
    readonly title: string
    readonly status: string
    readonly progress: string
    readonly targetTaskId?: string
    readonly targetTaskHref?: string
    readonly tone?: "neutral" | "accent" | "success"
}

/** The next executable task shown as the dashboard's only primary action. */
export type CoursePersonalProjectNextTask = {
    readonly id: string
    readonly milestone: string
    readonly title: string
    readonly evidence: string
    readonly href: string
}

/** One aggregate project fact. */
export type CoursePersonalProjectFact = { readonly label: string; readonly value: string }
/** Genuine whole-block states; only these alter the block's notices and resting geometry. */
export type CoursePersonalProjectState = "pending" | "ready" | "empty" | "failed"
/** Repository is ancillary: its failure never removes the project roadmap. */
export type CoursePersonalProjectRepositoryState = "pending" | "ready" | "failed"

/** Pure project dashboard data and actions. */
export type CoursePersonalProjectProps = {
    readonly state: CoursePersonalProjectState
    readonly data: {
        readonly breadcrumbLabel: string
        readonly courseTitle?: string
        readonly title: string
        readonly description: string
        readonly mediaAlt: string
        readonly nextTaskLabel: string
        readonly nextTask?: CoursePersonalProjectNextTask
        readonly continueLabel: string
        readonly nextTaskFallbackLabel: string
        readonly roadmapLabel: string
        readonly roadmapLoadingLabel: string
        readonly roadmapSearchLabel: string
        readonly roadmapSearchClearLabel: string
        readonly roadmapCountLabel: string
        readonly roadmapEmptyLabel: string
        readonly milestones: ReadonlyArray<CoursePersonalProjectMilestoneRow>
        readonly completionLabel: string
        readonly projectRailLabel: string
        readonly completionPercent?: number
        readonly completionPercentLabel: string
        readonly completionFacts: ReadonlyArray<CoursePersonalProjectFact>
        readonly repository: {
            readonly state: CoursePersonalProjectRepositoryState
            readonly label: string
            readonly connectedLabel: string
            readonly emptyLabel: string
            readonly failedLabel: string
            readonly branchLabel: string
            readonly branch?: string
            readonly url?: string
            readonly openLabel: string
            readonly retryLabel: string
            readonly continueLabel: string
        }
        readonly notice?: string
        readonly retryLabel: string
    }
    readonly on?: {
        readonly openCourse?: () => void
        readonly openTask?: (id: string) => void
        readonly retry?: () => void
        readonly retryRepository?: () => void
        readonly searchRoadmap?: (query: string) => void
    }
}

const pendingMilestones = (count: number): ReadonlyArray<CoursePersonalProjectMilestoneRow> =>
    Array.from({ length: count }, (_, index) => ({ id: `pending-${index}`, title: "", status: "", progress: "" }))

type ProjectMilestoneRowInput = {
    readonly milestone: CoursePersonalProjectMilestoneRow
    readonly position: number
    readonly loading: boolean
    readonly onOpen?: () => void
}

const ProjectMilestoneRow = (input: ProjectMilestoneRowInput) => {
    const marker = input.milestone.tone === "success"
        ? <span className={projectMilestoneMarkerCompleteClassName}><Icon source={iconSourceFor("complete", "chip")} usage={"chip"} /></span>
        : <span className={projectMilestoneMarkerClassName}>{input.loading ? "" : String(input.milestone.position ?? input.position).padStart(2, "0")}</span>
    const content = <div className={projectMilestoneRowClassName} data-state={input.milestone.tone ?? "neutral"}>
        <div className={projectMilestoneIdentityClassName}>
            {marker}
            <div className={projectMilestoneTextClassName}>
                <Text size={"sm"} weight={"semibold"} isSkeleton={input.loading}>{input.milestone.title}</Text>
                <Text size={"sm"} isSkeleton={input.loading}>{input.milestone.status}</Text>
            </div>
        </div>
        <Badge tone={input.milestone.tone} isSkeleton={input.loading}>{input.milestone.progress}</Badge>
        {input.milestone.targetTaskId === undefined ? null : <Icon source={iconSourceFor("disclosure", "chip")} usage={"chip"} />}
    </div>

    return input.milestone.targetTaskId === undefined
        ? content
        : <PressableSurface href={input.milestone.targetTaskHref} label={input.milestone.title} press={input.onOpen}>{content}</PressableSurface>
}

/** Render a mission-control overview: next decision, roadmap, progress evidence and repository. */
export const CoursePersonalProjectBase = (props: CoursePersonalProjectProps) => {
    const loading = props.state === "pending"
    const milestones = loading && props.data.milestones.length === 0 ? pendingMilestones(6) : props.data.milestones
    const repository = props.data.repository
    const nextTask = props.data.nextTask
    const nextTaskAction = loading
        ? <Button variant={"primary"} size={"md"} isSkeleton endContent={<Icon source={iconSourceFor("next", "chip")} usage="chip" />}>{props.data.continueLabel}</Button>
        : nextTask === undefined
            ? null
            : <NextLink href={nextTask.href} className={projectPrimaryActionLinkClassName} aria-label={props.data.continueLabel}>
                <span>{props.data.continueLabel}</span><span className={projectActionGlyphClassName} aria-hidden="true">→</span>
            </NextLink>

    return <section className={coursePersonalProjectClassName}>
        <div className={projectHeaderClassName}>
            {props.data.courseTitle === undefined && !loading ? null : <Breadcrumbs props={{ label: props.data.breadcrumbLabel, steps: [{ id: "course", label: props.data.courseTitle ?? "" }, { id: "project", label: props.data.title }] }} on={loading ? undefined : { course: props.on?.openCourse }} isLoading={loading} />}
            {props.state === "empty" || props.state === "failed" ? <SectionHeader
                eyebrow={props.data.nextTaskLabel}
                title={props.data.title}
                description={props.data.description}
                level={1}
                composition="context-intro"
            /> : null}
        </div>

        {props.data.notice === undefined ? null : <EmptyNotice message={props.data.notice} actionLabel={props.state === "failed" ? props.data.retryLabel : undefined} onAction={({ act: props.on?.retry })?.act} />}

        {props.state === "empty" || props.state === "failed" ? null : <>
            <section className={projectHeroClassName} aria-labelledby="personal-project-heading">
                <div className={projectHeroContentClassName}>
                    <SectionHeader
                        eyebrow={props.data.nextTaskLabel}
                        title={props.data.title}
                        description={props.data.description}
                        level={1}
                        id="personal-project-heading"
                        className={projectHeroIntroClassName}
                        composition="context-intro"
                    />
                    <div className={projectHeroTaskClassName}>
                        {props.data.nextTask === undefined ? null : <Text size={"sm"} weight={"semibold"} isSkeleton={loading}>{props.data.nextTask.milestone}</Text>}
                        {props.data.nextTask === undefined && !loading ? null : <Heading level={2} isSkeleton={loading}>{props.data.nextTask?.title}</Heading>}
                        {props.data.nextTask === undefined
                            ? <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.data.nextTaskFallbackLabel}</Text>
                            : <div className={projectHeroTaskMetaClassName}>
                                <Text size={"sm"} isSkeleton={loading}>{props.data.nextTask.evidence}</Text>
                            </div>}
                        {nextTaskAction}
                    </div>
                </div>
                <div className={projectHeroMediaClassName}>
                    <Image
                        className={projectHeroImageClassName}
                        src="/images/personal-project/project-delivery-journey-v1.png"
                        alt={props.data.mediaAlt}
                        width={1536}
                        height={1024}
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 560px"
                        priority
                    />
                </div>
            </section>

            <PrimaryRailLayout
                className={projectBodyClassName}
                railWidth="standard"
                primary={<div className={projectStackClassName}>
                    <div className={projectRoadmapClassName}>
                        <div className={projectRoadmapHeaderClassName}>
                            <Heading level={2} isSkeleton={loading}>{props.data.roadmapLabel}</Heading>
                            <div className={projectRoadmapControlsClassName}>
                                <Text size={"sm"} tone={loading ? "muted" : undefined}>{loading ? props.data.roadmapLoadingLabel : props.data.roadmapCountLabel}</Text>
                                {loading ? null : <SearchBox props={{ placeholder: props.data.roadmapSearchLabel, label: props.data.roadmapSearchLabel, clearLabel: props.data.roadmapSearchClearLabel }} on={{ search: props.on?.searchRoadmap }} />}
                            </div>
                        </div>
                        <SurfaceListCard label={props.data.roadmapLabel} labelHidden={true} isScrollable={true} isLoading={loading}>
                            {milestones.length === 0 && !loading
                                ? <EmptyNotice message={props.data.roadmapEmptyLabel} />
                                : <ol className={projectRoadmapRowsClassName} data-project-roadmap="true">{milestones.map((milestone, index) => <li key={milestone.id}><ProjectMilestoneRow
                                    milestone={milestone}
                                    position={index + 1}
                                    loading={loading}
                                    onOpen={milestone.targetTaskId === undefined || milestone.targetTaskHref !== undefined ? undefined : () => props.on?.openTask?.(milestone.targetTaskId ?? "")}
                                /></li>)}</ol>}
                        </SurfaceListCard>
                    </div>
                </div>}
                rail={<Rail label={props.data.projectRailLabel} mode="sticky" inset="content" isLabelHidden>
                    <div className={projectSidebarClassName}>
                        <SurfaceCard label={props.data.completionLabel} fact={props.data.completionPercentLabel} composition="joined" state={loading ? "pending" : "neutral"}>
                            <div className={projectNextTaskClassName}>
                                <Progress label={props.data.completionLabel} value={props.data.completionPercent} isSkeleton={loading} />
                                <div className={projectMetricGridClassName}>
                                    {props.data.completionFacts.map((fact) => <div key={fact.label} className={projectMetricItemClassName}>
                                        <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{fact.label}</Text>
                                        <Text size={"md"} weight={"semibold"} isSkeleton={loading}>{fact.value}</Text>
                                    </div>)}
                                </div>
                            </div>
                        </SurfaceCard>

                        <SurfaceCard label={repository.label} composition="joined" state={repository.state === "pending" ? "pending" : "neutral"}>
                            <div className={projectRepositoryClassName}>
                                {repository.state === "failed"
                                    ? <EmptyNotice message={repository.failedLabel} actionLabel={repository.retryLabel} onAction={({ act: props.on?.retryRepository })?.act} />
                                    : <>
                                        <Text size={"sm"} weight={repository.url === undefined ? "normal" : "medium"} isSkeleton={repository.state === "pending"}>{repository.url === undefined ? repository.emptyLabel : repository.connectedLabel}</Text>
                                        {repository.branch === undefined ? null : <EvidenceRow props={{ title: repository.branchLabel, fact: repository.branch }} />}
                                        {repository.url === undefined
                                            ? repository.state === "ready" && props.data.nextTask !== undefined
                                                ? <NextLink href={props.data.nextTask.href} className={projectSecondaryActionLinkClassName} aria-label={repository.continueLabel}>
                                                    <span>{repository.continueLabel}</span><span className={projectActionGlyphClassName} aria-hidden="true">→</span>
                                                </NextLink>
                                                : null
                                            : <Link href={repository.url} startContent={<Icon source={iconSourceFor("github", "chip")} usage="chip" />}>{repository.openLabel}</Link>}
                                    </>}
                            </div>
                        </SurfaceCard>
                    </div>
                </Rail>}
            />
        </>}
    </section>
}
