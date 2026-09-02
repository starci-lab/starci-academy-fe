import { EmptyNotice } from "@starci/grammar/common"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Text } from "@starci/grammar/common"
/** Problem list lifecycle state. */
export type CodingProblemListState = "pending" | "ready" | "empty" | "all-solved" | "failed"
/** Selectable problem summary. */
export type CodingProblemRow = { readonly slug: string; readonly title: string; readonly fact: string; readonly isSolved: boolean; readonly label: string }
/** Resolved problem list content. */
export type CodingProblemListData = { readonly problems?: ReadonlyArray<CodingProblemRow>; readonly noticeMessage?: string; readonly noticeDescription?: string; readonly noticeActionLabel?: string }
/** Problem list interaction callbacks. */
export type CodingProblemListActions = { readonly open?: (slug: string) => void; readonly recover?: () => void }
/** Traditional problem list props. */
export type CodingProblemListProps = { readonly state: CodingProblemListState; readonly props: CodingProblemListData; readonly on?: CodingProblemListActions }
/** Draw selectable coding problems and their completion status. */
export const CodingProblemListBase = (props: CodingProblemListProps) => {
    if (["empty", "all-solved", "failed"].includes(props.state)) return <EmptyNotice message={props.props.noticeMessage ?? ""} description={props.props.noticeDescription} actionLabel={props.props.noticeActionLabel} iconSource={iconSourceFor(props.state === "all-solved" ? "complete" : props.state === "failed" ? "retry" : "practice", "leading")} onAction={({ act: props.on?.recover })?.act} />
    const loading = props.state === "pending"; const rows = loading ? Array.from({ length: 5 }, (_, i) => ({ slug: `resting-${i}`, title: "", fact: "", isSolved: false, label: "" })) : props.props.problems ?? []
    return <ul>{rows.map((problem) => <li key={problem.slug}><button type="button" aria-label={problem.label} disabled={loading} onClick={() => props.on?.open?.(problem.slug)}><Icon source={iconSourceFor(problem.isSolved ? "complete" : "pending", "leading")} role={"leading"} isSkeleton={loading} /><Text size={"sm"} isSkeleton={loading}>{problem.title}</Text><Text size={"xs"} tone={"muted"} isSkeleton={loading}>{problem.fact}</Text></button></li>)}</ul>
}
