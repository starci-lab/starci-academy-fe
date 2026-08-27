"use client"

import { useRouter } from "@/i18n/navigation"
import { AuthenticationPageBase } from "./component"

/** Resolve authentication-route navigation and draw its pure page twin. */
/** Props for the route-independent authentication page. */
export type AuthenticationPageProps = Record<never, never>
/** Render the connected authentication route. */
export const AuthenticationPage = (props: AuthenticationPageProps) => {
    void props
    const router = useRouter()
    return <AuthenticationPageBase on={{ signedIn: () => router.replace("/dashboard") }} />
}
