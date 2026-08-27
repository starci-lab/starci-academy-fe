import { SurfaceFormCard } from "@/components/branches/SurfaceFormCard"
import { AuthenticationPanel } from "@/components/blocks/auth/AuthenticationPanel"

/** What the authentication page reports. */
export type AuthenticationPageActions = {
    /** Called after the panel establishes a session. */
    readonly signedIn?: () => void
}

/** Props for {@link AuthenticationPageBase}. */
export type AuthenticationPageProps = {
    readonly on?: AuthenticationPageActions
}

/**
 * Draw the authentication block as the one centred surface on the route.
 *
 * @param input - {@link AuthenticationPageProps}
 */
export const AuthenticationPageBase = (props: AuthenticationPageProps) => {
    const { on } = props
    return (
        <SurfaceFormCard>
            <AuthenticationPanel onSignedIn={on?.signedIn} />
        </SurfaceFormCard>
    )
}
