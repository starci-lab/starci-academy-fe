"use client"

import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useQueryMeSwr } from "@/hooks/swr/useQueryMeSwr"
import { useQueryPublicUserCvSwr } from "@/hooks/swr/useQueryPublicUserCvSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import { ProfilePublicCvBase } from "./component"

type PublicCvData = { readonly pdfUrl?: string | null; readonly label?: string | null }
const stateOf = (error: unknown, data: PublicCvData | null | undefined) => error !== undefined ? "error" as const : data === undefined ? "pending" as const : data === null ? "empty" as const : data.pdfUrl === undefined ? "uncompiled" as const : "ready" as const

/** Connected public-CV owner; the page shell does not proxy this block's query state. */
export const ProfilePublicCvBlock = () => {
    const t = useTranslations("profile.cv")
    const params = useParams<{ username?: string }>()
    const router = useRouter()
    const username = String(params.username ?? "")
    const profile = useQueryUserProfileSwr(username)
    const viewer = useQueryMeSwr()
    const cv = useQueryPublicUserCvSwr(username)
    const isSelf = Boolean(profile.data?.id && viewer.data?.id === profile.data.id)
    const state = stateOf(cv.error, cv.data)
    const message = state === "error" ? "The public CV couldn't be loaded." : state === "empty" ? t("empty") : state === "uncompiled" ? t("pending") : ""
    return <ProfilePublicCvBase state={state} label={t("label")} message={message} title={cv.data?.label ?? t("label")} pdfUrl={cv.data?.pdfUrl ?? undefined} editLabel={t("edit")} retryLabel="Try again" isSelf={isSelf} on={{ edit: () => router.push("/profile/cv"), retry: () => { void cv.mutate() } }} />
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "profile" } as const
