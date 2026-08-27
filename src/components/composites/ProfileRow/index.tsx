import { Avatar } from "@/components/leaves/Avatar"
import { Icon } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
import { PressableSurface } from "@/components/branches/PressableSurface"

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
    return <PressableSurface label={data.displayName ?? "Profile"} press={on?.press}><Avatar props={{ name: data.displayName, src: data.avatar, size: "md" }} isLoading={isLoading} /><div><Text props={{ content: data.displayName, size: "sm", weight: "semibold" }} isLoading={isLoading} /><Text props={{ content: data.username === undefined ? undefined : `@${data.username}`, size: "xs" }} isLoading={isLoading} /></div><Icon props={{ name: "disclosure", role: "chip" }} /></PressableSurface>
}
