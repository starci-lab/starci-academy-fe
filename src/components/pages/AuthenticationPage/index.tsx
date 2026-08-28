"use client"

import { useRouter } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { AuthenticationPageBase } from "./component"

const routeState = (value: string | null) => {
    switch (value) {
    case "sign-in-otp": return { mode: "signIn" as const, step: "code" as const, measure: "form" as const }
    case "sign-up": return { mode: "signUp" as const, step: "details" as const, measure: "form" as const }
    case "sign-up-otp": return { mode: "signUp" as const, step: "code" as const, measure: "form" as const }
    case "forgot-password": return { mode: "forgotPassword" as const, step: "details" as const, measure: "form" as const }
    case "forgot-password-otp": return { mode: "forgotPassword" as const, step: "code" as const, measure: "form" as const }
    default: return { mode: "signIn" as const, step: "details" as const, measure: "formCompact" as const }
    }
}

/** Resolve authentication-route navigation and draw its pure page twin. */
/** Props for the route-independent authentication page. */
export type AuthenticationPageProps = Record<never, never>
/** Render the connected authentication route. */
export const AuthenticationPage = (props: AuthenticationPageProps) => {
    void props
    const router = useRouter()
    const authState = useSearchParams().get("authState")
    const initial = routeState(authState)
    return <AuthenticationPageBase initialMode={initial.mode} initialStep={initial.step} measure={initial.measure} on={{ signedIn: () => router.replace("/dashboard") }} />
}
