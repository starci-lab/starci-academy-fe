import {
    AcademicCapIcon,
    ArrowPathIcon,
    ArrowRightIcon,
    ArrowRightOnRectangleIcon,
    BellIcon,
    BoltIcon,
    BookmarkIcon,
    BookOpenIcon,
    BriefcaseIcon,
    CheckCircleIcon,
    ClipboardDocumentCheckIcon,
    CodeBracketIcon,
    EnvelopeIcon,
    FireIcon,
    GiftIcon,
    GlobeAltIcon,
    HomeIcon,
    LanguageIcon,
    LockClosedIcon,
    MagnifyingGlassIcon,
    MoonIcon,
    NewspaperIcon,
    PaperAirplaneIcon,
    ShieldCheckIcon,
    ShoppingCartIcon,
    SunIcon,
    TrophyIcon,
    UserCircleIcon,
    UserGroupIcon,
    UserPlusIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline"
import {
    AcademicCapIcon as AcademicCapSolidIcon,
    ArrowPathIcon as ArrowPathSolidIcon,
    ArrowRightIcon as ArrowRightSolidIcon,
    ArrowRightEndOnRectangleIcon as ArrowRightOnRectangleSolidIcon,
    BellIcon as BellSolidIcon,
    BoltIcon as BoltSolidIcon,
    BookmarkIcon as BookmarkSolidIcon,
    BookOpenIcon as BookOpenSolidIcon,
    BriefcaseIcon as BriefcaseSolidIcon,
    CheckCircleIcon as CheckCircleSolidIcon,
    ClipboardDocumentCheckIcon as ClipboardDocumentCheckSolidIcon,
    CodeBracketIcon as CodeBracketSolidIcon,
    EnvelopeIcon as EnvelopeSolidIcon,
    FireIcon as FireSolidIcon,
    GiftIcon as GiftSolidIcon,
    GlobeAltIcon as GlobeAltSolidIcon,
    HomeIcon as HomeSolidIcon,
    LanguageIcon as LanguageSolidIcon,
    LockClosedIcon as LockClosedSolidIcon,
    MagnifyingGlassIcon as MagnifyingGlassSolidIcon,
    MoonIcon as MoonSolidIcon,
    NewspaperIcon as NewspaperSolidIcon,
    PaperAirplaneIcon as PaperAirplaneSolidIcon,
    ShieldCheckIcon as ShieldCheckSolidIcon,
    ShoppingCartIcon as ShoppingCartSolidIcon,
    SunIcon as SunSolidIcon,
    TrophyIcon as TrophySolidIcon,
    UserCircleIcon as UserCircleSolidIcon,
    UserGroupIcon as UserGroupSolidIcon,
    UserPlusIcon as UserPlusSolidIcon,
    XMarkIcon as XMarkSolidIcon,
} from "@heroicons/react/16/solid"
import type { ComponentType, SVGProps } from "react"
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
 * WHY THE SET IS CLOSED. Heroicons ships a large glyph catalogue, and a product that can reach all
 * of them has no iconography, it has a search box.
 * `icon.md` is the canonical feature-to-glyph table: read it before adding a meaning or choosing a
 * nearby glyph, and update it in the same change as this map.
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
    | "search" | "cart" | "notification" | "account" | "saved" | "blog" | "talents" | "jobs" | "practice"

/** The two native Heroicon roles used by the product. */
export type IconRole = "heading" | "leading" | "chip"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type IconData = {
    /** What this icon means. The glyph follows from it. */
    readonly name: IconName
    /** `heading` is 24px outline; `leading` is 20px outline; `chip` is 16px micro. */
    readonly role?: IconRole
}

/** Props for {@link Icon}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type IconProps = LeafProps<IconData>

/**
 * The meaning-to-glyph map. The only file in the repository that names a Heroicon.
 *
 * Two entries are NOT Heroicons: a provider mark has to be the provider own, in its own colours,
 * because that is what a reader recognises before they read anything.
 */
type GlyphComponent = ComponentType<SVGProps<SVGSVGElement>>

/** Native Heroicon drawings for the two product roles. */
type GlyphCuts = { readonly heading: GlyphComponent, readonly leading: GlyphComponent, readonly chip: GlyphComponent }

/** Pair the normal and subject cuts without exposing either component to a caller. */
const cuts = (outline: GlyphComponent, chip: GlyphComponent): GlyphCuts => ({
    heading: outline,
    leading: outline,
    chip,
})

const GLYPHS: Record<IconName, GlyphCuts> = {
    brand: cuts(AcademicCapIcon, AcademicCapSolidIcon),
    streak: cuts(FireIcon, FireSolidIcon),
    credit: cuts(BoltIcon, BoltSolidIcon),
    reward: cuts(GiftIcon, GiftSolidIcon),
    course: cuts(BookOpenIcon, BookOpenSolidIcon),
    email: cuts(EnvelopeIcon, EnvelopeSolidIcon),
    password: cuts(LockClosedIcon, LockClosedSolidIcon),
    code: cuts(ShieldCheckIcon, ShieldCheckSolidIcon),
    signedIn: cuts(CheckCircleIcon, CheckCircleSolidIcon),
    signIn: cuts(ArrowRightOnRectangleIcon, ArrowRightOnRectangleSolidIcon),
    close: cuts(XMarkIcon, XMarkSolidIcon),
    next: cuts(ArrowRightIcon, ArrowRightSolidIcon),
    retry: cuts(ArrowPathIcon, ArrowPathSolidIcon),
    send: cuts(PaperAirplaneIcon, PaperAirplaneSolidIcon),
    home: cuts(HomeIcon, HomeSolidIcon),
    explore: cuts(GlobeAltIcon, GlobeAltSolidIcon),
    community: cuts(UserGroupIcon, UserGroupSolidIcon),
    league: cuts(TrophyIcon, TrophySolidIcon),
    review: cuts(ClipboardDocumentCheckIcon, ClipboardDocumentCheckSolidIcon),
    light: cuts(SunIcon, SunSolidIcon),
    dark: cuts(MoonIcon, MoonSolidIcon),
    locale: cuts(LanguageIcon, LanguageSolidIcon),
    search: cuts(MagnifyingGlassIcon, MagnifyingGlassSolidIcon),
    cart: cuts(ShoppingCartIcon, ShoppingCartSolidIcon),
    notification: cuts(BellIcon, BellSolidIcon),
    account: cuts(UserCircleIcon, UserCircleSolidIcon),
    saved: cuts(BookmarkIcon, BookmarkSolidIcon),
    blog: cuts(NewspaperIcon, NewspaperSolidIcon),
    talents: cuts(UserPlusIcon, UserPlusSolidIcon),
    jobs: cuts(BriefcaseIcon, BriefcaseSolidIcon),
    practice: cuts(CodeBracketIcon, CodeBracketSolidIcon),
    google: cuts(GoogleMark, GoogleMark),
    github: cuts(GithubMark, GithubMark),
}

/** Each role keeps the diameter its Heroicon drawing was authored for. */
const ROLE_CLASSES = {
    heading: "size-6 shrink-0",
    leading: "size-5 shrink-0",
    chip: "size-4 shrink-0",
} as const

/**
 * Draw one meaning as a glyph.
 *
 * @param input - {@link IconProps}
 */
export const Icon = ({ props }: IconProps) => {
    const glyph = GLYPHS[props.name]
    const role = props.role ?? "chip"
    const Glyph = glyph[role]
    return <Glyph aria-hidden className={ROLE_CLASSES[role]} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
