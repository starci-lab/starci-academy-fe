import { skeletonVariants } from "@heroui/react"
import type { ComponentType, SVGProps } from "react"

export type IconRole = "heading" | "leading" | "chip"
/**
 * Minimal structural contract passed to an app-owned SVG glyph.
 *
 * This deliberately does not expose React's SVGProps in the public declaration. File-linked
 * consumers can carry a different compatible @types/react installation, whose private ref symbol
 * must not become part of Grammar's package boundary.
 */
export type IconSourceProps = {
    readonly className?: string
    readonly focusable?: "false"
    readonly role?: "img"
    readonly "aria-hidden"?: boolean
    readonly "aria-label"?: string
    readonly "data-tier"?: string
    readonly "data-component"?: string
    readonly "data-role"?: string
}

/** Function or class SVG glyph selected by the consuming app's icon registry. */
export type IconSource =
    | ((props: IconSourceProps) => unknown)
    | (new (props: IconSourceProps) => unknown)

export type IconProps = {
    /** App-owned glyph identity. Grammar owns only its role, geometry, and accessibility. */
    readonly source: IconSource
    readonly role?: IconRole
    /** Omit for a decorative glyph; provide when the icon itself carries meaning. */
    readonly ariaLabel?: string
    readonly isSkeleton?: boolean
}

const ROLE_CLASS_NAMES = {
    heading: "size-6 shrink-0",
    leading: "size-5 shrink-0",
    chip: "size-4 shrink-0",
} as const

const SKELETON_CLASS_NAME = skeletonVariants({ animationType: "shimmer" }).base({
    className: "size-5 shrink-0 rounded-full",
})

/** Product-neutral icon carrier; semantic glyph names and libraries remain app authority. */
export const Icon = ({ source: Source, role = "chip", ariaLabel, isSkeleton = false }: IconProps) => {
    if (isSkeleton) {
        return <span data-tier="atom" data-component="Icon" data-loading="true" aria-hidden className={SKELETON_CLASS_NAME} />
    }

    // The private cast is the only React-type identity boundary. Consumers see the structural
    // IconSource contract above, while JSX still receives the local React component type.
    const SourceComponent = Source as ComponentType<SVGProps<SVGSVGElement>>
    return (
        <SourceComponent
            data-tier="atom"
            data-component="Icon"
            data-role={role}
            focusable="false"
            className={ROLE_CLASS_NAMES[role]}
            {...(ariaLabel === undefined
                ? { "aria-hidden": true as const }
                : { "aria-label": ariaLabel, role: "img" as const })}
        />
    )
}
