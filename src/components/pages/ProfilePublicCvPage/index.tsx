"use client"

import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useQueryMeSwr } from "@/hooks/swr/useQueryMeSwr"
import { useQueryPublicUserCvSwr } from "@/hooks/swr/useQueryPublicUserCvSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import { _ProfilePublicCvPage } from "./component"

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
    const state = cv.error ? "error" : cv.data === undefined ? "pending" : cv.data === null ? "empty" : cv.data.pdfUrl ? "ready" : "uncompiled"
    return <_ProfilePublicCvPage state={state} props={{ label: t("label"), message: state === "error" ? "The public CV couldn't be loaded." : state === "empty" ? t("empty") : state === "uncompiled" ? t("pending") : "", title: cv.data?.label ?? t("label"), pdfUrl: cv.data?.pdfUrl ?? undefined, editLabel: t("edit"), retryLabel: "Try again", isSelf }} on={{ edit: () => router.push("/profile/cv"), retry: () => { void cv.mutate() } }} />
}

export * from "./component"
/** Source-level tier marker. */
export const meta = { world: "connected", domain: "profile" } as const
