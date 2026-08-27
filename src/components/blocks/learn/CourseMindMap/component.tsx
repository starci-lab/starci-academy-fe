import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
/** Graph query states. */
export type CourseMindMapBlockState = "pending" | "ready" | "empty" | "failed"
/** Normalized node view. */
export type CourseMindMapNodeView = { readonly id: string; readonly label: string; readonly detail?: string; readonly left: number; readonly top: number; readonly canOpen: boolean }
/** Graph data and interaction callbacks. */
export type CourseMindMapProps = { readonly blockState: CourseMindMapBlockState; readonly props: { readonly title: string; readonly description: string; readonly searchLabel: string; readonly searchPlaceholder: string; readonly clearSearchLabel: string; readonly emptyText: string; readonly noResultsText: string; readonly failedText: string; readonly retryLabel: string; readonly openLabel: string; readonly graphFact: string; readonly nodes: ReadonlyArray<CourseMindMapNodeView>; readonly selectedId?: string }; readonly on: { readonly search: (query: string) => void; readonly select: (id: string) => void; readonly openContent: (id: string) => void; readonly retry: () => void } }
/** Draw a searchable, selectable course concept graph. */
export const CourseMindMapBase = (props: CourseMindMapProps) => {
    const loading = props.blockState === "pending"
    const selected = props.props.nodes.find((node) => node.id === props.props.selectedId)
    const noResults = props.blockState === "ready" && props.props.nodes.length === 0
    if (props.blockState === "empty" || props.blockState === "failed" || noResults) return <EmptyNotice props={{ message: props.blockState === "failed" ? props.props.failedText : noResults ? props.props.noResultsText : props.props.emptyText, actionLabel: props.blockState === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.on.retry }} />
    return <div><Heading props={{ content: props.props.title, level: 1 }} isLoading={loading} /><Text props={{ content: props.props.description, size: "sm", tone: "muted" }} isLoading={loading} /><SearchBox props={{ label: props.props.searchLabel, placeholder: props.props.searchPlaceholder, clearLabel: props.props.clearSearchLabel }} on={{ search: props.on.search }} /><Text props={{ content: props.props.graphFact, size: "xs", tone: "muted" }} isLoading={loading} />{props.props.nodes.map((node) => <NavLink key={node.id} props={{ label: node.detail === undefined ? node.label : `${node.label} · ${node.detail}`, kind: "section", isCurrent: node.id === props.props.selectedId }} on={{ press: () => props.on.select(node.id) }} isLoading={loading} />)}{selected?.detail === undefined ? null : <Text props={{ content: selected.detail, size: "sm", tone: "muted" }} />}{selected?.canOpen === true ? <Button props={{ label: props.props.openLabel, variant: "primary" }} on={{ press: () => props.on.openContent(selected.id) }} /> : null}</div>
}
