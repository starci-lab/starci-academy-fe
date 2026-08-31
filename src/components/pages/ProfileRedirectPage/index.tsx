"use client"
import { useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { useQueryMeSwr } from "@/hooks/swr/useQueryMeSwr"
import { ProfileRedirectPageBase } from "./component"
/** Resolve the current username and replace `/profile`. */
/** Props for the canonical profile redirect page. */
export type ProfileRedirectPageProps = Record<never, never>
/** Render the connected profile redirect route. */
export const ProfileRedirectPage = (props: ProfileRedirectPageProps) => {
    void props
    const router = useRouter()
    const me = useQueryMeSwr()
    useEffect(() => {
        if (me.data?.username) router.replace(`/profile/${me.data.username}`)
        else if (me.data === null) router.replace("/authentication")
    }, [me.data, router])
    return <ProfileRedirectPageBase state={me.error ? "error" : "pending"} retryPending={me.isValidating} on={{ retry: () => void me.mutate() }} />
}
export * from "./component"
