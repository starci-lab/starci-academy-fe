"use client"

import { Tabs } from "@heroui/react"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor, type IconName } from "@/components/leaves/Icon"
import { choiceTabContentClassName, getChoiceTabClassName, getChoiceTabsListClassName } from "./classNames"

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
    /**
     * Primary is a compact segmented choice inside one bounded context. Secondary is an underline
     * navigation layer between large content regions. The names select those two stable products;
     * they are not a general importance scale.
     */
    readonly variant?: "primary" | "secondary"
    /** Long primary labels may become one target per row at the narrowest effective width. */
    readonly stackAtNarrow?: boolean
}
/** Selection reported by the peer-choice control. */
export type ChoiceTabsActions = { readonly select?: (key: string) => void }
/** Props for the peer-choice control. */
export type ChoiceTabsProps = { readonly props: ChoiceTabsData; readonly on?: ChoiceTabsActions; readonly isLoading?: boolean }

/**
 * Why the segmented pill is PAINTED rather than animated.
 *
 * The vendor's indicator is one element that slides between segments, so it has to MEASURE where
 * the selected tab is and store the answer as an inline `translate`. That answer is taken once, and
 * anything that moves the row afterwards - the shell navigation hydrating, a web font landing, a
 * result count arriving from a request - leaves the pill drawn against a layout that no longer
 * exists. On this page it sat twenty pixels above its own tab on every refresh while the tab itself
 * reported the correct position: the pill was right about the old page.
 *
 * Selection is a STATE OF THE TAB, so the tab draws it. Nothing is measured, so nothing can go
 * stale, and what it costs is the slide - which was never what the control was for.
 *
 * The underline variant is painted from `aria-selected` for the same reason. The vendor indicator
 * can retain a stale transform after a responsive shell or async content changes the rail width;
 * it also adds phantom scroll width and exposes a meaningless overflow arrow when every tab fits.
 * A selected border follows the tab itself, so hydration and viewport transitions cannot detach it.
 */

/** Text-only peer choices, except where a glyph names the SHAPE being chosen. Business categories do not gain decorative glyphs. */
export const ChoiceTabs = (props: ChoiceTabsProps) => {
    const data = props.props
    const on = props.on
    const variant = data.variant ?? "secondary"
    return (
        <Tabs
            variant={variant}
            selectedKey={data.selectedKey}
            onSelectionChange={(key) => on?.select?.(String(key))}
            data-variant={variant}
        >
            <Tabs.ListContainer>
                <Tabs.List aria-label={data.label} className={getChoiceTabsListClassName(data.stackAtNarrow === true)}>
                    {data.tabs.map((tab) => (
                    // `whitespace-nowrap` because the vendor gives every segment an equal, fixed
                    // width and leaves wrapping on: a two-word label breaks onto a second line
                    // inside its own pill while the row around it still has hundreds of pixels
                    // spare. A label is one line; the leaf owns that, not its callers.
                        <Tabs.Tab key={tab.id} id={tab.id} className={getChoiceTabClassName(variant, data.stackAtNarrow === true)}>
                            {/*
                          * The glyph and the words it belongs to are ONE line, held together by the
                          * one gap a leaf is allowed to keep. Left as siblings of the tab's own
                          * flex, the vendor spaced them by its own rules and the icon touched the
                          * first letter.
                          */}
                            <span className={choiceTabContentClassName}>
                                {tab.icon === undefined ? null : <Icon source={iconSourceFor(tab.icon, "leading")} role={"leading"} />}
                                {tab.label}
                            </span>
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs.ListContainer>
        </Tabs>
    )
}
