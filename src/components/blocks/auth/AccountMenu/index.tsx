"use client"

import { useTranslations } from "next-intl"
import { mutate } from "swr"
import { useRouter } from "@/i18n/navigation"
import { setSessionToken, useSessionToken } from "@/hooks/auth/useSessionToken"
import { QUERY_ME_SWR_KEY, useQueryMeSwr } from "@/hooks/swr/useQueryMeSwr"
import { useMutateSignOutSwr } from "@/hooks/swr/useMutateSignOutSwr"
import { AccountMenuBase, type AccountMenuDestination } from "./component"

/** Authentication-overlay callbacks supplied by the shell composition. */
export type AccountMenuProps = {
    readonly on?: {
        readonly signIn?: () => void
        readonly signUp?: () => void
    }
}

/**
 * Composition-facing account-menu block.
 *
 * ShellNav already resolves this shared navigation copy and owns the authentication overlays, so
 * this half receives those resolved values and delegates the complete product sentence to its
 * pure twin.
 */
export const AccountMenu = (props: AccountMenuProps) => {
    const t = useTranslations("shell")
    const router = useRouter()
    const token = useSessionToken()
    const viewer = useQueryMeSwr()
    const signOut = useMutateSignOutSwr()

    if (token === undefined) {
        return (
            <AccountMenuBase
                state="guest"
                props={{
                    label: t("account"),
                    guestMessage: t("guestMessage"),
                    signInLabel: t("signIn"),
                    signUpLabel: t("signUp"),
                }}
                on={props.on}
            />
        )
    }

    const identity = viewer.data
    const displayName = identity?.displayName || identity?.username || t("account")
    const destinations: ReadonlyArray<AccountMenuDestination> = [
        { id: "dashboard", label: t("accountMenu.dashboard"), icon: "home" },
        { id: "profile", label: t("accountMenu.profile"), icon: "profile" },
        { id: "cv", label: t("accountMenu.cv"), icon: "cv", isDisabled: identity?.username === undefined },
    ]

    return (
        <AccountMenuBase
            state="signedIn"
            props={{
                label: t("account"),
                displayName,
                email: identity?.email ?? "",
                avatar: identity?.avatar ?? undefined,
                destinations,
                signOutLabel: t("accountMenu.signOut"),
                isIdentityLoading: viewer.isLoading,
                isSigningOut: signOut.isMutating,
            }}
            on={{
                navigate: (id) => {
                    if (id === "dashboard") router.push("/dashboard")
                    if (id === "profile") router.push("/profile")
                    if (id === "cv" && identity?.username !== undefined) router.push(`/profile/${identity.username}/cv`)
                },
                signOut: () => {
                    void signOut.trigger().then(async () => {
                        setSessionToken(undefined)
                        await mutate(
                            (key) => Array.isArray(key) && key[0] === QUERY_ME_SWR_KEY[0],
                            undefined,
                            { revalidate: false },
                        )
                    })
                },
            }}
        />
    )
}
