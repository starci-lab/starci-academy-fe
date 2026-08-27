import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { SuggestedUserRow, type SuggestedUserRowData } from "@/components/composites/SuggestedUserRow"
/** Resolved suggestion list data. */
export type WhoToFollowData = { readonly label: string; readonly users: ReadonlyArray<SuggestedUserRowData> }
/** Per-user suggestion actions. */
export type WhoToFollowActions = { readonly [key: string]: (() => void) | undefined }
/** State, data and actions for the suggestions block. */
export type WhoToFollowProps = { readonly state: "pending" | "hidden" | "ready"; readonly props: WhoToFollowData; readonly on?: WhoToFollowActions }
/** Draw suggested profiles as a joined semantic list. */
export const WhoToFollowBase = (props: WhoToFollowProps) => {
    if (props.state === "hidden") return null
    const users = props.state === "pending" ? Array.from({ length: 4 }, (_, index) => ({ id: `resting-${index}`, followLabel: "", followingLabel: "" })) : props.props.users
    return <SurfaceListCard props={{ label: props.props.label }}>{users.map((user) => <SuggestedUserRow key={user.id} props={user} on={{ open: props.on?.[`open:${user.id}`], follow: props.on?.[`follow:${user.id}`] }} isLoading={props.state === "pending"} />)}</SurfaceListCard>
}
