import { Tree } from "@/components/branches/Tree"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import type { PlaygroundSummary } from "@/modules/api/graphql/queries/query-playgrounds"

/** Catalog states exposed by the pure playground hub. */
export type CoursePlaygroundPageState = "pending" | "ready" | "empty" | "failed"
/** Resolved catalog data and navigation actions for the playground hub. */
export type CoursePlaygroundCatalogBlockProps = { readonly state: CoursePlaygroundPageState; readonly props: { readonly title: string; readonly description: string; readonly stepLabel: string; readonly emptyText: string; readonly failedText: string; readonly retryLabel: string; readonly playgrounds: ReadonlyArray<PlaygroundSummary> }; readonly on: { readonly openSetup: (slug: string) => void; readonly retry: () => void } }

/** Draw the backend-owned playground catalog. */
export const CoursePlaygroundCatalogBase = (input: CoursePlaygroundCatalogBlockProps) => {
    const loading = input.state === "pending"
    const rows = loading && input.props.playgrounds.length === 0 ? Array.from({ length: 4 }, (_, index) => ({ id: `pending-${index}`, slug: `pending-${index}`, title: "", icon: null, stepCount: 0 })) : input.props.playgrounds
    const notice = input.state === "empty" || input.state === "failed" ? defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ message: input.state === "failed" ? input.props.failedText : input.props.emptyText, actionLabel: input.state === "failed" ? input.props.retryLabel : undefined }} on={{ act: input.on.retry }} />) : undefined
    const grid = rows.length === 0 ? undefined : defineContractProjection("playground-catalog-grid", () => (
        <Tree contract="playground-catalog-grid" render={defineContractComponent("playground-catalog-grid", {
            playground: rows.map((playground) => defineContractProjection("playground-catalog-card", () => (
                <SurfaceCard
                    contract="playground-catalog-card"
                    render={defineContractComponent("playground-catalog-card", {
                        open: defineLeafComponent("nav-link", { kind: "section" }, () => <NavLink props={{ label: playground.title, kind: "section" }} on={{ press: () => input.on.openSetup(playground.slug) }} isLoading={loading} />),
                        fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: `${playground.stepCount} ${input.props.stepLabel}`, size: "sm", tone: "muted" }} isLoading={loading} />),
                    })}
                    isLoading={loading}
                />
            ))),
        })} />
    ))
    return <Tree contract="course-playground-catalog" render={defineContractComponent("course-playground-catalog", { header: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />), description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.description, size: "sm", tone: "muted" }} isLoading={loading} />), grid, notice })} />
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
