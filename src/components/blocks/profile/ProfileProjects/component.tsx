import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { ProfileProjectCard } from "@/components/composites/ProfileProjectCard"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import type { ProfileCapstone, ProfilePinnedProject } from "@/modules/api/graphql/queries/types/profile-evidence"
import { profileCapstoneBodyClassName, profileCapstoneHeaderClassName, profileCapstoneListClassName, profileCapstoneMetaClassName, profileMainClassName, profileProjectCardGridClassName } from "./classNames"
/** Independent request state for profile evidence. */
export type EvidenceState<T> = { readonly state: "pending" | "ready" | "error"; readonly data: ReadonlyArray<T> }
/** Resolved project evidence and navigation. */
export type ProfileProjectsProps = {
    readonly pinned: EvidenceState<ProfilePinnedProject>
    readonly capstones: EvidenceState<ProfileCapstone>
    readonly labels: { readonly pinned: string; readonly capstones: string; readonly milestones: string; readonly tasks: string; readonly courseKind: string; readonly externalKind: string; readonly openProject: string; readonly retry: string; readonly emptyPinned: string; readonly emptyCapstones: string; readonly error: string }
    readonly on: { readonly openPinned: (url: string) => void; readonly openCapstone: (id: string) => void; readonly retry?: () => void }
}

const PinnedProjectsList = (props: ProfileProjectsProps) => {
    const loading = props.pinned.state === "pending"
    if (!loading && props.pinned.data.length === 0) {
        return <SurfaceListCard props={{ label: props.labels.pinned }}>
            <EmptyNotice props={{ icon: props.pinned.state === "error" ? "retry" : "course", message: props.pinned.state === "error" ? props.labels.error : props.labels.emptyPinned, actionLabel: props.pinned.state === "error" ? props.labels.retry : undefined, actionIcon: "retry" }} on={{ act: props.on.retry }} />
        </SurfaceListCard>
    }
    const projects = loading
        ? Array.from({ length: 2 }, (_, index) => ({ id: `resting-${index}`, type: "", title: "", description: null, techStack: [], isVerified: false, url: null }))
        : props.pinned.data
    return <SurfaceCard props={{ label: props.labels.pinned, fact: loading ? undefined : String(projects.length), isFrameless: true }} isLoading={loading}>
        <div className={profileProjectCardGridClassName}>{projects.map((project) => <ProfileProjectCard key={project.id} props={{ title: project.title, description: project.description ?? undefined, kind: project.type === "course" ? props.labels.courseKind : props.labels.externalKind, technologies: project.techStack?.slice(0, 3) ?? [], verified: project.isVerified, actionLabel: props.labels.openProject }} on={project.url ? { press: () => props.on.openPinned(project.url as string) } : undefined} isLoading={loading} />)}</div>
    </SurfaceCard>
}

const CapstonesList = (props: ProfileProjectsProps) => {
    const loading = props.capstones.state === "pending"
    if (!loading && props.capstones.data.length === 0) {
        return <SurfaceListCard props={{ label: props.labels.capstones }}>
            <EmptyNotice props={{ icon: props.capstones.state === "error" ? "retry" : "course", message: props.capstones.state === "error" ? props.labels.error : props.labels.emptyCapstones, actionLabel: props.capstones.state === "error" ? props.labels.retry : undefined, actionIcon: "retry" }} on={{ act: props.on.retry }} />
        </SurfaceListCard>
    }
    const projects = loading
        ? Array.from({ length: 3 }, (_, index) => ({ courseGlobalId: `resting-${index}`, courseTitle: "", completedMilestones: 0, totalMilestones: 0, completedTasks: 0, totalTasks: 0 }))
        : props.capstones.data
    return <SurfaceListCard props={{ label: props.labels.capstones, fact: loading ? undefined : String(projects.length) }} isLoading={loading}>
        <div className={profileCapstoneListClassName}>{projects.map((project) => {
            const progress = Math.round(project.completedTasks / Math.max(1, project.totalTasks) * 100)
            const content = <div className={profileCapstoneBodyClassName}><div className={profileCapstoneHeaderClassName}><Text props={{ content: project.courseTitle, size: "sm", weight: "semibold" }} isLoading={loading} /><Text props={{ content: loading ? undefined : `${progress}%`, size: "sm", tone: progress === 100 ? "default" : "accent", weight: "semibold" }} isLoading={loading} /></div><div className={profileCapstoneMetaClassName}><Text props={{ content: `${props.labels.milestones}: ${project.completedMilestones}/${project.totalMilestones}`, size: "xs", tone: "muted" }} isLoading={loading} /><Text props={{ content: `${props.labels.tasks}: ${project.completedTasks}/${project.totalTasks}`, size: "xs", tone: "muted" }} isLoading={loading} /></div><Progress props={{ value: progress, label: `${project.courseTitle} ${progress}%` }} isLoading={loading} /></div>
            return loading ? <div key={project.courseGlobalId}>{content}</div> : <PressableSurface key={project.courseGlobalId} label={project.courseTitle} press={() => props.on.openCapstone(project.courseGlobalId)} hover="surface">{content}</PressableSurface>
        })}</div>
    </SurfaceListCard>
}

/** Draw pinned projects and verified capstones. */
export const ProfileProjectsBase = (props: ProfileProjectsProps) => {
    return <div className={profileMainClassName}>
        <PinnedProjectsList {...props} />
        <CapstonesList {...props} />
    </div>
}
