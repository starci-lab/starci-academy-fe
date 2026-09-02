import { Avatar } from "@/components/leaves/Avatar"
import { Badge } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { TextAction } from "@starci/grammar/common"


/** Resolved identity, qualification and follow state for one suggested person. */
export type SuggestedUserRowData = {
    readonly id: string
    readonly name?: string
    readonly username?: string
    readonly avatar?: string
    readonly openToWork?: boolean
    readonly openToWorkLabel?: string
    readonly followLabel: string
    readonly followingLabel: string
    readonly isFollowing?: boolean
    readonly isPending?: boolean
}
/** Product journeys reported by a suggested-person row. */
export type SuggestedUserRowActions = { readonly open?: () => void; readonly follow?: () => void }
/** Props for the closed suggested-person composition. */
export type SuggestedUserRowProps = { readonly props: SuggestedUserRowData; readonly on?: SuggestedUserRowActions; readonly isLoading?: boolean }

/** Draw one suggested identity with its optional badge and follow action. */
export const SuggestedUserRow = (props: SuggestedUserRowProps) => {
    const { props: data, on, isLoading = false } = props
    return <div><Avatar props={{ name: data.name, src: data.avatar, size: "sm" }} isLoading={isLoading} /><div><TextAction size={"sm"} appearance="inline" onPress={on?.open}>{data.name ?? ""}</TextAction><Text size={"xs"} tone={"muted"} isSkeleton={isLoading}>{data.username}</Text></div>{data.openToWork === true ? <Badge tone={"success"}>{data.openToWorkLabel}</Badge> : null}<Button variant={"secondary"} size={"sm"} isPending={data.isPending} isSkeleton={isLoading} onPress={({ press: data.isFollowing === true ? undefined : on?.follow })?.press}>{data.isFollowing === true ? data.followingLabel : data.followLabel}</Button></div>
}
