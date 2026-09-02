import { Avatar } from "@/components/leaves/Avatar"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Text } from "@starci/grammar/common"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { profileRowClassName, profileRowIdentityClassName } from "./classNames"

/** Resolved identity shown at the head of the dashboard rail. */
export type ProfileRowData = {
    readonly displayName?: string
    readonly username?: string
    readonly avatar?: string
}

/** Internal profile navigation reported to the connected owner. */
export type ProfileRowActions = {
    readonly press?: () => void
}

/** Props for the fixed dashboard profile cluster. */
export type ProfileRowProps = { readonly props: ProfileRowData; readonly on?: ProfileRowActions; readonly isLoading?: boolean }

/** Fixed profile cluster copied from the legacy rail: avatar, name/handle, disclosure. */
export const ProfileRow = (props: ProfileRowProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    return (
        <PressableSurface label={data.displayName ?? "Profile"} press={on?.press}>
            <div data-part="profile-row" className={profileRowClassName}>
                <Avatar props={{ name: data.displayName, src: data.avatar, size: "md" }} isLoading={isLoading} />
                <div data-part="profile-identity" className={profileRowIdentityClassName}>
                    <Text size={"sm"} weight={"semibold"} isSkeleton={isLoading}>{data.displayName}</Text>
                    <Text size={"xs"} isSkeleton={isLoading}>{data.username === undefined ? undefined : `@${data.username}`}</Text>
                </div>
                <Icon source={iconSourceFor("disclosure", "chip")} usage={"chip"} />
            </div>
        </PressableSurface>
    )
}
