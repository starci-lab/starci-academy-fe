import { EmptyNotice } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import { Heading } from "@starci/grammar/common"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@starci/grammar/common"
import { TextAction } from "@starci/grammar/common"

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
    if (props.blockState === "empty" || props.blockState === "failed" || noResults) return <EmptyNotice message={props.blockState === "failed" ? props.props.failedText : noResults ? props.props.noResultsText : props.props.emptyText} actionLabel={props.blockState === "failed" ? props.props.retryLabel : undefined} onAction={({ act: props.on.retry })?.act} />
    return <div><Heading level={1} isSkeleton={loading}>{props.props.title}</Heading><Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.description}</Text><SearchBox props={{ label: props.props.searchLabel, placeholder: props.props.searchPlaceholder, clearLabel: props.props.clearSearchLabel }} on={{ search: props.on.search }} /><Text size={"xs"} tone={"muted"} isSkeleton={loading}>{props.props.graphFact}</Text>{props.props.nodes.map((node) => <TextAction key={node.id} appearance={"section"} isCurrent={node.id === props.props.selectedId} isSkeleton={loading} onPress={() => props.on.select(node.id)}>{node.detail === undefined ? node.label : `${node.label} · ${node.detail}`}</TextAction>)}{selected?.detail === undefined ? null : <Text size={"sm"} tone={"muted"}>{selected.detail}</Text>}{selected?.canOpen === true ? <Button variant="primary" onPress={() => props.on.openContent(selected.id)}>{props.props.openLabel}</Button> : null}</div>
}
