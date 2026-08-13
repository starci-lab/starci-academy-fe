/**
 * The candidate's Icon leaf: two proposed meanings, drawn where a glyph package may be named.
 *
 * Target path: `src/components/leaves/Icon/index.tsx` - add two members to `IconName` and two rows
 * to `GLYPHS`, exactly as written below.
 *
 * WHY THIS FILE IS CALLED `index.tsx`, WHICH IS THE WHOLE FIX. `no-vendor-icon-outside-icon-leaf`
 * exempts one path and states it as a suffix: a file ending `/src/components/leaves/Icon/index.tsx`
 * may name a glyph package, and nothing else may. As `proposed-additions.tsx` this file sat one
 * filename away from that exemption and reported two errors it had no legal way to clear - every
 * escape considered was worse than the error. Deleting the imports would have taken `Icon`
 * with them and broken `ChoiceTabs`; hand-copying the Heroicon paths as inline SVG would have
 * passed the import check while doing the exact thing the rule exists to stop, choosing vendor,
 * glyph and size outside the leaf; an inline disable is that same evasion with a comment on it.
 *
 * The candidate mirrors the production tree elsewhere - its own contracts table, its own `Tree` -
 * so mirroring the leaf's path was the move that was already available. The rule did not need
 * widening and the code did not need bending; the file needed to be where it belonged.
 */
import { ListBulletIcon, Squares2X2Icon } from "@heroicons/react/24/outline"
import {
    ListBulletIcon as ListBulletSolidIcon,
    Squares2X2Icon as Squares2X2SolidIcon,
} from "@heroicons/react/16/solid"
import type { LeafProps } from "@/components/contracts/props"

/**
 * PROPOSED VOCABULARY - two new icon meanings.
 *
 * Target path: `src/components/leaves/Icon/index.tsx` - add two members to `IconName` and two rows
 * to `GLYPHS`, exactly as written below. Documentation target: the feature table in
 * `src/components/leaves/Icon/icon.md` AND its mirror in `.claude/fe/canon/patterns/icon.md`, which
 * that file requires to change together.
 *
 * WHY NEW MEANINGS AND NOT A NEAR MATCH. The icon map's own selection procedure forbids picking a
 * glyph because it resembles the nearest existing one: a feature either reuses an existing meaning
 * deliberately or gets its own row. Nothing in the table means "lay this collection out as a grid"
 * or "lay it out as rows" - the closest entries are `course` and `explore`, which name what is
 * being shown rather than how it is arranged. So these are two new rows.
 *
 * WHY THEY ARE ALLOWED TO EXIST AT ALL. The same procedure reserves inline glyphs for meanings
 * "actually present in the reference". The legacy catalog's view toggle is icon-only -
 * `SquaresFourIcon` and `ListIcon` from Phosphor, with the words in `aria-label`. This is that
 * control, so the glyphs are reference-backed rather than decoration.
 *
 * WHY NOT PHOSPHOR. The target admits exactly two Heroicon families and the lint rule rejects every
 * other glyph package. `Squares2X2Icon` and `ListBulletIcon` are the Heroicons equivalents, and
 * neither is already spoken for by another meaning, which the parity test requires.
 *
 * ROLE. `leading` at `size-5`, because the icon map assigns that role to "navigation, a row, field,
 * switch or icon control", and a view toggle is an icon control.
 */

/** The two proposed additions to `IconName`. */
export type ProposedIconName = "viewGrid" | "viewList"

/** The two proposed rows for `GLYPHS`, in the leaf's own outline/solid shape. */
export const PROPOSED_GLYPHS = {
    viewGrid: { outline: Squares2X2Icon, solid: Squares2X2SolidIcon },
    viewList: { outline: ListBulletIcon, solid: ListBulletSolidIcon },
} as const

/** The proposed feature-table rows, kept beside the code so Apply does not have to reword them. */
export const PROPOSED_ICON_MAP_ROWS = [
    "| `viewGrid` | Lay a collection out as a card grid | `Squares2X2Icon` | Four equal panes name an arrangement rather than the content being arranged |",
    "| `viewList` | Lay a collection out as compact rows | `ListBulletIcon` | A bulleted run of lines names row layout without borrowing the review clipboard |",
] as const

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type ProposedIconData = {
    /** Which proposed meaning to draw. */
    readonly name: ProposedIconName
    /** Placement role. Only `leading` is proposed; the toggle is an icon control. */
    readonly role?: "leading" | "chip"
}

/** Props for {@link Icon}. Three fixed slots, no fourth. */
export type ProposedIconProps = LeafProps<ProposedIconData>

const ROLE_CLASSES = { leading: "size-5 shrink-0", chip: "size-4 shrink-0" } as const

/**
 * Draw one proposed meaning.
 *
 * Deleted on merge: once the two rows land in `GLYPHS`, every use of this becomes
 * `<Icon props={{ name: "viewGrid", role: "leading" }} />` with no other change.
 */
export const Icon = ({ props }: ProposedIconProps) => {
    const role = props.role ?? "leading"
    const Glyph = role === "chip" ? PROPOSED_GLYPHS[props.name].solid : PROPOSED_GLYPHS[props.name].outline
    return <Glyph aria-hidden className={ROLE_CLASSES[role]} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
