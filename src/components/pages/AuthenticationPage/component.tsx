import { SurfaceCard } from "@starci/grammar/common"
import { AuthenticationPanel } from "@/components/blocks/auth/AuthenticationPanel"
import type { AuthMode } from "@/hooks/auth/useAuthPanel"
import { authenticationPageClassName } from "./classNames"

/** What the authentication page reports. */
export type AuthenticationPageActions = {
    /** Called after the panel establishes a session. */
    readonly signedIn?: () => void
}

/** Props for {@link AuthenticationPageBase}. */
export type AuthenticationPageProps = {
    /** Content-aware form measure selected from the URL-owned journey state. */
    readonly measure?: "form" | "formCompact"
    /** URL-owned journey rendered before the browser hydrates stored challenge metadata. */
    readonly initialMode?: AuthMode
    /** URL-owned step rendered before the browser hydrates stored challenge metadata. */
    readonly initialStep?: "details" | "code"
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
        <main className={authenticationPageClassName}>
            <SurfaceCard isScrollable={true} measure={props.measure ?? "form"} composition="single">
                <AuthenticationPanel initialMode={props.initialMode} initialStep={props.initialStep} onSignedIn={on?.signedIn} />
            </SurfaceCard>
        </main>
    )
}
