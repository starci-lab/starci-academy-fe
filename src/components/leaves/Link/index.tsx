import { Link as HeroLink } from "@heroui/react"
import { Icon, type IconName } from "@/components/leaves/Icon"
import { linkBrandMarkClassName, linkBrandNameClassName, linkBrandSuffixClassName, linkBrandTextClassName, linkEmphasisClassNames } from "./classNames"

/**
 * LEAF - `Link`: text that either reports internal navigation or opens an external destination.
 *
 * INTERNAL STARCHI ROUTES NEVER ENTER `href`. They are reported through `on.press`, and the
 * connected owner calls `router.push`. Only an address outside StarCi may cross `externalHref`.
 */

/** How loudly the link is set. `brand` is the mark that names the product. */
export type LinkEmphasis = "default" | "muted" | "brand"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type LinkData = {
    /** A destination outside StarCi. Internal paths are actions, never href data. */
    readonly externalHref?: string
    /** The already-resolved words. Copy, so it never rests. */
    readonly label: string
    /** The meaning drawn before the words. It inherits the link's colour, never its own. */
    readonly icon?: IconName
    /** How loudly it is set. */
    readonly emphasis?: LinkEmphasis
}

/** Navigation action reported by an internal StarCi link. */
export type LinkActions = {
    readonly press?: () => void
}

/** Props for {@link Link}. */
export type LinkProps = { readonly props: LinkData; readonly on?: LinkActions; readonly isLoading?: boolean }

/** The set per emphasis. */

/** Resolved product name read by the intrinsic brand lockup. */
type BrandLockupProps = { readonly label: string }

/** Intrinsic product lockup; navigation only decides where it leads. */
const BrandLockup = ({ label }: BrandLockupProps) => (
    <>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className={linkBrandMarkClassName}
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
        <span className={linkBrandTextClassName}>
            <span className={linkBrandNameClassName}>StarCi</span>
            <span className={linkBrandSuffixClassName}>Academy</span>
        </span>
    </>
)

/**
 * Draw a link.
 *
 * @param input - {@link LinkProps}
 */
export const Link = (props: LinkProps) => {
    const data = props.props
    const on = props.on
    return (
        <HeroLink
            data-emphasis={data.emphasis ?? "default"}
            href={data.externalHref}
            onPress={on?.press}
            className={linkEmphasisClassNames[data.emphasis ?? "default"]}
        >
            {data.emphasis === "brand" ? <BrandLockup label={data.label} /> : (
                <>
                    {data.icon === undefined ? null : <Icon props={{ name: data.icon, role: "chip" }} />}
                    {data.label}
                </>
            )}
        </HeroLink>
    )
}
