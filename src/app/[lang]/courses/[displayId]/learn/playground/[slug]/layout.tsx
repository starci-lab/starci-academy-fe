import type { ReactNode } from "react"
import { RouteShell } from "@/components/shells/RouteShell"
import { PlaygroundSessionLayout } from "@/components/layouts/PlaygroundSessionLayout"

/** Framework inputs for the persistent playground slug boundary. */
export type PlaygroundSlugLayoutProps = {
    readonly children: ReactNode
    readonly params: Promise<{ displayId: string; slug: string }>
}

/** Mount the persistent playground session owner around setup and live child routes. */
const PlaygroundSlugLayout = async (input: PlaygroundSlugLayoutProps) => {
    const { displayId, slug } = await input.params
    return (
        <RouteShell frame={PlaygroundSessionLayout} props={{ displayId, slug }}>
            {input.children}
        </RouteShell>
    )
}

export default PlaygroundSlugLayout
