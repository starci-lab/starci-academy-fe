import { PressableSurface } from "@/components/branches/PressableSurface"
import { IconTile } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Text } from "@starci/grammar/common"
/** Resolved display data for one upcoming session. */
export type UpcomingLivestreamRowData = { readonly id: string; readonly title?: string; readonly subtitle?: string; readonly time?: string; readonly isPending?: boolean }
/** Journey reported by an upcoming-session row. */
export type UpcomingLivestreamRowActions = { readonly open?: () => void }
/** Draw one whole-row upcoming-session destination. */
export type UpcomingLivestreamRowProps = { readonly props: UpcomingLivestreamRowData; readonly on?: UpcomingLivestreamRowActions; readonly isLoading?: boolean }
/** Draw one upcoming livestream as an accessible destination. */
export const UpcomingLivestreamRow = (props: UpcomingLivestreamRowProps) => {
    const { props: data, on, isLoading = false } = props
    return <PressableSurface label={data.title ?? "Livestream"} press={on?.open} disabled={isLoading || data.isPending === true}><IconTile source={iconSourceFor("livestream", "leading")} tone={"accent"} size={"md"} isSkeleton={isLoading} /><div><Text size={"sm"} weight={"semibold"} isSkeleton={isLoading}>{data.title}</Text>{data.subtitle === undefined ? null : <Text size={"xs"} tone={"muted"}>{data.subtitle}</Text>}</div><Text size={"xs"} tone={"muted"} isSkeleton={isLoading}>{data.time}</Text></PressableSurface>
}
