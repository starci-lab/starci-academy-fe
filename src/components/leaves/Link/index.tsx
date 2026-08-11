import { Link as HeroLink } from "@heroui/react"
import { Icon, type IconName } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `Link`: text that takes the reader somewhere else.
 *
 * IT IS A LINK AND NOT A BUTTON WEARING ONE. A destination belongs in an `<a href>` so it can be
 * opened in a new tab, copied, and read out as a link - a control that navigates on press takes
 * all three away and gives nothing back.
 */

/** How loudly the link is set. `brand` is the mark that names the product. */
export type LinkEmphasis = "default" | "muted" | "brand"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type LinkData = {
    /** Where it goes. */
    readonly href: string
    /** The already-resolved words. Copy, so it never rests. */
    readonly label: string
    /** The meaning drawn before the words. It inherits the link's colour, never its own. */
    readonly icon?: IconName
    /** How loudly it is set. */
    readonly emphasis?: LinkEmphasis
}

/** Props for {@link Link}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type LinkProps = LeafProps<LinkData>

/** The set per emphasis. */
const EMPHASIS_CLASSES = {
    default: "inline-flex items-center gap-2 text-sm",
    muted: "inline-flex items-center gap-2 text-sm text-muted",
    brand: "inline-flex items-center gap-2 text-foreground no-underline",
} as const

/** Resolved product name read by the intrinsic brand lockup. */
type BrandLockupProps = { readonly label: string }

/** Intrinsic product lockup; navigation only decides where it leads. */
const BrandLockup = ({ label }: BrandLockupProps) => (
    <>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="h-10 w-auto shrink-0"
            role="img"
            aria-label={label}
        >
            <path d="M 339 208 A 96 96 0 1 0 339 304" fill="none" stroke="#FB59A7" strokeWidth="50" strokeLinecap="round" />
            <circle cx="339" cy="208" r="19" fill="#FB59A7" />
            <circle cx="339" cy="304" r="12" fill="none" stroke="#FB59A7" strokeWidth="12" />
            <path d="M 108 108 L 148 108 M 108 108 L 108 148" fill="none" stroke="#FB59A7" strokeWidth="24" strokeLinecap="round" />
            <path d="M 404 404 L 364 404 M 404 404 L 404 364" fill="none" stroke="#FB59A7" strokeWidth="24" strokeLinecap="round" />
            <circle cx="404" cy="108" r="14" fill="#FB59A7" />
            <circle cx="108" cy="404" r="14" fill="#FB59A7" />
        </svg>
        <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold leading-none text-foreground">StarCi</span>
            <span className="text-[8px] uppercase leading-none text-muted">Academy</span>
        </span>
    </>
)

/**
 * Draw a link.
 *
 * @param input - {@link LinkProps}
 */
export const Link = ({ props }: LinkProps) => (
    <HeroLink
        data-tier="leaf"
        data-component="Link"
        data-emphasis={props.emphasis ?? "default"}
        href={props.href}
        className={EMPHASIS_CLASSES[props.emphasis ?? "default"]}
    >
        {props.emphasis === "brand" ? <BrandLockup label={props.label} /> : (
            <>
                {props.icon === undefined ? null : <Icon props={{ name: props.icon, role: "chip" }} />}
                {props.label}
            </>
        )}
    </HeroLink>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
