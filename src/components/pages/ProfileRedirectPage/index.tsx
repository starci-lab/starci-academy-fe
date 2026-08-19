"use client"
import { useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { useQueryMeSwr } from "@/hooks/swr/useQueryMeSwr"
import { ProfileRedirectPageBase } from "./component"
/** Resolve the current username and replace `/profile`. */
export const ProfileRedirectPage = () => {
    const router = useRouter()
    const me = useQueryMeSwr()
    useEffect(() => {
        if (me.data?.username) router.replace(`/profile/${me.data.username}`)
        else if (me.data === null) router.replace("/authentication")
    }, [me.data, router])
    return <ProfileRedirectPageBase />
}
export * from "./component"
/** Source-level tier marker. */
export const meta = { world: "connected", domain: "profile" } as const
