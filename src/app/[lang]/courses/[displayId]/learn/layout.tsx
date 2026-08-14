import { RouteShell } from "@/components/shells/RouteShell"
import { LearnShellLayout } from "@/components/layouts/LearnShellLayout"
import type { ReactNode } from "react"

/**
 * The `/courses/[displayId]/learn` layout — the frame every learn surface is read inside.
 *
 * A MOUNTING POINT AND NOTHING ELSE, exactly like the routes beside it: which modes exist, how they
 * group and what a locked one looks like all live one tier down, where they can be rendered and
 * changed without a router.
 *
 * `RouteShell` is what turns the framework's `children` into the component the frame expects, and it
 * is the only component allowed to. The frame crosses to it as a component REFERENCE — a
 * `"use client"` import passed from a server file is a client reference, while an inline arrow
 * written here is a function and fails to serialise.
 */

/** Props Next hands a segment layout. */
interface LearnLayoutProps {
    /** The routed learn surface. */
    children: ReactNode
    /** The resolved route parameters. */
    params: Promise<{ displayId: string }>
}

const LearnLayout = async (input: LearnLayoutProps) => {
    const { displayId } = await input.params
    return (
        <RouteShell frame={LearnShellLayout} props={{ displayId }}>
            {input.children}
        </RouteShell>
    )
}

export default LearnLayout
