import { SurfaceListCard } from "@starci/grammar/common"
import { SuggestedUserRow, type SuggestedUserRowData } from "@/components/composites/SuggestedUserRow"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
/** Resolved suggestion list data. */
export type WhoToFollowData = { readonly label: string; readonly users: ReadonlyArray<SuggestedUserRowData>; readonly emptyMessage?: string; readonly errorMessage?: string; readonly retryLabel?: string }
/** Per-user suggestion actions. */
export type WhoToFollowActions = { readonly [key: string]: (() => void) | undefined }
/** State, data and actions for the suggestions block. */
export type WhoToFollowProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: WhoToFollowData; readonly on?: WhoToFollowActions }
/** Draw suggested profiles as a joined semantic list. */
export const WhoToFollowBase = (props: WhoToFollowProps) => {
    if (props.state === "empty" || props.state === "failed") return <SurfaceListCard label={props.props.label}><EmptyNotice message={props.state === "empty" ? props.props.emptyMessage ?? "" : props.props.errorMessage ?? ""} actionLabel={props.state === "failed" ? props.props.retryLabel : undefined} iconSource={iconSourceFor("community", "leading")} onAction={({ act: props.state === "failed" ? props.on?.retry : undefined })?.act} /></SurfaceListCard>
    const users = props.state === "pending" ? Array.from({ length: 4 }, (_, index) => ({ id: `resting-${index}`, followLabel: "", followingLabel: "" })) : props.props.users
    return <SurfaceListCard label={props.props.label}>{users.map((user) => <SuggestedUserRow key={user.id} props={user} on={{ open: props.on?.[`open:${user.id}`], follow: props.on?.[`follow:${user.id}`] }} isLoading={props.state === "pending"} />)}</SurfaceListCard>
}
