import { Icon } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `ValuePropositionDisclosure`: a course's promises, folded away until asked for.
 *
 * Target path: `src/components/leaves/ValuePropositionDisclosure/index.tsx`.
 *
 * A PREVIEW-LEVEL OWNERSHIP CORRECTION, recorded rather than done quietly. The plan record proposed
 * this as a CONTRACT (`value-proposition-disclosure`). A contract entry draws one `div` and its
 * classes — it cannot produce a `details`/`summary` pair, and there is no accordion branch in the
 * target to project into. Expressing a disclosure through a contract was therefore impossible, not
 * merely awkward. The product decision is untouched: the promises stay available and stop competing
 * with price for first read. Only the tier that owns them moved, from contract to leaf, which is
 * the tier that already owns intrinsic controls.
 *
 * IT IS A NATIVE DISCLOSURE. `details` is keyboard-operable, announced as expandable and searchable
 * by the browser's own find-in-page when open, none of which a div with a click handler gets for
 * free.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type ValuePropositionDisclosureData = {
    /** The already-resolved summary line, e.g. the count of promises. */
    readonly summary: string
    /** The already-resolved promise lines, in the order the course declares them. */
    readonly items: ReadonlyArray<string>
    /** Whether the disclosure starts open. Closed is the direction's whole point. */
    readonly isOpen?: boolean
}

/** Props for {@link ValuePropositionDisclosure}. Three fixed slots, no fourth. */
export type ValuePropositionDisclosureProps = LeafProps<ValuePropositionDisclosureData>

/**
 * A course's promises, folded away behind a native disclosure until a reader asks for them.
 *
 * It draws a `details`/`summary` pair so the browser owns the keyboard, the expanded announcement
 * and find-in-page, and it renders nothing at all while the promises are unknown or empty - an
 * empty fold reads as a broken control rather than a pending one.
 */
export const ValuePropositionDisclosure = ({ props, isLoading = false }: ValuePropositionDisclosureProps) => {
    // Nothing to fold while the promises are still unknown: an empty disclosure invites a press
    // that opens onto nothing, which reads as a broken control rather than a pending one.
    if (isLoading || props.items.length === 0) return null
    return (
        <details
            data-tier="leaf"
            data-component="ValuePropositionDisclosure"
            data-count={props.items.length}
            open={props.isOpen ?? false}
            className="group border-t border-separator pt-2"
        >
            <summary className="cursor-pointer list-none text-xs leading-4 text-muted marker:content-none hover:text-foreground">
                <span className="inline-flex items-center gap-1">
                    {props.summary}
                    <span className="transition-transform group-open:rotate-180">
                        <Icon props={{ name: "disclosure", role: "chip" }} />
                    </span>
                </span>
            </summary>
            <ul className="mt-2 flex flex-col gap-2">
                {props.items.map((item) => (
                    <li key={item} className="flex gap-2 text-xs leading-4 text-foreground">
                        <span className="shrink-0 text-success">
                            <Icon props={{ name: "complete", role: "chip" }} />
                        </span>
                        <span className="min-w-0">{item}</span>
                    </li>
                ))}
            </ul>
        </details>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
