"use client"

import { useEffect, useState } from "react"
import { mutationRefreshToken } from "@/modules/api/graphql/mutations/mutation-refresh-token"
import { setSessionToken, useSessionToken } from "./useSessionToken"

/** Refresh before Keycloak's short access-token window closes. */
const REFRESH_AHEAD_SECONDS = 45

let refreshInFlight: Promise<void> | undefined

/** Decode only the public expiry claim; JWT verification remains the server's job. */
const expiresAt = (token: string): number | undefined => {
    try {
        const encoded = token.split(".")[1]
        if (encoded === undefined) return undefined
        const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/")
        const payload = JSON.parse(window.atob(normalized)) as { exp?: unknown }
        return typeof payload.exp === "number" ? payload.exp * 1000 : undefined
    } catch {
        return undefined
    }
}

/** One refresh shared by timer and focus, because the server rotates the cookie each time. */
export const refreshSession = (): Promise<void> => {
    if (refreshInFlight !== undefined) return refreshInFlight
    refreshInFlight = mutationRefreshToken({ minValiditySeconds: REFRESH_AHEAD_SECONDS })
        .then((result) => {
            const envelope = result.data?.refreshToken
            if (!envelope?.success || envelope.data === undefined) {
                setSessionToken(undefined)
                return
            }
            setSessionToken(envelope.data.accessToken)
        })
        .catch(() => {
            setSessionToken(undefined)
        })
        .finally(() => {
            refreshInFlight = undefined
        })
    return refreshInFlight
}

/** Keep the in-memory access token alive from the HttpOnly refresh session. */
export type SessionRefreshState = {
    /** True only while the HttpOnly refresh session is being resolved on a cold page load. */
    readonly isRestoring: boolean
}

/** Restore a cold session, then keep its in-memory access token fresh. */
export const useSessionRefresh = (): SessionRefreshState => {
    const token = useSessionToken()
    // Keep the server and the first client render identical. The browser token lives in
    // module memory and can survive client navigation/HMR while SSR can never observe it;
    // deriving initial markup from that difference causes a hydration replacement.
    const [isRestoring, setIsRestoring] = useState(true)

    useEffect(() => {
        if (token === undefined) {
            let isCurrent = true
            setIsRestoring(true)
            void refreshSession().finally(() => {
                if (isCurrent) setIsRestoring(false)
            })
            return () => {
                isCurrent = false
            }
        }

        setIsRestoring(false)
        const expiry = expiresAt(token)
        if (expiry === undefined) return

        const delay = Math.max(0, expiry - Date.now() - REFRESH_AHEAD_SECONDS * 1000)
        const timer = window.setTimeout(() => {
            void refreshSession()
        }, delay)

        const refreshWhenVisible = () => {
            if (document.visibilityState !== "visible") return
            if (expiry - Date.now() <= REFRESH_AHEAD_SECONDS * 1000) void refreshSession()
        }
        document.addEventListener("visibilitychange", refreshWhenVisible)
        window.addEventListener("focus", refreshWhenVisible)
        return () => {
            window.clearTimeout(timer)
            document.removeEventListener("visibilitychange", refreshWhenVisible)
            window.removeEventListener("focus", refreshWhenVisible)
        }
    }, [token])

    return { isRestoring }
}
