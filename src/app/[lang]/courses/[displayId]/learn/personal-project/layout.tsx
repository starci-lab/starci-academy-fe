import type { ReactNode } from "react"
import { PersonalProjectWorkspaceLayout } from "@/components/layouts/PersonalProjectWorkspaceLayout"

interface PersonalProjectLayoutRouteProps {
    readonly children: ReactNode
    readonly params: Promise<{ readonly displayId: string }>
}

const PersonalProjectLayoutRoute = async (input: PersonalProjectLayoutRouteProps) => {
    const { displayId } = await input.params
    return (
        <PersonalProjectWorkspaceLayout displayId={displayId} surface={input.children} />
    )
}

export default PersonalProjectLayoutRoute
