"use client"

import { useRouter } from "next/navigation"
import { _AuthenticationPage } from "./component"

/** Resolve authentication-route navigation and draw its pure page twin. */
export const AuthenticationPage = () => {
    const router = useRouter()
    return <_AuthenticationPage on={{ signedIn: () => router.replace("/dashboard") }} />
}

/** Source-level tier marker for the connected authentication page. */
export const meta = { world: "connected", domain: "auth" } as const
