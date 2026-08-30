import Image from "next/image"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Badge } from "@/components/leaves/Badge"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Icon } from "@/components/leaves/Icon"
import { Link } from "@/components/leaves/Link"
import { Progress } from "@/components/leaves/Progress"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import {
    coursePersonalProjectClassName,
    projectBodyClassName,
    projectHeaderClassName,
    projectHeroClassName,
    projectHeroContentClassName,
    projectHeroCopyClassName,
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
    projectRepositoryClassName,
    projectRoadmapClassName,
    projectRoadmapControlsClassName,
    projectRoadmapHeaderClassName,
    projectRoadmapRowsClassName,
    projectSidebarClassName,
    projectStackClassName,
} from "./classNames"

/** One milestone summary in the whole-project roadmap. */
export type CoursePersonalProjectMilestoneRow = {
    readonly id: string
    readonly position?: number
    readonly title: string
    readonly status: string
    readonly progress: string
    readonly targetTaskId?: string
    readonly tone?: "neutral" | "accent" | "success"
}

/** The next executable task shown as the dashboard's only primary action. */
export type CoursePersonalProjectNextTask = {
    readonly id: string
    readonly milestone: string
    readonly title: string
    readonly evidence: string
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
        readonly allCompleteLabel: string
        readonly roadmapLabel: string
        readonly roadmapSearchLabel: string
        readonly roadmapSearchClearLabel: string
        readonly roadmapCountLabel: string
        readonly roadmapEmptyLabel: string
        readonly milestones: ReadonlyArray<CoursePersonalProjectMilestoneRow>
        readonly completionLabel: string
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
        ? <span className={projectMilestoneMarkerCompleteClassName}><Icon props={{ name: "complete", role: "chip" }} /></span>
        : <span className={projectMilestoneMarkerClassName}>{input.loading ? "" : String(input.milestone.position ?? input.position).padStart(2, "0")}</span>
    const content = <div className={projectMilestoneRowClassName} data-state={input.milestone.tone ?? "neutral"}>
        <div className={projectMilestoneIdentityClassName}>
            {marker}
            <div className={projectMilestoneTextClassName}>
                <Text props={{ content: input.milestone.title, size: "sm", weight: "semibold" }} isLoading={input.loading} />
                <Text props={{ content: input.milestone.status, size: "sm" }} isLoading={input.loading} />
            </div>
        </div>
        <Badge props={{ content: input.milestone.progress, tone: input.milestone.tone }} isLoading={input.loading} />
        {input.milestone.targetTaskId === undefined ? null : <Icon props={{ name: "disclosure", role: "chip" }} />}
    </div>

    return input.milestone.targetTaskId === undefined
        ? content
        : <PressableSurface label={input.milestone.title} press={input.onOpen}>{content}</PressableSurface>
}

/** Render a mission-control overview: next decision, roadmap, progress evidence and repository. */
export const CoursePersonalProjectBase = (props: CoursePersonalProjectProps) => {
    const loading = props.state === "pending"
    const milestones = loading && props.data.milestones.length === 0 ? pendingMilestones(4) : props.data.milestones
    const repository = props.data.repository

    return <section className={coursePersonalProjectClassName}>
        <div className={projectHeaderClassName}>
            {props.data.courseTitle === undefined && !loading ? null : <Breadcrumbs props={{ label: props.data.breadcrumbLabel, steps: [{ id: "course", label: props.data.courseTitle ?? "" }, { id: "project", label: props.data.title }] }} on={loading ? undefined : { course: props.on?.openCourse }} isLoading={loading} />}
            {props.state === "empty" || props.state === "failed" ? <>
                <Heading props={{ content: props.data.title, level: 1 }} />
                <Text props={{ content: props.data.description, size: "md", tone: "muted" }} />
            </> : null}
        </div>

        {props.data.notice === undefined ? null : <EmptyNotice props={{ message: props.data.notice, actionLabel: props.state === "failed" ? props.data.retryLabel : undefined }} on={{ act: props.on?.retry }} />}

        {props.state === "empty" || props.state === "failed" ? null : <>
            <section className={projectHeroClassName}>
                <div className={projectHeroContentClassName}>
                    <div className={projectHeroCopyClassName}>
                        <Badge props={{ content: props.data.nextTaskLabel, tone: "accent", icon: "personalProject" }} isLoading={loading} />
                        <Heading props={{ content: props.data.title, level: 1 }} isLoading={loading} />
                        <Text props={{ content: props.data.description, size: "md" }} isLoading={loading} />
                    </div>
                    <div className={projectHeroTaskClassName}>
                        {props.data.nextTask === undefined ? null : <Text props={{ content: props.data.nextTask.milestone, size: "sm", weight: "semibold" }} isLoading={loading} />}
                        {props.data.nextTask === undefined && !loading ? null : <Heading props={{ content: props.data.nextTask?.title, level: 2 }} isLoading={loading} />}
                        {props.data.nextTask === undefined
                            ? <Text props={{ content: props.data.allCompleteLabel, size: "sm", tone: "muted" }} isLoading={loading} />
                            : <div className={projectHeroTaskMetaClassName}>
                                <Text props={{ content: props.data.nextTask.evidence, size: "sm" }} isLoading={loading} />
                            </div>}
                        {props.data.nextTask === undefined && !loading ? null : <Button props={{ label: props.data.continueLabel, variant: "primary", size: "md", icon: "next", iconPlacement: "trailing" }} on={loading ? undefined : { press: () => props.data.nextTask === undefined ? undefined : props.on?.openTask?.(props.data.nextTask.id) }} isLoading={loading} />}
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

            <div className={projectBodyClassName}>
                <div className={projectStackClassName}>
                    <div className={projectRoadmapClassName}>
                        <div className={projectRoadmapHeaderClassName}>
                            <Heading props={{ content: props.data.roadmapLabel, level: 2 }} isLoading={loading} />
                            <div className={projectRoadmapControlsClassName}>
                                <Text props={{ content: props.data.roadmapCountLabel, size: "sm" }} isLoading={loading} />
                                <SearchBox props={{ placeholder: props.data.roadmapSearchLabel, label: props.data.roadmapSearchLabel, clearLabel: props.data.roadmapSearchClearLabel }} on={loading ? undefined : { search: props.on?.searchRoadmap }} isLoading={loading} />
                            </div>
                        </div>
                        <SurfaceListCard
                            props={{ label: props.data.roadmapLabel, isLabelHidden: true, isScrollable: true }}
                            isLoading={loading}
                        >
                            {milestones.length === 0 && !loading
                                ? <EmptyNotice props={{ message: props.data.roadmapEmptyLabel }} />
                                : <div className={projectRoadmapRowsClassName}>{milestones.map((milestone, index) => <ProjectMilestoneRow
                                    key={milestone.id}
                                    milestone={milestone}
                                    position={index + 1}
                                    loading={loading}
                                    onOpen={milestone.targetTaskId === undefined ? undefined : () => props.on?.openTask?.(milestone.targetTaskId ?? "")}
                                />)}</div>}
                        </SurfaceListCard>
                    </div>
                </div>

                <aside className={projectSidebarClassName}>
                    <SurfaceCard props={{ label: props.data.completionLabel, fact: props.data.completionPercentLabel }} isLoading={loading}>
                        <div className={projectNextTaskClassName}>
                            <Progress props={{ value: props.data.completionPercent, label: props.data.completionLabel }} isLoading={loading} />
                            <div className={projectMetricGridClassName}>
                                {props.data.completionFacts.map((fact) => <div key={fact.label} className={projectMetricItemClassName}>
                                    <Text props={{ content: fact.value, size: "md", weight: "semibold" }} isLoading={loading} />
                                    <Text props={{ content: fact.label, size: "xs", tone: "muted" }} isLoading={loading} />
                                </div>)}
                            </div>
                        </div>
                    </SurfaceCard>

                    <SurfaceCard props={{ label: repository.label }} isLoading={repository.state === "pending"}>
                        <div className={projectRepositoryClassName}>
                            {repository.state === "failed"
                                ? <EmptyNotice props={{ message: repository.failedLabel, actionLabel: repository.retryLabel }} on={{ act: props.on?.retryRepository }} />
                                : <>
                                    <Text props={{ content: repository.url === undefined ? repository.emptyLabel : repository.connectedLabel, size: "sm", weight: repository.url === undefined ? "normal" : "medium" }} isLoading={repository.state === "pending"} />
                                    {repository.branch === undefined ? null : <EvidenceRow props={{ title: repository.branchLabel, fact: repository.branch }} />}
                                    {repository.url === undefined
                                        ? repository.state === "ready" && props.data.nextTask !== undefined
                                            ? <Button props={{ label: repository.continueLabel, variant: "secondary", size: "sm", icon: "next", iconPlacement: "trailing" }} on={{ press: () => props.on?.openTask?.(props.data.nextTask?.id ?? "") }} />
                                            : null
                                        : <Link props={{ label: repository.openLabel, externalHref: repository.url, icon: "github" }} />}
                                </>}
                        </div>
                    </SurfaceCard>
                </aside>
            </div>
        </>}
    </section>
}
