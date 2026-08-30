import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Badge } from "@/components/leaves/Badge"
import { Heading } from "@/components/leaves/Heading"
import { Icon } from "@/components/leaves/Icon"
import { Link } from "@/components/leaves/Link"
import { Progress } from "@/components/leaves/Progress"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import {
    coursePersonalProjectClassName,
    projectBodyClassName,
    projectCompletionFactsClassName,
    projectCurrentTaskHeaderClassName,
    projectCurrentTaskLinkClassName,
    projectCurrentTaskLinkCopyClassName,
    projectHeaderClassName,
    projectMilestoneClassName,
    projectMilestoneIdentityClassName,
    projectMilestoneMetaClassName,
    projectMilestoneNumberClassName,
    projectMilestoneProgressClassName,
    projectNextTaskClassName,
    projectRepositoryClassName,
    projectRoadmapClassName,
    projectRoadmapControlsClassName,
    projectRoadmapRowsClassName,
    projectSidebarClassName,
    projectStackClassName,
} from "./classNames"

/** One milestone summary in the whole-project roadmap. */
export type CoursePersonalProjectMilestoneRow = {
    readonly id: string
    readonly title: string
    readonly status: string
    readonly progress: string
    readonly completionPercent: number
    readonly href?: string
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
        }
        readonly notice?: string
        readonly retryLabel: string
    }
    readonly on?: {
        readonly openCourse?: () => void
        readonly retry?: () => void
        readonly retryRepository?: () => void
        readonly searchRoadmap?: (query: string) => void
    }
}

const pendingMilestones = (count: number): ReadonlyArray<CoursePersonalProjectMilestoneRow> =>
    Array.from({ length: count }, (_, index) => ({ id: `pending-${index}`, title: "", status: "", progress: "", completionPercent: 0 }))

type ProjectMilestoneRowProps = { readonly milestone: CoursePersonalProjectMilestoneRow; readonly index: number; readonly isLoading: boolean }

const ProjectMilestoneRow = (props: ProjectMilestoneRowProps) => {
    const milestone = props.milestone
    const content = <div className={projectMilestoneClassName(milestone.tone)}>
        <div className={projectMilestoneNumberClassName}>{String(props.index + 1).padStart(2, "0")}</div>
        <div className={projectMilestoneIdentityClassName}>
            <div className={projectMilestoneMetaClassName}>
                <Text props={{ content: milestone.status, size: "xs" }} isLoading={props.isLoading} />
                <Badge props={{ content: milestone.progress, tone: milestone.tone }} isLoading={props.isLoading} />
            </div>
            <Text props={{ content: milestone.title, size: "sm", weight: "semibold", isPressLabel: milestone.href !== undefined }} isLoading={props.isLoading} />
            <div className={projectMilestoneProgressClassName}>
                <Progress props={{ value: milestone.completionPercent, label: `${milestone.title}: ${milestone.progress}` }} isLoading={props.isLoading} />
            </div>
        </div>
        {milestone.href === undefined ? null : <Icon props={{ name: "disclosure", role: "chip" }} />}
    </div>

    return milestone.href === undefined || props.isLoading
        ? content
        : <PressableSurface label={milestone.title} href={milestone.href} hover="label">{content}</PressableSurface>
}

/** Render a mission-control overview: next decision, roadmap, progress evidence and repository. */
export const CoursePersonalProjectBase = (props: CoursePersonalProjectProps) => {
    const loading = props.state === "pending"
    const milestones = loading && props.data.milestones.length === 0 ? pendingMilestones(4) : props.data.milestones
    const repository = props.data.repository

    return <section className={coursePersonalProjectClassName}>
        <div className={projectHeaderClassName}>
            {props.data.courseTitle === undefined && !loading ? null : <Breadcrumbs props={{ label: props.data.breadcrumbLabel, steps: [{ id: "course", label: props.data.courseTitle ?? "" }, { id: "project", label: props.data.title }] }} on={loading ? undefined : { course: props.on?.openCourse }} isLoading={loading} />}
            <Heading props={{ content: props.data.title, level: 1 }} isLoading={loading} />
            <Text props={{ content: props.data.description, size: "md", tone: "muted" }} isLoading={loading} />
        </div>

        {props.data.notice === undefined ? null : <EmptyNotice props={{ message: props.data.notice, actionLabel: props.state === "failed" ? props.data.retryLabel : undefined }} on={{ act: props.on?.retry }} />}

        {props.state === "empty" || props.state === "failed" ? null : <div className={projectBodyClassName}>
            <div className={projectStackClassName}>
                <SurfaceCard props={{ label: props.data.nextTaskLabel }} isLoading={loading}>
                    <div className={projectNextTaskClassName}>
                        {props.data.nextTask === undefined ? null : <div className={projectCurrentTaskHeaderClassName}>
                            <Badge props={{ content: props.data.nextTask.milestone, tone: "accent" }} isLoading={loading} />
                            <Text props={{ content: props.data.nextTask.evidence, size: "xs" }} isLoading={loading} />
                        </div>}
                        {props.data.nextTask === undefined && !loading ? null : <Heading props={{ content: props.data.nextTask?.title, level: 2 }} isLoading={loading} />}
                        {props.data.nextTask === undefined && !loading
                            ? <Text props={{ content: props.data.allCompleteLabel, size: "sm", tone: "muted" }} />
                            : props.data.nextTask === undefined || loading
                                ? <div className={projectCurrentTaskLinkClassName} aria-hidden="true"><span>{props.data.continueLabel}</span></div>
                                : <PressableSurface label={props.data.continueLabel} href={props.data.nextTask.href} hover="surface">
                                    <span className={projectCurrentTaskLinkClassName}>
                                        <span className={projectCurrentTaskLinkCopyClassName}>{props.data.continueLabel}</span>
                                        <Icon props={{ name: "next", role: "chip" }} />
                                    </span>
                                </PressableSurface>}
                    </div>
                </SurfaceCard>

                <div className={projectRoadmapClassName}>
                    <SurfaceListCard
                        props={{ label: props.data.roadmapLabel, isScrollable: true }}
                        labelEnd={<div className={projectRoadmapControlsClassName}>
                            <Text props={{ content: props.data.roadmapCountLabel, size: "xs", tone: "muted" }} isLoading={loading} />
                            <SearchBox props={{ placeholder: props.data.roadmapSearchLabel, label: props.data.roadmapSearchLabel, clearLabel: props.data.roadmapSearchClearLabel }} on={loading ? undefined : { search: props.on?.searchRoadmap }} isLoading={loading} />
                        </div>}
                        isLoading={loading}
                    >
                        {milestones.length === 0 && !loading
                            ? <EmptyNotice props={{ message: props.data.roadmapEmptyLabel }} />
                            : <div className={projectRoadmapRowsClassName}>{milestones.map((milestone, index) => <ProjectMilestoneRow
                                key={milestone.id}
                                milestone={milestone}
                                index={index}
                                isLoading={loading}
                            />)}</div>}
                    </SurfaceListCard>
                </div>
            </div>

            <aside className={projectSidebarClassName}>
                <SurfaceCard props={{ label: props.data.completionLabel, fact: props.data.completionPercentLabel }} isLoading={loading}>
                    <div className={projectStackClassName}>
                        <Progress props={{ value: props.data.completionPercent, label: props.data.completionLabel }} isLoading={loading} />
                        <div className={projectCompletionFactsClassName}>{props.data.completionFacts.map((fact) => <EvidenceRow key={fact.label} props={{ title: fact.label, fact: fact.value }} isLoading={loading} />)}</div>
                    </div>
                </SurfaceCard>

                <SurfaceCard props={{ label: repository.label }} isLoading={repository.state === "pending"}>
                    <div className={projectRepositoryClassName}>
                        {repository.state === "failed"
                            ? <EmptyNotice props={{ message: repository.failedLabel, actionLabel: repository.retryLabel }} on={{ act: props.on?.retryRepository }} />
                            : <>
                                <Text props={{ content: repository.url === undefined ? repository.emptyLabel : repository.connectedLabel, size: "sm", tone: repository.url === undefined ? "muted" : "default", weight: repository.url === undefined ? "normal" : "medium" }} isLoading={repository.state === "pending"} />
                                {repository.branch === undefined ? null : <EvidenceRow props={{ title: repository.branchLabel, fact: repository.branch }} />}
                                {repository.url === undefined ? null : <Link props={{ label: repository.openLabel, externalHref: repository.url, icon: "github" }} />}
                            </>}
                    </div>
                </SurfaceCard>
            </aside>
        </div>}
    </section>
}
