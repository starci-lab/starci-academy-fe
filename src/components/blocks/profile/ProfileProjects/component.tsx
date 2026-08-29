import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { ProfileProjectCard } from "@/components/composites/ProfileProjectCard"
import type { ProfileCapstone, ProfilePinnedProject } from "@/modules/api/graphql/queries/types/profile-evidence"
import { profileEvidenceListClassName, profileMainClassName, profileProjectCardGridClassName } from "./classNames"
/** Independent request state for profile evidence. */
export type EvidenceState<T> = { readonly state: "pending" | "ready" | "error"; readonly data: ReadonlyArray<T> }
/** Resolved project evidence and navigation. */
export type ProfileProjectsProps = { readonly pinned: EvidenceState<ProfilePinnedProject>; readonly capstones: EvidenceState<ProfileCapstone>; readonly on: { readonly openPinned: (url: string) => void; readonly openCapstone: (id: string) => void } }
/** Draw pinned projects and verified capstones. */
export const ProfileProjectsBase = (props: ProfileProjectsProps) => {
    const pendingPinned = props.pinned.state === "pending"
    const pendingCapstones = props.capstones.state === "pending"
    return <div className={profileMainClassName}>
        <SurfaceCard props={{ label: "Pinned projects", fact: props.pinned.state === "ready" ? `${props.pinned.data.length} selected` : undefined, isFrameless: true }}>
            <div className={profileProjectCardGridClassName}>{pendingPinned ? Array.from({ length: 2 }, (_, index) => <ProfileProjectCard key={index} props={{ technologies: [] }} isLoading />) : props.pinned.data.length ? props.pinned.data.map((project) => <ProfileProjectCard key={project.id} props={{ title: project.title, description: project.description ?? undefined, kind: project.type, technologies: project.techStack.slice(0, 3), verified: project.isVerified }} on={project.url ? { press: () => props.on.openPinned(project.url as string) } : undefined} isLoading={false} />) : <ProfileProjectCard props={{ title: props.pinned.state === "error" ? "Pinned projects couldn't be loaded." : "No pinned projects yet.", technologies: [] }} />}</div>
        </SurfaceCard>
        <SurfaceCard props={{ label: "Verified capstone work" }}>
            <div className={profileEvidenceListClassName}>{pendingCapstones ? Array.from({ length: 3 }, (_, index) => <EvidenceRow key={index} props={{ title: "", subtitle: "", fact: "" }} isLoading />) : props.capstones.data.length ? props.capstones.data.map((project) => <EvidenceRow key={project.courseGlobalId} props={{ title: project.courseTitle, subtitle: `${project.completedMilestones}/${project.totalMilestones} milestones · ${project.completedTasks}/${project.totalTasks} tasks`, fact: `${Math.round(project.completedTasks / Math.max(1, project.totalTasks) * 100)}%`, factTone: "success", isPressable: true }} on={{ press: () => props.on.openCapstone(project.courseGlobalId) }} />) : <EvidenceRow props={{ title: props.capstones.state === "error" ? "Capstone work couldn't be loaded." : "No verified capstone work yet." }} />}</div>
        </SurfaceCard>
    </div>
}
