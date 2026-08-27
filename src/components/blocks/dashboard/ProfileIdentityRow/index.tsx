"use client"

import { useCallback } from "react"
import { useRouter } from "@/i18n/navigation"
import { useQueryMeSwr } from "@/hooks"
import { ProfileIdentityRowBase } from "./component"

/** Connected dashboard identity anchor backed by the authenticated `me` query. */
/** Props for the connected profile identity row. */
export type ProfileIdentityRowProps = Record<string, never>
/** Connect the ProfileIdentityRow block to its data source. */
export const ProfileIdentityRow = (props: ProfileIdentityRowProps) => {
    void props
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

    if (isLoading) return <ProfileIdentityRowBase state="pending" />
    if (hasFailed || user == null || username === undefined || displayName === undefined) {
        return <ProfileIdentityRowBase state="empty" />
    }
    return (
        <ProfileIdentityRowBase
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
