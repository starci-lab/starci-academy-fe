import { Tree } from "@/components/branches/Tree"
import { Icon, type IconName } from "@/components/leaves/Icon"
import { Badge, type BadgeTone } from "@/components/leaves/Badge"
import { Text } from "@/components/leaves/Text"
import type { CompositeProps } from "@/components/contracts/props"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

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
export type IconLabelFactRowProps = CompositeProps<IconLabelFactRowData>

/** Draw one shared visual row without owning its surrounding interaction. */
export const IconLabelFactRow = ({ props, isLoading = false }: IconLabelFactRowProps) => {
    const glyph = defineLeafComponent("icon", { size: "sm" }, () => (
        <Icon props={{ name: props.icon, role: "leading" }} />
    ))

    if (props.recipe === "peer") return (
        <Tree contract="glyph-peer-fact-row" render={defineContractComponent("glyph-peer-fact-row", {
            glyph,
            title: defineLeafComponent("text", { size: "sm", tone: "default" }, () => (
                <Text props={{ content: props.label, size: "sm" }} />
            )),
            fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: props.endText, size: "sm", tone: "muted" }} isLoading={isLoading} />
            )),
        })} />
    )

    if (props.recipe === "label-led") return (
        <Tree contract="glyph-title-fact-row" render={defineContractComponent("glyph-title-fact-row", {
            glyph,
            title: defineLeafComponent("text", { size: "md", tone: "default" }, () => (
                <Text props={{ content: props.label, size: "md" }} />
            )),
            fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: props.endText, size: "xs", tone: "muted" }} isLoading={isLoading} />
            )),
        })} />
    )

    return (
        <Tree contract="glyph-compact-action-fact-row" render={defineContractComponent("glyph-compact-action-fact-row", {
            glyph,
            title: defineLeafComponent("text", { size: "sm", tone: "default" }, () => (
                <Text props={{ content: props.label, size: "sm", parentEmphasis: "accent-soft" }} />
            )),
            ...(props.endBadge !== undefined ? {
                fact: defineLeafComponent("badge", {}, () => (
                    <Badge props={props.endBadge} isLoading={isLoading} />
                )),
            } : props.endText === undefined ? {} : {
                fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: props.endText, size: "xs", tone: "muted", parentEmphasis: "accent-soft" }} />
                )),
            }),
        })} />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
