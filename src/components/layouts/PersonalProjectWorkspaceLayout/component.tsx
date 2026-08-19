import type { ReactNode } from "react"
import { Tree } from "@/components/branches/Tree"
import { NavLink } from "@/components/leaves/NavLink"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/** One task destination retained in the personal-project workspace rail. */
export type PersonalProjectWorkspaceMilestone = {
    readonly id: string
    readonly label: string
    readonly isCurrent?: boolean
}

/** Pure workspace frame data and routed surface contract. */
export type PersonalProjectWorkspaceLayoutProps = {
    readonly milestones: ReadonlyArray<PersonalProjectWorkspaceMilestone>
    readonly surface: ReactNode
    readonly onTask?: (id: string) => void
    readonly isLoading?: boolean
}

/** Keeps milestone navigation mounted around dashboard, task and result surfaces. */
export const PersonalProjectWorkspaceLayoutBase = (input: PersonalProjectWorkspaceLayoutProps) => {
    const milestones: ReadonlyArray<PersonalProjectWorkspaceMilestone> = input.isLoading === true && input.milestones.length === 0
        ? Array.from({ length: 4 }, (_, index) => ({ id: `pending-${index}`, label: "", isCurrent: false }))
        : input.milestones
    return (
        <Tree
            contract="personal-project-workspace-frame"
            render={defineContractComponent("personal-project-workspace-frame", {
                milestone: milestones.map((milestone) => defineLeafComponent("nav-link", { kind: "section" }, () => (
                    <NavLink
                        props={{ label: milestone.label, kind: "section", isCurrent: milestone.isCurrent }}
                        on={{ press: () => input.onTask?.(milestone.id) }}
                        isLoading={input.isLoading}
                    />
                ))),
                body: defineLeafComponent("page", {}, () => <>{input.surface}</>),
            })}
        />
    )
}

/** Architectural identity for the pure personal-project layout twin. */
export const meta = { shape: "layout", world: "pure", domain: "learn" } as const
