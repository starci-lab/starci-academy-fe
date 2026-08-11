import {
    ArrowClockwiseIcon,
    ArrowRightIcon,
    BookBookmarkIcon,
    CheckCircleIcon,
    CoinIcon,
    EnvelopeSimpleIcon,
    FireIcon,
    BookmarkSimpleIcon,
    BellIcon,
    BriefcaseIcon,
    CodeIcon,
    CompassIcon,
    MagnifyingGlassIcon,
    ShoppingCartSimpleIcon,
    UserCircleIcon,
    GraduationCapIcon,
    HouseIcon,
    ListChecksIcon,
    MoonIcon,
    SunIcon,
    TrophyIcon,
    TranslateIcon,
    UsersThreeIcon,
    LockKeyIcon,
    PaperPlaneTiltIcon,
    ShieldCheckIcon,
    SignInIcon,
    SparkleIcon,
    XIcon,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import type { ReactElement } from "react"
import { GithubMark, GoogleMark } from "./brands"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `Icon`: the picture a word needs when the word alone is slower to find.
 *
 * WHY A NAME AND NOT A COMPONENT. A caller passing `<FireIcon />` decides three things at the call
 * site - which library, which glyph, how big - and the first screen to answer them differently is
 * the screen where the streak stops looking like the streak. Here the caller names the MEANING and
 * this file owns the glyph.
 *
 * WHY THE SET IS CLOSED. Phosphor ships several thousand glyphs, and a product that can reach all
 * of them has no iconography, it has a search box.
 *
 * COLOUR IS NOT A PROP. The glyph draws in `currentColor`, so it inherits whatever `text-*` the
 * node above carries and can never disagree with the label beside it.
 */

/** What an icon MEANS on these screens. The glyph that draws it is this file's business. */
export type IconName =
    | "brand" | "streak" | "credit" | "reward" | "course"
    | "email" | "password" | "code"
    | "signedIn" | "signIn" | "close" | "next" | "retry" | "send"
    | "home" | "explore" | "community" | "league" | "review"
    | "light" | "dark" | "locale" | "google" | "github"
    | "search" | "cart" | "notification" | "account" | "saved" | "talents" | "jobs" | "practice"

/** The two steps. A third size is a decision nobody can make consistently across screens. */
export type IconSize = "sm" | "md"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type IconData = {
    /** What this icon means. The glyph follows from it. */
    readonly name: IconName
    /** The step. `sm` sits beside body text, `md` leads a row or an empty state. */
    readonly size?: IconSize
    /** The solid cut instead of the outline, for a glyph carrying emphasis rather than labelling. */
    readonly isEmphasised?: boolean
}

/** Props for {@link Icon}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type IconProps = LeafProps<IconData>

/**
 * The meaning-to-glyph map. The only file in the repository that names a Phosphor icon.
 *
 * Two entries are NOT Phosphor: a provider mark has to be the provider own, in its own colours,
 * because that is what a reader recognises before they read anything.
 */
const GLYPHS: Record<IconName, PhosphorIcon | (() => ReactElement)> = {
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
    home: HouseIcon,
    explore: CompassIcon,
    community: UsersThreeIcon,
    league: TrophyIcon,
    review: ListChecksIcon,
    light: SunIcon,
    dark: MoonIcon,
    locale: TranslateIcon,
    search: MagnifyingGlassIcon,
    cart: ShoppingCartSimpleIcon,
    notification: BellIcon,
    account: UserCircleIcon,
    saved: BookmarkSimpleIcon,
    talents: UserCircleIcon,
    jobs: BriefcaseIcon,
    practice: CodeIcon,
    google: GoogleMark,
    github: GithubMark,
}

/** Diameter per step, plus the shrink that stops a glyph being squeezed inside a flex row. */
const SIZE_CLASSES = { sm: "size-4 shrink-0", md: "size-5 shrink-0" } as const

/**
 * Draw one meaning as a glyph.
 *
 * @param input - {@link IconProps}
 */
export const Icon = ({ props }: IconProps) => {
    const Glyph = GLYPHS[props.name]
    return (
        <Glyph
            className={SIZE_CLASSES[props.size ?? "sm"]}
            weight={props.isEmphasised === true ? "fill" : "regular"}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
