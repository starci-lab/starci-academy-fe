"use client"

import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useQueryMeSwr } from "@/hooks/swr/useQueryMeSwr"
import { useQueryPublicUserCvSwr } from "@/hooks/swr/useQueryPublicUserCvSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import { ProfilePublicCvPageBase } from "./component"

type ProfilePublicCvState = "error" | "pending" | "empty" | "ready" | "uncompiled"
type PublicCvData = { readonly pdfUrl?: string | null }

const cvStateOf = (error: unknown, data: PublicCvData | null | undefined): ProfilePublicCvState => {
    if (error !== undefined) return "error"
    if (data === undefined) return "pending"
    if (data === null) return "empty"
    return data.pdfUrl === undefined ? "uncompiled" : "ready"
}

const cvMessageOf = (state: ProfilePublicCvState, t: (key: string) => string) => {
    if (state === "error") return "The public CV couldn't be loaded."
    if (state === "empty") return t("empty")
    if (state === "uncompiled") return t("pending")
    return ""
}

/** Resolve owner state and distinguish loading, missing, uncompiled and ready CVs. */
export const ProfilePublicCvPage = () => {
    const t = useTranslations("profile.cv")
    const params = useParams<{ username?: string }>()
    const router = useRouter()
    const username = String(params.username ?? "")
    const profile = useQueryUserProfileSwr(username)
    const viewer = useQueryMeSwr()
    const cv = useQueryPublicUserCvSwr(username)
    const isSelf = Boolean(profile.data?.id && viewer.data?.id === profile.data.id)
    const state = cvStateOf(cv.error, cv.data)
    return <ProfilePublicCvPageBase state={state} props={{ label: t("label"), message: cvMessageOf(state, t), title: cv.data?.label ?? t("label"), pdfUrl: cv.data?.pdfUrl ?? undefined, editLabel: t("edit"), retryLabel: "Try again", isSelf }} on={{ edit: () => router.push("/profile/cv"), retry: () => { void cv.mutate() } }} />
}

export * from "./component"
/** Source-level tier marker. */
export const meta = { world: "connected", domain: "profile" } as const
