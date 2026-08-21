import type { ReactNode } from "react"
import { Tree } from "@/components/branches/Tree"
import { ScrollViewport } from "@/components/branches/ScrollViewport"
import { NavLink } from "@/components/leaves/NavLink"
import { Progress } from "@/components/leaves/Progress"
import { RailDivider } from "@/components/leaves/RailDivider"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"

/** One task destination retained in the personal-project workspace rail. */
export type PersonalProjectWorkspaceMilestone = {
    readonly id: string
    readonly label: string
    readonly fact: string
    readonly isCurrent?: boolean
}

/** Pure workspace frame data and routed surface contract. */
export type PersonalProjectWorkspaceLayoutProps = {
    readonly milestones: ReadonlyArray<PersonalProjectWorkspaceMilestone>
    readonly surface: ReactNode
    readonly progress: { readonly label: string; readonly value?: number; readonly fact: string }
    readonly search: { readonly placeholder: string; readonly label: string; readonly clearLabel: string }
    readonly resizeLabel: string
    readonly onTask?: (id: string) => void
    readonly onSearch?: (query: string) => void
    readonly isLoading?: boolean
}

/** Keeps milestone navigation mounted around dashboard, task and result surfaces. */
export const PersonalProjectWorkspaceLayoutBase = (input: PersonalProjectWorkspaceLayoutProps) => {
    const milestones: ReadonlyArray<PersonalProjectWorkspaceMilestone> = input.isLoading === true && input.milestones.length === 0
        ? Array.from({ length: 4 }, (_, index) => ({ id: `pending-${index}`, label: "", fact: "", isCurrent: false }))
        : input.milestones
    const rail = defineContractComponent("personal-project-milestone-rail", {
        title: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
            <Text props={{ content: input.progress.label, size: "sm", weight: "medium" }} isLoading={input.isLoading} />
        )),
        progress: defineLeafComponent("progress", {}, () => (
            <Progress props={{ value: input.progress.value, label: input.progress.label }} isLoading={input.isLoading} />
        )),
        fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ content: input.progress.fact, size: "xs", tone: "muted" }} isLoading={input.isLoading} />
        )),
        search: defineLeafComponent("search-box", {}, () => (
            <SearchBox props={input.search} on={{ search: input.onSearch }} />
        )),
        milestones: defineContractProjection("personal-project-milestone-list-scroll", () => (
            <ScrollViewport
                boundary="personal-project-milestones"
                render={defineContractComponent("personal-project-milestone-list-scroll", {
                    milestone: milestones.map((milestone) => defineContractComponent("personal-project-milestone-row", {
                        link: defineLeafComponent("nav-link", { kind: "section" }, () => (
                            <NavLink
                                props={{ label: milestone.label, kind: "section", isCurrent: milestone.isCurrent }}
                                on={{ press: () => input.onTask?.(milestone.id) }}
                                isLoading={input.isLoading}
                            />
                        )),
                        fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                            <Text props={{ content: milestone.fact, size: "xs", tone: "muted" }} isLoading={input.isLoading} />
                        )),
                    })),
                })}
            />
        )),
    })
    return (
        <Tree
            contract="personal-project-workspace-frame"
            render={defineContractComponent("personal-project-workspace-frame", {
                rail,
                // Milestone labels are authored content, so this route rail resizes instead of
                // collapsing them into an icon-only state that cannot preserve their meaning.
                divider: defineLeafComponent("rail-divider", {}, () => (
                    <RailDivider
                        props={{
                            label: input.resizeLabel,
                            storageKey: "starci.learn.milestoneMap.width",
                            defaultWidth: 320,
                            minWidth: 256,
                            maxWidth: 560,
                        }}
                    />
                )),
                body: defineContractComponent("learn-routed-body", {
                    page: defineLeafComponent("page", {}, () => <>{input.surface}</>),
                }),
            })}
        />
    )
}

/** Architectural identity for the pure personal-project layout twin. */
export const meta = { shape: "layout", world: "pure", domain: "learn" } as const
