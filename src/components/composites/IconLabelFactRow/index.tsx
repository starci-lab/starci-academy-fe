import type { ReactNode } from "react"
import { Icon, type IconName } from "@/components/leaves/Icon"
import { Badge, type BadgeTone } from "@/components/leaves/Badge"
import { Text } from "@/components/leaves/Text"
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
    const glyph = <Icon props={{ name: data.icon, role: "leading" }} />
    const row = (label: ReactNode, fact?: ReactNode) => (
        <div data-part="icon-label-fact-row" data-recipe={data.recipe} className={iconLabelFactRowClassName}>
            {glyph}
            <div data-part="icon-label-fact-label" className={iconLabelFactLabelClassName}>{label}</div>
            {fact}
        </div>
    )

    if (data.recipe === "peer") return row(
        <Text props={{ content: data.label, size: "sm" }} />,
        <Text props={{ content: data.endText, size: "sm", tone: "muted" }} isLoading={isLoading} />,
    )

    if (data.recipe === "label-led") return row(
        <Text props={{ content: data.label, size: "md" }} />,
        <Text props={{ content: data.endText, size: "xs", tone: "muted" }} isLoading={isLoading} />,
    )

    return row(
        <Text props={{ content: data.label, size: "sm", parentEmphasis: "accent-soft" }} />,
        endBadge !== undefined
            ? <Badge props={endBadge} isLoading={isLoading} />
            : data.endText === undefined
                ? undefined
                : <Text props={{ content: data.endText, size: "xs", tone: "muted", parentEmphasis: "accent-soft" }} />,
    )
}
