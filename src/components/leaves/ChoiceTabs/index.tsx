"use client"

import { Tabs } from "@heroui/react"
import { Icon, type IconName } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

/** One peer choice, optionally led by a glyph naming the shape it selects. */
export type ChoiceTabData = {
    readonly id: string
    readonly label: string
    /**
     * Leading glyph, absent by default.
     *
     * A business category still gains none: the glyph would decorate a word that already says the
     * thing. A LAYOUT TOGGLE IS NOT A BUSINESS CATEGORY - "grid" and "list" name a SHAPE, and the
     * glyph draws that shape, so the icon is the more direct label rather than an ornament beside
     * one. That is why the legacy control is icon-only with the words living in `aria-label`.
     */
    readonly icon?: IconName
}
/** Resolved copy and selection for one fixed peer-choice control. */
export type ChoiceTabsData = {
    readonly label: string
    readonly selectedKey: string
    readonly tabs: ReadonlyArray<ChoiceTabData>
    readonly variant?: "primary" | "secondary"
}
/** Selection reported by the peer-choice control. */
export type ChoiceTabsActions = { readonly select?: (key: string) => void }
/** Props for the peer-choice control. */
export type ChoiceTabsProps = LeafProps<ChoiceTabsData, ChoiceTabsActions>

/** Text-only peer choices, except where a glyph names the SHAPE being chosen. Business categories do not gain decorative glyphs. */
export const ChoiceTabs = ({ props, on }: ChoiceTabsProps) => (
    <Tabs variant={props.variant ?? "secondary"} selectedKey={props.selectedKey} onSelectionChange={(key) => on?.select?.(String(key))}>
        <Tabs.ListContainer>
            <Tabs.List aria-label={props.label}>
                {props.tabs.map((tab) => (
                    // `whitespace-nowrap` because the vendor gives every segment an equal, fixed
                    // width and leaves wrapping on: a two-word label breaks onto a second line
                    // inside its own pill while the row around it still has hundreds of pixels
                    // spare. A label is one line; the leaf owns that, not its callers.
                    <Tabs.Tab key={tab.id} id={tab.id} className="whitespace-nowrap">
                        {tab.icon === undefined ? null : (
                            <span className="inline-flex items-center">
                                <Icon props={{ name: tab.icon, role: "leading" }} />
                            </span>
                        )}
                        {tab.label}
                        <Tabs.Indicator />
                    </Tabs.Tab>
                ))}
            </Tabs.List>
        </Tabs.ListContainer>
    </Tabs>
)

/** Source-level tier marker for the intrinsic peer-choice control. */
export const meta = { shape: "leaf", world: "pure" } as const
