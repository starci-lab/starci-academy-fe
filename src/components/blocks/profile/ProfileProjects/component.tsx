import { SurfaceListCard } from "@starci/grammar/common"
import { SurfaceCard } from "@starci/grammar/common"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { ProfileProjectCard } from "@/components/composites/ProfileProjectCard"
import { Progress } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
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
        return <SurfaceListCard label={props.labels.pinned}>
            <EmptyNotice message={props.pinned.state === "error" ? props.labels.error : props.labels.emptyPinned} actionLabel={props.pinned.state === "error" ? props.labels.retry : undefined} iconSource={iconSourceFor(props.pinned.state === "error" ? "retry" : "course", "leading")} actionStartContent={<Icon source={iconSourceFor("retry", "chip")} usage="chip" />} onAction={({ act: props.on.retry })?.act} />
        </SurfaceListCard>
    }
    const projects = loading
        ? Array.from({ length: 2 }, (_, index) => ({ id: `resting-${index}`, type: "", title: "", description: null, techStack: [], isVerified: false, url: null }))
        : props.pinned.data
    return <SurfaceCard label={props.labels.pinned} fact={loading ? undefined : String(projects.length)} frame={"frameless"} composition="joined" state={loading ? "pending" : "neutral"}>
        <div className={profileProjectCardGridClassName}>{projects.map((project) => <ProfileProjectCard key={project.id} props={{ title: project.title, description: project.description ?? undefined, kind: project.type === "course" ? props.labels.courseKind : props.labels.externalKind, technologies: project.techStack?.slice(0, 3) ?? [], verified: project.isVerified, actionLabel: props.labels.openProject }} on={project.url ? { press: () => props.on.openPinned(project.url as string) } : undefined} isLoading={loading} />)}</div>
    </SurfaceCard>
}

const CapstonesList = (props: ProfileProjectsProps) => {
    const loading = props.capstones.state === "pending"
    if (!loading && props.capstones.data.length === 0) {
        return <SurfaceListCard label={props.labels.capstones}>
            <EmptyNotice message={props.capstones.state === "error" ? props.labels.error : props.labels.emptyCapstones} actionLabel={props.capstones.state === "error" ? props.labels.retry : undefined} iconSource={iconSourceFor(props.capstones.state === "error" ? "retry" : "course", "leading")} actionStartContent={<Icon source={iconSourceFor("retry", "chip")} usage="chip" />} onAction={({ act: props.on.retry })?.act} />
        </SurfaceListCard>
    }
    const projects = loading
        ? Array.from({ length: 3 }, (_, index) => ({ courseGlobalId: `resting-${index}`, courseTitle: "", completedMilestones: 0, totalMilestones: 0, completedTasks: 0, totalTasks: 0 }))
        : props.capstones.data
    return <SurfaceListCard label={props.labels.capstones} fact={loading ? undefined : String(projects.length)} isLoading={loading}>
        <div className={profileCapstoneListClassName}>{projects.map((project) => {
            const progress = Math.round(project.completedTasks / Math.max(1, project.totalTasks) * 100)
            const content = <div className={profileCapstoneBodyClassName}><div className={profileCapstoneHeaderClassName}><Text size={"sm"} weight={"semibold"} isSkeleton={loading}>{project.courseTitle}</Text><Text size={"sm"} tone={progress === 100 ? "default" : "accent"} weight={"semibold"} isSkeleton={loading}>{loading ? undefined : `${progress}%`}</Text></div><div className={profileCapstoneMetaClassName}><Text size={"xs"} tone={"muted"} isSkeleton={loading}>{`${props.labels.milestones}: ${project.completedMilestones}/${project.totalMilestones}`}</Text><Text size={"xs"} tone={"muted"} isSkeleton={loading}>{`${props.labels.tasks}: ${project.completedTasks}/${project.totalTasks}`}</Text></div><Progress label={`${project.courseTitle} ${progress}%`} value={progress} isSkeleton={loading} /></div>
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
