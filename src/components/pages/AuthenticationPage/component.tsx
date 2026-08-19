import { Tree } from "@/components/branches/Tree"
import { SurfaceFormCard } from "@/components/branches/SurfaceFormCard"
import { AuthenticationPanel } from "@/components/blocks/auth/AuthenticationPanel"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"

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
export const AuthenticationPageBase = ({ on }: AuthenticationPageProps) => {
    const cardContent = defineContractComponent("authentication-panel-card", {
        panel: defineContractProjection("centred-page-column", () => (
            <AuthenticationPanel onSignedIn={on?.signedIn} />
        )),
    })

    return (
        <Tree
            contract="centred-authentication-page"
            render={defineContractComponent("centred-authentication-page", {
                surface: defineContractProjection("authentication-panel-card", () => (
                    <SurfaceFormCard contract="authentication-panel-card" render={cardContent} />
                )),
            })}
        />
    )
}

/** Source-level tier marker for the authentication page. */
export const meta = { world: "pure", domain: "auth" } as const
