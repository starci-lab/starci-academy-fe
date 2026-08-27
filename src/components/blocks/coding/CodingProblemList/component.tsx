import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Icon } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
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
    if (["empty", "all-solved", "failed"].includes(props.state)) return <EmptyNotice props={{ icon: props.state === "all-solved" ? "complete" : props.state === "failed" ? "retry" : "practice", message: props.props.noticeMessage ?? "", description: props.props.noticeDescription, actionLabel: props.props.noticeActionLabel }} on={{ act: props.on?.recover }} />
    const loading = props.state === "pending"; const rows = loading ? Array.from({ length: 5 }, (_, i) => ({ slug: `resting-${i}`, title: "", fact: "", isSolved: false, label: "" })) : props.props.problems ?? []
    return <ul>{rows.map((problem) => <li key={problem.slug}><button type="button" aria-label={problem.label} disabled={loading} onClick={() => props.on?.open?.(problem.slug)}><Icon props={{ name: problem.isSolved ? "complete" : "pending", role: "leading" }} isLoading={loading} /><Text props={{ content: problem.title, size: "sm" }} isLoading={loading} /><Text props={{ content: problem.fact, size: "xs", tone: "muted" }} isLoading={loading} /></button></li>)}</ul>
}
