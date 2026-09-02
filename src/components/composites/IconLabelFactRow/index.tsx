import type { ReactNode } from "react"
import { Icon, iconSourceFor, type IconName } from "@/components/leaves/Icon"
import { Badge, type BadgeTone } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { iconLabelFactLabelClassName, iconLabelFactRowClassName } from "./classNames"

/** The closed visual recipes supported by the shared icon-label-fact row. */
export type IconLabelFactRowRecipe = "peer" | "label-led" | "compact-action"

/** Resolved content for one generic icon-label row with an optional trailing fact. */
export type IconLabelFactRowData = {
    readonly icon: IconName
    readonly label: string
    readonly endText?: string
    /** A prominent trailing status or rank. Mutually exclusive with quiet endText. */
    readonly endBadge?: { readonly content: string, readonly tone: BadgeTone }
    readonly recipe: IconLabelFactRowRecipe
}

/** Closed props for {@link IconLabelFactRow}. */
export type IconLabelFactRowProps = { readonly props: IconLabelFactRowData; readonly isLoading?: boolean }

/** Draw one shared visual row without owning its surrounding interaction. */
export const IconLabelFactRow = (props: IconLabelFactRowProps) => {
    const data = props.props
    const isLoading = props.isLoading ?? false
    const endBadge = data.endBadge
    const glyph = <Icon source={iconSourceFor(data.icon, "leading")} usage={"leading"} />
    const row = (label: ReactNode, fact?: ReactNode) => (
        <div data-part="icon-label-fact-row" data-recipe={data.recipe} className={iconLabelFactRowClassName}>
            {glyph}
            <div data-part="icon-label-fact-label" className={iconLabelFactLabelClassName}>{label}</div>
            {fact}
        </div>
    )

    if (data.recipe === "peer") return row(
        <Text size={"sm"}>{data.label}</Text>,
        <Text size={"sm"} tone={"muted"} isSkeleton={isLoading}>{data.endText}</Text>,
    )

    if (data.recipe === "label-led") return row(
        <Text size={"md"}>{data.label}</Text>,
        <Text size={"xs"} tone={"muted"} isSkeleton={isLoading}>{data.endText}</Text>,
    )

    return row(
        <Text size={"sm"} parentEmphasis={"accent-soft"}>{data.label}</Text>,
        endBadge !== undefined
            ? <Badge tone={endBadge.tone} isSkeleton={isLoading}>{endBadge.content}</Badge>
            : data.endText === undefined
                ? undefined
                : <Text size={"xs"} tone={"muted"} parentEmphasis={"accent-soft"}>{data.endText}</Text>,
    )
}
