"use client"

import { useCallback } from "react"
import { useRouter } from "@/i18n/navigation"
import { useQueryMeSwr } from "@/hooks"
import { _ProfileIdentityRow } from "./component"

/** Connected dashboard identity anchor backed by the authenticated `me` query. */
export const ProfileIdentityRow = () => {
    const router = useRouter()
    const me = useQueryMeSwr()
    const hasFailed = me.error !== undefined && me.error !== null
    const isLoading = me.data === undefined && !hasFailed
    const user = me.data
    const username = user?.username ?? user?.email?.split("@")[0]
    const displayName = user?.displayName?.trim() || username
    // Only wired into the settled render below, which the guard proves has a resolved username.
    const openProfile = useCallback(() => {
        router.push(`/profile/${username}`)
    }, [router, username])

    if (isLoading) return <_ProfileIdentityRow state="pending" />
    if (hasFailed || user == null || username === undefined || displayName === undefined) {
        return <_ProfileIdentityRow state="empty" />
    }
    return (
        <_ProfileIdentityRow
            state="settled"
            props={{
                displayName,
                username,
                avatar: user?.avatar ?? undefined,
            }}
            on={{ openProfile }}
        />
    )
}

/** Source-level tier marker for the connected dashboard identity block. */
export const meta = { world: "connected", domain: "identity" } as const
