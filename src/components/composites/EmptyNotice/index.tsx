import { IconTile } from "@/components/leaves/IconTile"
import { Text } from "@/components/leaves/Text"
import { Button } from "@/components/leaves/Button"
import type { IconName } from "@/components/leaves/Icon"
import { emptyNoticeClassName } from "./classNames"

/** Resolved copy and optional mark for a settled empty region. */
export type EmptyNoticeData = {
    readonly icon?: IconName
    readonly message: string
    readonly description?: string
    readonly actionLabel?: string
    readonly actionIcon?: IconName
    readonly isPending?: boolean
}
/** Recovery action for an empty region. */
export type EmptyNoticeActions = { readonly act?: () => void }
/** Public inputs for the empty notice composition. */
export type EmptyNoticeProps = { readonly props: EmptyNoticeData; readonly on?: EmptyNoticeActions }

/** Draw the settled empty answer for a region. */
export const EmptyNotice = (props: EmptyNoticeProps) => {
    const data = props.props
    const on = props.on
    return (
        <div className={emptyNoticeClassName}>
            {data.icon === undefined ? null : <IconTile props={{ icon: data.icon, tone: "neutral", size: "md" }} />}
            <Text props={{ content: data.message, tone: "muted", size: "sm" }} />
            {data.description === undefined ? null : <Text props={{ content: data.description, tone: "muted", size: "xs" }} />}
            {data.actionLabel === undefined ? null : <Button props={{
                label: data.actionLabel,
                variant: "secondary",
                size: "sm",
                ...(data.actionIcon === undefined ? {} : { icon: data.actionIcon }),
                isPending: data.isPending,
            }} on={{ press: on?.act }} />}
        </div>
    )
}
