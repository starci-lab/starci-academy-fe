import { Pagination as VendorPagination } from "@heroui/react"

/**
 * LEAF - `Pagination`: which page of a list is showing, and the way to another one.
 *
 * Target path: `src/components/leaves/Pagination/index.tsx`.
 *
 * WHY IT HAS TO EXIST. The catalog reads nine courses at a time, so the list has pages whether or
 * not anything draws them. The target owns no pagination vocabulary at any tier, which is why the
 * page is currently unbuildable past its first nine rows.
 *
 * THE VENDOR SHIPS PARTS, NOT A CONTROL. HeroUI 3's `Pagination` is a compound — root, content,
 * item, link, previous, next, ellipsis — with no page model of its own. The window arithmetic
 * therefore has to live somewhere, and a leaf is where it belongs: every caller would otherwise
 * reimplement "which numbers are visible" and they would disagree on the edges.
 *
 * IT COUNTS FROM ONE. The backend documents `PaginationPageFilters.pageNumber` as 1-based while the
 * legacy client passes a 0-based index; one of the two is wrong and Preview does not get to guess.
 * This leaf speaks the human numbering it displays, and whoever wires it converts once, in the
 * connected file, where the disagreement is visible instead of buried in a control.
 *
 * IT DOES NOT REST. A pager whose page count is unknown has nothing to draw, so the caller omits it
 * entirely while loading rather than shimmering a control that may never appear.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type PaginationData = {
    /** The accessible name of the control, already resolved. */
    readonly label: string
    /** Total pages, one or more. */
    readonly total: number
    /** The showing page, 1-based. */
    readonly page: number
    /** Accessible name of the previous-page control. */
    readonly previousLabel: string
    /** Accessible name of the next-page control. */
    readonly nextLabel: string
}

/** What the pager reports. */
export type PaginationActions = {
    /** Called with the 1-based page the reader asked for. */
    readonly change?: (page: number) => void
}

/** Props for {@link Pagination}. Three fixed slots, no fourth. */
export type PaginationProps = { readonly props: PaginationData; readonly on?: PaginationActions; readonly isLoading?: boolean }

/**
 * The visible window: first, last, the showing page and one neighbour either side.
 *
 * `null` is a gap rather than a page, so the ellipsis is part of the model instead of something
 * the render guesses at by comparing adjacent numbers.
 */
const windowOf = (page: number, total: number): ReadonlyArray<number | null> => {
    const wanted = new Set<number>([1, total, page - 1, page, page + 1])
    const pages = [...wanted].filter((value) => value >= 1 && value <= total).sort((a, b) => a - b)
    return pages.flatMap((value, index) => {
        const previous = pages[index - 1]
        return previous !== undefined && value - previous > 1 ? [null, value] : [value]
    })
}

/**
 * The pager: it says which page of a list is showing and offers the way to another one.
 *
 * It draws the window from {@link windowOf} between a previous and a next control, clamps the page
 * it was handed into the range it can actually show, and reports a 1-based page through
 * `on.change` - never a page it is already on, so a repeated press cannot refetch the same rows.
 */
export const Pagination = (props: PaginationProps) => {
    const data = props.props
    const on = props.on
    const total = Math.max(1, Math.floor(data.total))
    const page = Math.min(Math.max(1, Math.floor(data.page)), total)
    const go = (next: number) => {
        if (next >= 1 && next <= total && next !== page) on?.change?.(next)
    }
    return (
        <VendorPagination aria-label={data.label} data-page={page} data-total={total}>
            <VendorPagination.Content>
                <VendorPagination.Item>
                    <VendorPagination.Previous aria-label={data.previousLabel} isDisabled={page === 1} onPress={() => go(page - 1)}>
                        <VendorPagination.PreviousIcon />
                    </VendorPagination.Previous>
                </VendorPagination.Item>
                {windowOf(page, total).map((value, index) => (
                    <VendorPagination.Item key={value ?? `gap-${index}`}>
                        {value === null ? (
                            <VendorPagination.Ellipsis />
                        ) : (
                            <VendorPagination.Link isActive={value === page} onPress={() => go(value)}>
                                {String(value)}
                            </VendorPagination.Link>
                        )}
                    </VendorPagination.Item>
                ))}
                <VendorPagination.Item>
                    <VendorPagination.Next aria-label={data.nextLabel} isDisabled={page === total} onPress={() => go(page + 1)}>
                        <VendorPagination.NextIcon />
                    </VendorPagination.Next>
                </VendorPagination.Item>
            </VendorPagination.Content>
        </VendorPagination>
    )
}
