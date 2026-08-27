import { Icon, type IconName } from "@/components/leaves/Icon"
import { Badge, type BadgeTone } from "@/components/leaves/Badge"
import { Text } from "@/components/leaves/Text"

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

    if (data.recipe === "peer") return (
        <div>{glyph}<Text props={{ content: data.label, size: "sm" }} /><Text props={{ content: data.endText, size: "sm", tone: "muted" }} isLoading={isLoading} /></div>
    )

    if (data.recipe === "label-led") return (
        <div>{glyph}<Text props={{ content: data.label, size: "md" }} /><Text props={{ content: data.endText, size: "xs", tone: "muted" }} isLoading={isLoading} /></div>
    )

    return (
        <div>{glyph}<Text props={{ content: data.label, size: "sm", parentEmphasis: "accent-soft" }} />{endBadge !== undefined ? <Badge props={endBadge} isLoading={isLoading} /> : data.endText === undefined ? null : <Text props={{ content: data.endText, size: "xs", tone: "muted", parentEmphasis: "accent-soft" }} />}</div>
    )
}
