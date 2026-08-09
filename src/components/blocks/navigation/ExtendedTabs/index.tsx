import { Button } from "@/components/atoms/Button"
import { Tree } from "@/components/frames/Tree"
import type { ContractSlotProps } from "@/components/contracts"

/**
 * BLOCK - `ExtendedTabs`: one choice out of a short, fixed run of them.
 *
 * PORTED FROM THE LIVE PRODUCT, where it was a thin wrapper over a vendor `Tabs` root whose
 * whole body was a `cn()` picking between three class strings, plus a global stylesheet
 * override named after the component. The vendor is only reachable from the atom tier here, and
 * there is no tabs atom, so what crosses is the CHOICE rather than the chrome: a run of press
 * targets where one of them is the one currently showing.
 *
 * WHY `track` DRAWS IT. The key is a fixed run of equal columns that wraps as a whole rather
 * than letting one item drop away from the rest - which is exactly what a tab strip must not do
 * - and it renders as a list, so assistive technology is told how many choices there are and
 * which one is being read. That is more than the original's own markup managed.
 *
 * WHAT IS MISSING, STATED PLAINLY. A real tab strip announces itself as one: a `tablist` whose
 * selected tab is marked `aria-selected` and which is walked with the arrow keys. Neither the
 * registry (no key owns that role) nor the button atom (a closed prop API with no ARIA door)
 * can say it today, so selection here is carried by the button's emphasis alone. That is a
 * genuine accessibility gap and it is written down rather than papered over: it needs a
 * `tab-strip` key, and it needs the atom tier to grow a tab.
 */

/** One choice in the run. */
export interface ExtendedTabsItem {
    /** Stable identity of the choice, used as the selection key. */
    id: string
    /** The already-resolved words of the choice. Copy is data. */
    label: string
    /** The choice is shown but cannot be taken - a locked section, an empty one. */
    isDisabled?: boolean
}

/** Props for {@link ExtendedTabs}. */
export interface ExtendedTabsProps {
    /** The choices, in display order. */
    items: ReadonlyArray<ExtendedTabsItem>
    /** Which choice is currently showing. Controlled: the surface owns the answer. */
    selectedId: string
    /** Reports the choice a reader made. The surface changes what is shown. */
    onSelect?: (id: string) => void
    /** Nothing to show yet - the run rests at its real width. */
    isLoading?: boolean
}

/**
 * Draw the run of choices.
 *
 * @param props - {@link ExtendedTabsProps}
 */
export const ExtendedTabs = ({ items, selectedId, onSelect, isLoading = false }: ExtendedTabsProps) => {
    /** The `body` role of the run: one press target per choice. */
    const Choices = ({ isLoading: resting }: ContractSlotProps) => (
        <>
            {items.map((item) => (
                <li key={item.id} data-part="tab" data-selected={item.id === selectedId ? "true" : "false"}>
                    <Button
                        variant={item.id === selectedId ? "secondary" : "ghost"}
                        size="sm"
                        disabled={item.isDisabled}
                        isLoading={resting}
                        onClick={onSelect === undefined ? undefined : () => onSelect(item.id)}
                    >
                        {item.label}
                    </Button>
                </li>
            ))}
        </>
    )

    return <Tree contract="track" isLoading={isLoading} slots={{ body: Choices }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "ExtendedTabs" } as const
