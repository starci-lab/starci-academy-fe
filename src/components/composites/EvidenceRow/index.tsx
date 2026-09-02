import { PressableSurface } from "@/components/branches/PressableSurface"
import { Badge } from "@starci/grammar/common"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Text } from "@starci/grammar/common"
import { evidenceIdentityClassName, evidenceRowClassName } from "./classNames"

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
    const content = <div className={evidenceRowClassName}><div className={evidenceIdentityClassName}><Text size={"sm"} weight={"semibold"} isSkeleton={isLoading}>{data.title}</Text>{data.subtitle === undefined ? null : <Text size={"xs"} isSkeleton={isLoading}>{data.subtitle}</Text>}</div>{data.fact === undefined ? null : <Badge tone={data.factTone} isSkeleton={isLoading}>{data.fact}</Badge>}{data.isPressable === true ? <Icon source={iconSourceFor("disclosure", "chip")} role={"chip"} /> : null}</div>
    return data.isPressable === true ? (
        <PressableSurface label={data.title ?? ""} press={on?.press}>{content}</PressableSurface>
    ) : (
        content
    )
}
