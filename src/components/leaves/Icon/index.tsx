import {
    AcademicCapIcon,
    Bars3Icon,
    ArrowLeftIcon,
    ArrowPathIcon,
    ArrowRightIcon,
    ArrowRightOnRectangleIcon,
    ArrowLeftStartOnRectangleIcon,
    BellIcon,
    BoltIcon,
    BookmarkIcon,
    BookOpenIcon,
    BuildingLibraryIcon,
    BriefcaseIcon,
    ChatBubbleLeftRightIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChevronRightIcon,
    ClipboardDocumentCheckIcon,
    CodeBracketIcon,
    CodeBracketSquareIcon,
    CommandLineIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    EllipsisHorizontalIcon,
    EyeIcon,
    EyeSlashIcon,
    FireIcon,
    GiftIcon,
    GlobeAltIcon,
    HomeIcon,
    LanguageIcon,
    LockClosedIcon,
    MagnifyingGlassIcon,
    MicrophoneIcon,
    MoonIcon,
    NewspaperIcon,
    PaperAirplaneIcon,
    RectangleStackIcon,
    ShareIcon,
    ShieldCheckIcon,
    ShoppingCartIcon,
    SparklesIcon,
    SunIcon,
    TrophyIcon,
    VideoCameraIcon,
    ListBulletIcon,
    Squares2X2Icon,
    UserCircleIcon,
    UserIcon,
    UserGroupIcon,
    UserPlusIcon,
    XMarkIcon,
    StarIcon,
} from "@heroicons/react/24/outline"
import {
    AcademicCapIcon as AcademicCapSolidIcon,
    Bars3Icon as Bars3SolidIcon,
    ArrowLeftIcon as ArrowLeftSolidIcon,
    ArrowPathIcon as ArrowPathSolidIcon,
    ArrowRightIcon as ArrowRightSolidIcon,
    ArrowRightEndOnRectangleIcon as ArrowRightOnRectangleSolidIcon,
    ArrowLeftStartOnRectangleIcon as ArrowLeftStartOnRectangleSolidIcon,
    BellIcon as BellSolidIcon,
    BoltIcon as BoltSolidIcon,
    BookmarkIcon as BookmarkSolidIcon,
    BookOpenIcon as BookOpenSolidIcon,
    BuildingLibraryIcon as BuildingLibrarySolidIcon,
    BriefcaseIcon as BriefcaseSolidIcon,
    ChatBubbleLeftRightIcon as ChatBubbleLeftRightSolidIcon,
    CheckCircleIcon as CheckCircleSolidIcon,
    XCircleIcon as XCircleSolidIcon,
    ChevronRightIcon as ChevronRightSolidIcon,
    ClipboardDocumentCheckIcon as ClipboardDocumentCheckSolidIcon,
    CodeBracketIcon as CodeBracketSolidIcon,
    CodeBracketSquareIcon as CodeBracketSquareSolidIcon,
    CommandLineIcon as CommandLineSolidIcon,
    Cog6ToothIcon as Cog6ToothSolidIcon,
    DocumentTextIcon as DocumentTextSolidIcon,
    EnvelopeIcon as EnvelopeSolidIcon,
    EllipsisHorizontalIcon as EllipsisHorizontalSolidIcon,
    EyeIcon as EyeSolidIcon,
    EyeSlashIcon as EyeSlashSolidIcon,
    FireIcon as FireSolidIcon,
    GiftIcon as GiftSolidIcon,
    GlobeAltIcon as GlobeAltSolidIcon,
    HomeIcon as HomeSolidIcon,
    LanguageIcon as LanguageSolidIcon,
    LockClosedIcon as LockClosedSolidIcon,
    MagnifyingGlassIcon as MagnifyingGlassSolidIcon,
    MicrophoneIcon as MicrophoneSolidIcon,
    MoonIcon as MoonSolidIcon,
    NewspaperIcon as NewspaperSolidIcon,
    PaperAirplaneIcon as PaperAirplaneSolidIcon,
    RectangleStackIcon as RectangleStackSolidIcon,
    ShareIcon as ShareSolidIcon,
    ShieldCheckIcon as ShieldCheckSolidIcon,
    ShoppingCartIcon as ShoppingCartSolidIcon,
    SparklesIcon as SparklesSolidIcon,
    SunIcon as SunSolidIcon,
    TrophyIcon as TrophySolidIcon,
    VideoCameraIcon as VideoCameraSolidIcon,
    ListBulletIcon as ListBulletSolidIcon,
    Squares2X2Icon as Squares2X2SolidIcon,
    UserCircleIcon as UserCircleSolidIcon,
    UserIcon as UserSolidIcon,
    UserGroupIcon as UserGroupSolidIcon,
    UserPlusIcon as UserPlusSolidIcon,
    XMarkIcon as XMarkSolidIcon,
    StarIcon as StarSolidIcon,
} from "@heroicons/react/16/solid"
import {
    CircleIcon,
    CourseRailIcon,
    FirstPlaceMedalIcon,
    SecondPlaceMedalIcon,
    ThirdPlaceMedalIcon,
} from "@starci/heroicons/24/outline"
import {
    CircleIcon as CircleSolidIcon,
    CourseRailIcon as CourseRailSolidIcon,
} from "@starci/heroicons/16/solid"
import type { IconSource, IconUsage } from "@starci/grammar/common"
import type { SVGProps } from "react"
import { GithubMark, GoogleMark } from "./brands"

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
    | "brand" | "aiChatbot" | "streak" | "credit" | "reward" | "course"
    | "email" | "password" | "revealPassword" | "hidePassword" | "code"
    | "complete" | "included" | "incomplete" | "pending" | "signIn" | "signUp" | "close" | "back" | "next" | "disclosure" | "retry" | "send"
    | "home" | "explore" | "community" | "league" | "review" | "livestream"
    | "light" | "dark" | "locale" | "google" | "github"
    | "search" | "cart" | "notification" | "account" | "profile" | "cv" | "settings" | "signOut"
    | "saved" | "blog" | "talents" | "jobs" | "practice"
    | "viewGrid" | "viewList" | "collapseRail" | "learnHome" | "courseContent" | "personalProject" | "flashcards"
    | "menu" | "navigationOverflow"
    | "mindMap" | "mockInterview" | "foundations" | "playground" | "courseLeaderboard" | "courseQa"
    | "star" | "ratingStarEmpty" | "ratingStarFilled"
    | "rankFirst" | "rankSecond" | "rankThird" | "rankOther"

/**
 * The meaning-to-glyph map. The only file in the repository that names a Heroicon.
 *
 * Two entries are NOT Heroicons: a provider mark has to be the provider own, in its own colours,
 * because that is what a reader recognises before they read anything.
 */
type GlyphComponent = IconSource

/**
 * StarCi AI's own mark: one chat silhouette around code chevrons and a small assistant spark.
 *
 * It is intentionally not a Heroicon. `talents` already owns the generic sparkle, while this
 * product identity must read as conversation plus code even when the floating button shows no
 * nearby text.
 */
const StarCiChatbotMark = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        aria-hidden="true"
        data-slot="icon"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.25 4.75h13.5A2.25 2.25 0 0 1 21 7v8.5a2.25 2.25 0 0 1-2.25 2.25H11l-4.75 2.5v-2.5h-1A2.25 2.25 0 0 1 3 15.5V7a2.25 2.25 0 0 1 2.25-2.25Z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 9-2 2 2 2m6-4 2 2-2 2m-3.25-5-1.5 6" />
        <path strokeLinecap="round" d="M18.25 3v2.5M17 4.25h2.5" />
    </svg>
)

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
    aiChatbot: cuts(StarCiChatbotMark, StarCiChatbotMark),
    streak: cuts(FireIcon, FireSolidIcon),
    credit: cuts(BoltIcon, BoltSolidIcon),
    reward: cuts(GiftIcon, GiftSolidIcon),
    course: cuts(BookOpenIcon, BookOpenSolidIcon),
    email: cuts(EnvelopeIcon, EnvelopeSolidIcon),
    password: cuts(LockClosedIcon, LockClosedSolidIcon),
    revealPassword: cuts(EyeIcon, EyeSolidIcon),
    hidePassword: cuts(EyeSlashIcon, EyeSlashSolidIcon),
    code: cuts(ShieldCheckIcon, ShieldCheckSolidIcon),
    complete: cuts(CheckCircleIcon, CheckCircleSolidIcon),
    included: cuts(CheckCircleIcon, CheckCircleIcon),
    incomplete: cuts(XCircleIcon, XCircleSolidIcon),
    pending: cuts(CircleIcon, CircleSolidIcon),
    signIn: cuts(ArrowRightOnRectangleIcon, ArrowRightOnRectangleSolidIcon),
    signUp: cuts(UserPlusIcon, UserPlusSolidIcon),
    close: cuts(XMarkIcon, XMarkSolidIcon),
    back: cuts(ArrowLeftIcon, ArrowLeftSolidIcon),
    next: cuts(ArrowRightIcon, ArrowRightSolidIcon),
    disclosure: cuts(ChevronRightIcon, ChevronRightSolidIcon),
    retry: cuts(ArrowPathIcon, ArrowPathSolidIcon),
    send: cuts(PaperAirplaneIcon, PaperAirplaneSolidIcon),
    home: cuts(HomeIcon, HomeSolidIcon),
    explore: cuts(GlobeAltIcon, GlobeAltSolidIcon),
    community: cuts(UserGroupIcon, UserGroupSolidIcon),
    league: cuts(TrophyIcon, TrophySolidIcon),
    livestream: cuts(VideoCameraIcon, VideoCameraSolidIcon),
    review: cuts(ClipboardDocumentCheckIcon, ClipboardDocumentCheckSolidIcon),
    star: cuts(StarIcon, StarSolidIcon),
    ratingStarEmpty: cuts(StarIcon, StarIcon),
    ratingStarFilled: cuts(StarSolidIcon, StarSolidIcon),
    light: cuts(SunIcon, SunSolidIcon),
    dark: cuts(MoonIcon, MoonSolidIcon),
    locale: cuts(LanguageIcon, LanguageSolidIcon),
    search: cuts(MagnifyingGlassIcon, MagnifyingGlassSolidIcon),
    cart: cuts(ShoppingCartIcon, ShoppingCartSolidIcon),
    notification: cuts(BellIcon, BellSolidIcon),
    account: cuts(UserCircleIcon, UserCircleSolidIcon),
    profile: cuts(UserIcon, UserSolidIcon),
    cv: cuts(DocumentTextIcon, DocumentTextSolidIcon),
    settings: cuts(Cog6ToothIcon, Cog6ToothSolidIcon),
    signOut: cuts(ArrowLeftStartOnRectangleIcon, ArrowLeftStartOnRectangleSolidIcon),
    saved: cuts(BookmarkIcon, BookmarkSolidIcon),
    blog: cuts(NewspaperIcon, NewspaperSolidIcon),
    talents: cuts(SparklesIcon, SparklesSolidIcon),
    jobs: cuts(BriefcaseIcon, BriefcaseSolidIcon),
    practice: cuts(CodeBracketIcon, CodeBracketSolidIcon),
    menu: cuts(Bars3Icon, Bars3SolidIcon),
    navigationOverflow: cuts(EllipsisHorizontalIcon, EllipsisHorizontalSolidIcon),
    viewGrid: cuts(Squares2X2Icon, Squares2X2SolidIcon),
    viewList: cuts(ListBulletIcon, ListBulletSolidIcon),
    collapseRail: cuts(CourseRailIcon, CourseRailSolidIcon),
    learnHome: cuts(Squares2X2Icon, Squares2X2SolidIcon),
    courseContent: cuts(BookOpenIcon, BookOpenSolidIcon),
    personalProject: cuts(CodeBracketSquareIcon, CodeBracketSquareSolidIcon),
    flashcards: cuts(RectangleStackIcon, RectangleStackSolidIcon),
    mindMap: cuts(ShareIcon, ShareSolidIcon),
    mockInterview: cuts(MicrophoneIcon, MicrophoneSolidIcon),
    foundations: cuts(BuildingLibraryIcon, BuildingLibrarySolidIcon),
    playground: cuts(CommandLineIcon, CommandLineSolidIcon),
    courseLeaderboard: cuts(TrophyIcon, TrophySolidIcon),
    courseQa: cuts(ChatBubbleLeftRightIcon, ChatBubbleLeftRightSolidIcon),
    rankFirst: cuts(FirstPlaceMedalIcon, FirstPlaceMedalIcon),
    rankSecond: cuts(SecondPlaceMedalIcon, SecondPlaceMedalIcon),
    rankThird: cuts(ThirdPlaceMedalIcon, ThirdPlaceMedalIcon),
    rankOther: cuts(TrophyIcon, TrophySolidIcon),
    google: cuts(GoogleMark, GoogleMark),
    github: cuts(GithubMark, GithubMark),
}

/** Resolve a product-owned semantic glyph name to the source Grammar renders. */
export const iconSourceFor = (name: IconName, usage: IconUsage = "chip"): IconSource => GLYPHS[name][usage]
