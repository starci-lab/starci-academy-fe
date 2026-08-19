import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import type { ProfileCapstone } from "@/modules/api/graphql/queries/types/profile-evidence"

/** One resolved capstone plus its projects-return outcome. */
export type ProfileProjectRoadmapPageProps = { readonly state: "pending" | "ready" | "error"; readonly project?: ProfileCapstone; readonly onBack: () => void }

/** Dedicated capstone detail: summary/progress remains above an ordered milestone roadmap. */
export const ProfileProjectRoadmapPageBase = ({ state, project, onBack }: ProfileProjectRoadmapPageProps) => {
    const value = Math.round((project?.completedTasks ?? 0) / Math.max(1, project?.totalTasks ?? 0) * 100)
    const milestones = state === "pending" ? Array.from({ length: 4 }, (_, index) => ({ milestoneGlobalId: `pending-${index}`, title: "", position: index, totalTasks: 0, passedTasks: 0, tasks: [] })) : project?.milestones ?? []
    return <Tree contract="profile-main" render={defineContractComponent("profile-main", { section: [
        defineContractProjection("label-row-over-card", () => (
            <Tree contract="profile-proof-summary" render={defineContractComponent("profile-proof-summary", {
                back: defineLeafComponent("button", {}, () => <Button props={{ label: "← Projects", variant: "ghost", size: "sm" }} on={{ press: onBack }} />),
                title: defineLeafComponent("heading", {}, () => <Heading props={{ content: state === "error" ? "Capstone couldn't be loaded" : project?.courseTitle ?? (state === "pending" ? undefined : "Capstone not found"), level: 2 }} isLoading={state === "pending"} />),
                meta: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: project ? `${project.completedMilestones}/${project.totalMilestones} milestones · ${project.completedTasks}/${project.totalTasks} tasks · Verified by StarCi` : state === "ready" ? "This capstone is not public." : undefined, size: "sm", tone: "muted" }} isLoading={state === "pending"} />),
                ...(project || state === "pending" ? { progress: defineLeafComponent("progress", {}, () => <Progress props={{ value, label: "Capstone completion" }} isLoading={state === "pending"} />) } : {}),
            })} />
        )),
        defineContractProjection("label-row-over-card", () => (
            <SurfaceCard props={{ label: "Roadmap" }} contract="profile-roadmap-list" render={defineContractComponent("profile-roadmap-list", {
                milestone: milestones.length > 0 ? milestones.map((milestone) => defineCompositeComponent("evidence-row", {}, () => <EvidenceRow props={{ title: milestone.title, subtitle: `${milestone.passedTasks}/${milestone.totalTasks} tasks passed`, fact: milestone.passedTasks === milestone.totalTasks && milestone.totalTasks > 0 ? "Passed" : `${Math.round(milestone.passedTasks / Math.max(1, milestone.totalTasks) * 100)}%`, factTone: milestone.passedTasks === milestone.totalTasks && milestone.totalTasks > 0 ? "success" : "accent" }} isLoading={state === "pending"} />)) : [defineCompositeComponent("evidence-row", {}, () => <EvidenceRow props={{ title: state === "error" ? "Roadmap couldn't be loaded." : "No public roadmap was found." }} />)],
            })} />
        )),
    ] })} />
}

/** Source-level tier marker. */
export const meta = { world: "pure", domain: "profile" } as const
