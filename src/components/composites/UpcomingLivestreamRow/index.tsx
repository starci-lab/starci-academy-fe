import { PressableSurface } from "@/components/branches/PressableSurface"
import { IconTile } from "@/components/leaves/IconTile"
import { Text } from "@/components/leaves/Text"
/** Resolved display data for one upcoming session. */
export type UpcomingLivestreamRowData = { readonly id: string; readonly title?: string; readonly subtitle?: string; readonly time?: string; readonly isPending?: boolean }
/** Journey reported by an upcoming-session row. */
export type UpcomingLivestreamRowActions = { readonly open?: () => void }
/** Draw one whole-row upcoming-session destination. */
export type UpcomingLivestreamRowProps = { readonly props: UpcomingLivestreamRowData; readonly on?: UpcomingLivestreamRowActions; readonly isLoading?: boolean }
/** Draw one upcoming livestream as an accessible destination. */
export const UpcomingLivestreamRow = (props: UpcomingLivestreamRowProps) => {
    const { props: data, on, isLoading = false } = props
    return <PressableSurface label={data.title ?? "Livestream"} press={on?.open} disabled={isLoading || data.isPending === true}><IconTile props={{ icon: "livestream", tone: "accent", size: "md" }} isLoading={isLoading} /><div><Text props={{ content: data.title, size: "sm", weight: "semibold" }} isLoading={isLoading} />{data.subtitle === undefined ? null : <Text props={{ content: data.subtitle, size: "xs", tone: "muted" }} />}</div><Text props={{ content: data.time, size: "xs", tone: "muted" }} isLoading={isLoading} /></PressableSurface>
}
