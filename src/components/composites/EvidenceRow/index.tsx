import { PressableSurface } from "@/components/branches/PressableSurface"
import { Badge } from "@/components/leaves/Badge"
import { Icon } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"

/** One reusable evidence row after product meaning and copy are resolved by its block. */
export type EvidenceRowData = {
    readonly title?: string
    readonly subtitle?: string
    readonly fact?: string
    readonly factTone?: "neutral" | "accent" | "success" | "warning" | "danger"
    readonly isPressable?: boolean
}

/** Evidence-row interaction. */
export type EvidenceRowActions = { readonly press?: () => void }

/** Props for the closed evidence row. */
export type EvidenceRowProps = { readonly props: EvidenceRowData; readonly on?: EvidenceRowActions; readonly isLoading?: boolean }

/** Draw one proof title, qualifier and trailing fact with optional whole-row navigation. */
export const EvidenceRow = (props: EvidenceRowProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    const content = <><div><Text props={{ content: data.title, size: "sm", weight: "semibold" }} isLoading={isLoading} />{data.subtitle === undefined ? null : <Text props={{ content: data.subtitle, size: "xs" }} isLoading={isLoading} />}</div>{data.fact === undefined ? null : <Badge props={{ content: data.fact, tone: data.factTone }} isLoading={isLoading} />}{data.isPressable === true ? <Icon props={{ name: "disclosure", role: "chip" }} /> : null}</>
    return data.isPressable === true ? (
        <PressableSurface label={data.title ?? ""} press={on?.press}>{content}</PressableSurface>
    ) : (
        <div>{content}</div>
    )
}
