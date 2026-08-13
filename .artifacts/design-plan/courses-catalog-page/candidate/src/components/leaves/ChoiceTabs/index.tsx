"use client"

import { Tabs } from "@heroui/react"
import type { LeafProps } from "@/components/contracts/props"
// The candidate's own icon leaf, reached RELATIVELY rather than through the `~candidate` alias.
// This leaf names no glyph library: it passes a MEANING and a role, and the leaf next door owns
// which vendor, which cut and which size. The alias spelling hid that, because a bare specifier
// carrying "Icon" reads to the vendor rule as a glyph package rather than as a sibling module in
// this tree. After the two proposed meanings land in `GLYPHS`, the target file imports
// `@/components/leaves/Icon` and this line disappears with the proposal.
import { Icon, type ProposedIconName } from "../Icon"

/**
 * PROPOSED API EXTENSION - `ChoiceTabs` gains one optional leading glyph per tab.
 *
 * Target path: `src/components/leaves/ChoiceTabs/index.tsx`. Everything here is the locked leaf
 * verbatim except the `icon` slot and the `<span>` that draws it.
 *
 * THE POLICY THIS CHANGES, AND WHY. The locked leaf says "Text-only peer choices. Business
 * categories do not gain decorative glyphs." That sentence is doing real work and stays true: a
 * business category - a course level, a submission status - still gets no glyph, because the glyph
 * would be decoration next to a word that already says it.
 *
 * A LAYOUT TOGGLE IS NOT A BUSINESS CATEGORY. "Grid" and "list" name a SHAPE, and the shape is what
 * the glyph draws; the icon is the more direct label, not an ornament beside one. That is why the
 * legacy control is icon-only with the words living in `aria-label`, and why this slot is optional
 * rather than a new required field: the default remains text-only, and a caller that wants a glyph
 * has to say so.
 *
 * EXACT DELTA
 *   props.tabs[].icon?: IconName   - absent by default; text-only behaviour is unchanged
 * PRECEDENCE
 *   The icon leads; the label always still renders, so the control is never glyph-only and never
 *   loses its accessible name.
 * CALLERS
 *   Every existing caller omits `icon` and is unaffected.
 * TESTS
 *   One case asserting a tab without `icon` renders no glyph, one asserting the glyph precedes the
 *   label, and one asserting the accessible name still comes from `label`.
 */

/** One peer choice, optionally led by a glyph naming the shape it selects. */
export type ChoiceTabData = {
    readonly id: string
    readonly label: string
    /** Leading glyph. In production this is `IconName`; the candidate narrows it to the two proposed meanings. */
    readonly icon?: ProposedIconName
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

/** Text-only peer choices, except where a glyph names the shape being chosen. */
export const ChoiceTabs = ({ props, on }: ChoiceTabsProps) => (
    <Tabs
        variant={props.variant ?? "secondary"}
        selectedKey={props.selectedKey}
        onSelectionChange={(key) => on?.select?.(String(key))}
    >
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
