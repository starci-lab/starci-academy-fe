"use client"

import { useCallback, type ComponentType, type ReactNode } from "react"

/**
 * SHELL - `RouteShell`: the one place a framework's `children` becomes this house's component.
 *
 * WHY IT EXISTS, and it is the framework's reason rather than ours. A Next segment layout is HANDED
 * its routed page as `children`. No tier below a shell may take one - a component accepting markup
 * already built accepts a shape nothing can check - and a server component cannot do the conversion
 * either: handing a client component a FUNCTION is not serialisable, and the page fails as a server
 * exception with a digest and no line number. That is not a hypothetical; it is what the learn route
 * returned before this existed.
 *
 * So the node crosses the client boundary as a NODE, and becomes a component on this side of it.
 * Everything below receives `surface` and renders it itself.
 *
 * IT CONVERTS AND DOES NOTHING ELSE - SHELL-6. No route read, no data, no element of its own, no
 * decision about what is inside. A shell that arranged its interior would be a layout with a
 * children hole, which is the thing the closed shell list exists to prevent.
 *
 * THE FRAME ARRIVES AS A COMPONENT REFERENCE, which is exactly what a server file may pass: a
 * `"use client"` component imported there crosses as a client reference. An inline arrow written in
 * the server file does not, and that distinction is the whole bug this shell was born from.
 */

/** What a frame must accept to be mounted by this shell. */
export interface RouteFrameProps {
    /** The routed surface, as a component the frame renders wherever it decides. */
    readonly surface: ComponentType
}

/** Props for {@link RouteShell}. */
export interface RouteShellProps<P extends RouteFrameProps> {
    /** The routed page, as the framework hands it over. */
    readonly children: ReactNode
    /** The frame that draws around it. A client component reference, never an inline function. */
    readonly frame: ComponentType<P>
    /** Everything else that frame needs, resolved by the route. */
    readonly props: Omit<P, "surface">
}

/**
 * Mount a routed page inside a frame.
 *
 * @param input - {@link RouteShellProps}
 */
export const RouteShell = <P extends RouteFrameProps>(input: RouteShellProps<P>) => {
    const children = input.children
    const Surface = useCallback(() => <>{children}</>, [children])
    const Frame = input.frame
    return <Frame {...(input.props as P)} surface={Surface} />
}

/** Source-level tier marker. */
export const meta = { shape: "shell", world: "pure" } as const
