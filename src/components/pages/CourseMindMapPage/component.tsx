import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/** Query states exposed by the pure course concept map. */
export type CourseMindMapPageState = "pending" | "ready" | "empty" | "failed"

/** One normalized graph node shown in both rail and canvas. */
export type CourseMindMapNodeView = {
    readonly id: string
    readonly label: string
    readonly detail?: string
    readonly left: number
    readonly top: number
    readonly canOpen: boolean
}

/** Resolved graph data, selection and navigation actions. */
export type CourseMindMapPageProps = {
    readonly state: CourseMindMapPageState
    readonly props: {
        readonly title: string
        readonly description: string
        readonly searchLabel: string
        readonly searchPlaceholder: string
        readonly clearSearchLabel: string
        readonly emptyText: string
        readonly noResultsText: string
        readonly failedText: string
        readonly retryLabel: string
        readonly openLabel: string
        readonly graphFact: string
        readonly nodes: ReadonlyArray<CourseMindMapNodeView>
        readonly selectedId?: string
    }
    readonly on: {
        readonly search: (query: string) => void
        readonly select: (id: string) => void
        readonly openContent: (id: string) => void
        readonly retry: () => void
    }
}

/** Draw the server concept graph as a searchable, selectable and mobile-safe node field. */
export const _CourseMindMapPage = (input: CourseMindMapPageProps) => {
    const loading = input.state === "pending"
    const selected = input.props.nodes.find((node) => node.id === input.props.selectedId)
    const noResults = input.state === "ready" && input.props.nodes.length === 0
    const notice = input.state === "empty" || input.state === "failed" || noResults
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    message: input.state === "failed"
                        ? input.props.failedText
                        : noResults ? input.props.noResultsText : input.props.emptyText,
                    actionLabel: input.state === "failed" ? input.props.retryLabel : undefined,
                }}
                on={{ act: input.on.retry }}
            />
        ))
        : undefined

    return (
        <Tree contract="course-mind-map-page" render={defineContractComponent("course-mind-map-page", {
            header: defineContractComponent("page-header-stack", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />
                )),
            }),
            description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: input.props.description, size: "sm", tone: "muted" }} isLoading={loading} />
            )),
            search: defineLeafComponent("search-box", {}, () => (
                <SearchBox
                    props={{
                        label: input.props.searchLabel,
                        placeholder: input.props.searchPlaceholder,
                        clearLabel: input.props.clearSearchLabel,
                    }}
                    on={{ search: input.on.search }}
                />
            )),
            graphFact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: input.props.graphFact, size: "xs", tone: "muted" }} isLoading={loading} />
            )),
            node: input.props.nodes.map((node) => defineLeafComponent("nav-link", { kind: "section" }, () => (
                <NavLink
                    props={{
                        label: node.detail === undefined ? node.label : `${node.label} · ${node.detail}`,
                        kind: "section",
                        isCurrent: node.id === input.props.selectedId,
                    }}
                    on={{ press: () => input.on.select(node.id) }}
                    isLoading={loading}
                />
            ))),
            ...(selected?.detail === undefined ? {} : {
                selection: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: selected.detail, size: "sm", tone: "muted" }} />
                )),
            }),
            ...(selected?.canOpen !== true ? {} : {
                open: defineLeafComponent("button", {}, () => (
                    <Button props={{ label: input.props.openLabel, variant: "primary" }} on={{ press: () => input.on.openContent(selected.id) }} />
                )),
            }),
            notice,
        })} />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
