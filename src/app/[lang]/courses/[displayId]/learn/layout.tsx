import { LearnShellLayout } from "@/components/product-shells/LearnShellLayout"
import type { ReactNode } from "react"

/**
 * The `/courses/[displayId]/learn` layout — the frame every learn surface is read inside.
 *
 * A MOUNTING POINT AND NOTHING ELSE, exactly like the routes beside it: which modes exist, how they
 * group and what a locked one looks like all live one tier down, where they can be rendered and
 * changed without a router.
 *
 * The framework's routed node crosses the client boundary as serializable content. The frame
 * receives it as a normal React child surface; no function conversion is required.
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
        <LearnShellLayout displayId={displayId} surface={input.children} />
    )
}

export default LearnLayout
