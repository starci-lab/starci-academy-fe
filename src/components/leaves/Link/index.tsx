import { Link as HeroLink } from "@heroui/react"
import Image from "next/image"
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

/** Intrinsic product lockup; navigation only decides where it leads. */
const BrandLockup = () => (
    <>
        <Image
            src="/brand/starci-logo.png"
            alt=""
            width={40}
            height={40}
            className={linkBrandMarkClassName}
            priority
        />
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
            {data.emphasis === "brand" ? <BrandLockup /> : (
                <>
                    {data.icon === undefined ? null : <Icon props={{ name: data.icon, role: "chip" }} />}
                    {data.label}
                </>
            )}
        </HeroLink>
    )
}
