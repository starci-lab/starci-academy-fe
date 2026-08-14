import type { ReactNode } from "react"
import { PersonalProjectWorkspaceLayout } from "@/components/layouts/PersonalProjectWorkspaceLayout"
import { RouteShell } from "@/components/shells/RouteShell"

interface PersonalProjectLayoutRouteProps {
    readonly children: ReactNode
    readonly params: Promise<{ readonly displayId: string }>
}

const PersonalProjectLayoutRoute = async (input: PersonalProjectLayoutRouteProps) => {
    const { displayId } = await input.params
    return (
        <RouteShell frame={PersonalProjectWorkspaceLayout} props={{ displayId }}>
            {input.children}
        </RouteShell>
    )
}

export default PersonalProjectLayoutRoute
