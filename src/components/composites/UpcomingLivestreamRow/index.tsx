import { PressableSurface } from "@/components/branches/PressableSurface"
import { IconTile } from "@/components/leaves/IconTile"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "@/components/contracts/props"
/** Resolved display data for one upcoming session. */
export type UpcomingLivestreamRowData = { readonly id: string; readonly title?: string; readonly subtitle?: string; readonly time?: string; readonly isPending?: boolean }
/** Journey reported by an upcoming-session row. */
export type UpcomingLivestreamRowActions = { readonly open?: () => void }
/** Draw one whole-row upcoming-session destination. */
export const UpcomingLivestreamRow = ({ props, on, isLoading = false }: CompositeProps<UpcomingLivestreamRowData, UpcomingLivestreamRowActions>) => {
    const body = defineContractComponent("evidence-title-over-subtitle", {
        title: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: props.title, size: "sm", weight: "semibold" }} isLoading={isLoading} />),
        ...(props.subtitle === undefined ? {} : { subtitle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.subtitle, size: "xs", tone: "muted" }} />) }),
    })
    const content = defineContractComponent("upcoming-livestream-row", {
        mark: defineLeafComponent("icon-tile", {}, () => <IconTile props={{ icon: "livestream", tone: "accent", size: "md" }} isLoading={isLoading} />), body,
        time: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.time, size: "xs", tone: "muted" }} isLoading={isLoading} />),
    })
    return <PressableSurface contract="upcoming-livestream-row" render={content} label={props.title ?? "Livestream"} press={on?.open} disabled={isLoading || props.isPending === true} />
}
/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
