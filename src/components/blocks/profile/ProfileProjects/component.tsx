import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { ProfileProjectCard } from "@/components/composites/ProfileProjectCard"
import { defineCompositeComponent, defineContractComponent, defineContractProjection } from "@/components/contracts/props"
import type { ProfileCapstone, ProfilePinnedProject } from "@/modules/api/graphql/queries/types/profile-evidence"
/** Independent request state for one profile evidence family. */
export type EvidenceState<T> = { readonly state: "pending" | "ready" | "error"; readonly data: ReadonlyArray<T> }
/** Resolved project evidence and navigation actions owned by the block. */
export type ProfileProjectsBlockProps = { readonly pinned: EvidenceState<ProfilePinnedProject>; readonly capstones: EvidenceState<ProfileCapstone>; readonly on: { readonly openPinned: (url: string) => void; readonly openCapstone: (id: string) => void } }
const percent = (done: number, total: number) => `${Math.round(done / Math.max(1, total) * 100)}%`
/** Draw pinned projects followed by verified capstone work. */
export const ProfileProjectsBase = ({ pinned, capstones, on }: ProfileProjectsBlockProps) => {
    const pins = pinned.state === "pending" ? Array.from({ length: 2 }, (_, index): ProfilePinnedProject => ({ id: `pending-${index}`, type: "", title: "", techStack: [], orderIndex: index, isVerified: false })) : pinned.data
    const rows = capstones.state === "pending" ? Array.from({ length: 3 }, (_, index): ProfileCapstone => ({ courseGlobalId: `pending-${index}`, courseTitle: "", totalMilestones: 0, completedMilestones: 0, totalTasks: 0, completedTasks: 0, milestones: [] })) : capstones.data
    return <Tree contract="profile-main" render={defineContractComponent("profile-main", { section: [
        defineContractProjection("label-row-over-card", () => <SurfaceCard props={{ label: "Pinned projects", fact: pinned.state === "ready" ? `${pins.length} selected` : undefined, isFrameless: true }} contract="profile-project-card-grid" render={defineContractComponent("profile-project-card-grid", { card: pins.length > 0 ? pins.map((project) => defineContractProjection("profile-project-card", () => <ProfileProjectCard props={{ title: project.title, description: project.description ?? undefined, kind: project.type, technologies: project.techStack.slice(0, 3), verified: project.isVerified }} on={project.url ? { press: () => on.openPinned(project.url as string) } : undefined} isLoading={pinned.state === "pending"} />)) : [defineContractProjection("profile-project-card", () => <ProfileProjectCard props={{ title: pinned.state === "error" ? "Pinned projects couldn't be loaded." : "No pinned projects yet.", technologies: [] }} />)] })} />),
        defineContractProjection("label-row-over-card", () => <SurfaceCard props={{ label: "Verified capstone work" }} contract="profile-evidence-list" render={defineContractComponent("profile-evidence-list", { evidence: rows.length > 0 ? rows.map((project) => defineCompositeComponent("evidence-row", {}, () => <EvidenceRow props={{ title: project.courseTitle, subtitle: `${project.completedMilestones}/${project.totalMilestones} milestones · ${project.completedTasks}/${project.totalTasks} tasks`, fact: percent(project.completedTasks, project.totalTasks), factTone: "success", isPressable: true }} on={{ press: () => on.openCapstone(project.courseGlobalId) }} isLoading={capstones.state === "pending"} />)) : [defineCompositeComponent("evidence-row", {}, () => <EvidenceRow props={{ title: capstones.state === "error" ? "Capstone work couldn't be loaded." : "No verified capstone work yet." }} />)] })} />),
    ] })} />
}
/** Source-level ownership marker. */
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "profile" } as const
