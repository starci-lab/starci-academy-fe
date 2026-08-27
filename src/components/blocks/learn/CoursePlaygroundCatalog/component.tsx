import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { Text } from "@/components/leaves/Text"
import type { PlaygroundSummary } from "@/modules/api/graphql/queries/query-playgrounds"

/** Catalog states exposed by the pure playground hub. */
export type CoursePlaygroundPageState = "pending" | "ready" | "empty" | "failed"
/** Resolved catalog data and navigation actions for the playground hub. */
export type CoursePlaygroundCatalogProps = { readonly state: CoursePlaygroundPageState; readonly props: { readonly title: string; readonly description: string; readonly stepLabel: string; readonly emptyText: string; readonly failedText: string; readonly retryLabel: string; readonly playgrounds: ReadonlyArray<PlaygroundSummary> }; readonly on: { readonly openSetup: (slug: string) => void; readonly retry: () => void } }

/** Draw the backend-owned playground catalog. */
export const CoursePlaygroundCatalogBase = (props: CoursePlaygroundCatalogProps) => {
    const loading = props.state === "pending"
    const rows = loading && props.props.playgrounds.length === 0 ? Array.from({ length: 4 }, (_, index) => ({ id: `pending-${index}`, slug: `pending-${index}`, title: "", icon: null, stepCount: 0 })) : props.props.playgrounds
    return <section><Heading props={{ content: props.props.title, level: 1 }} isLoading={loading} /><Text props={{ content: props.props.description, size: "sm", tone: "muted" }} isLoading={loading} />{props.state === "empty" || props.state === "failed" ? <EmptyNotice props={{ message: props.state === "failed" ? props.props.failedText : props.props.emptyText, actionLabel: props.state === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.on.retry }} /> : null}<div>{rows.map((playground) => <SurfaceCard key={playground.id} isLoading={loading}><NavLink props={{ label: playground.title, kind: "section" }} on={{ press: () => props.on.openSetup(playground.slug) }} isLoading={loading} /><Text props={{ content: `${playground.stepCount} ${props.props.stepLabel}`, size: "sm", tone: "muted" }} isLoading={loading} /></SurfaceCard>)}</div></section>
}
