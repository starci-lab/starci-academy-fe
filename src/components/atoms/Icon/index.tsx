import {
    ArrowClockwiseIcon,
    ArrowRightIcon,
    BookBookmarkIcon,
    CheckCircleIcon,
    CoinIcon,
    EnvelopeSimpleIcon,
    FireIcon,
    GraduationCapIcon,
    LockKeyIcon,
    PaperPlaneTiltIcon,
    ShieldCheckIcon,
    SignInIcon,
    SparkleIcon,
    XIcon,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"

/**
 * ATOM - `Icon`: the picture a word needs when the word alone is slower to find.
 *
 * WHY A NAME AND NOT A COMPONENT. A caller passing `<FireIcon />` decides three things at the
 * call site - which library, which glyph, and how big - and the first screen to answer them
 * differently is the screen where the streak stops looking like the streak. Here the caller
 * names the MEANING, `name="streak"`, and this file owns the glyph. Swapping the flame for
 * something better is then one line in one file rather than a search for an import.
 *
 * WHY THE SET IS CLOSED. Phosphor ships several thousand glyphs, and a product that can reach
 * all of them has no iconography - it has a search box. The union below is every meaning these
 * two screens actually carry; a fifteenth entry is a real decision and is made here.
 *
 * COLOUR IS NOT A PROP, ON PURPOSE. The glyph draws in `currentColor`, so it inherits whatever
 * `text-*` the node above it carries and can never disagree with the label beside it. An icon
 * with a colour of its own is the one that stays blue after the row it sits in turns muted.
 *
 * SIZE IS A CLASS, NOT THE VENDOR'S NUMBER. `size-4` and `size-5` are the two steps in use;
 * the numeric `size={20}` prop would put a pixel value in the tree that no other icon shares.
 */

/** What an icon MEANS on these screens. The glyph that draws it is this file's business. */
export type IconName =
    | "brand"
    | "streak"
    | "credit"
    | "reward"
    | "course"
    | "email"
    | "password"
    | "code"
    | "signedIn"
    | "signIn"
    | "close"
    | "next"
    | "retry"
    | "send"

/** The two steps. A third size is a decision nobody can make consistently across screens. */
export type IconSize = "sm" | "md"

/** Props for {@link Icon}. */
export interface IconProps {
    /** What this icon means. The glyph follows from it. */
    name: IconName
    /** The step. `sm` sits beside body text, `md` leads a row or an empty state. */
    size?: IconSize
    /**
     * Draws the solid cut instead of the outline, for the one icon on a surface that is
     * carrying emphasis rather than merely labelling something.
     */
    isEmphasised?: boolean
}

/** The meaning-to-glyph map. The only file in the repository that names a Phosphor icon. */
const GLYPHS: Record<IconName, PhosphorIcon> = {
    brand: GraduationCapIcon,
    streak: FireIcon,
    credit: SparkleIcon,
    reward: CoinIcon,
    course: BookBookmarkIcon,
    email: EnvelopeSimpleIcon,
    password: LockKeyIcon,
    code: ShieldCheckIcon,
    signedIn: CheckCircleIcon,
    signIn: SignInIcon,
    close: XIcon,
    next: ArrowRightIcon,
    retry: ArrowClockwiseIcon,
    send: PaperPlaneTiltIcon,
}

/** Diameter per step, plus the shrink that stops a glyph being squeezed inside a flex row. */
const SIZE_CLASSES = {
    sm: "size-4 shrink-0",
    md: "size-5 shrink-0",
} as const

/**
 * Draw one meaning as a glyph.
 *
 * @param props - {@link IconProps}
 */
export const Icon = ({ name, size = "sm", isEmphasised = false }: IconProps) => {
    const Glyph = GLYPHS[name]
    return <Glyph className={SIZE_CLASSES[size]} weight={isEmphasised ? "fill" : "regular"} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Icon" } as const
