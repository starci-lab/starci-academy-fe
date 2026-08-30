"use client"

import { useParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { ProfileCvBuilder } from "../ProfileCvBuilder"
import { useQueryMeSwr } from "@/hooks/swr/useQueryMeSwr"
import { useQueryPublicUserCvSwr } from "@/hooks/swr/useQueryPublicUserCvSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import { ProfilePublicCvBase } from "./component"

type PublicCvData = { readonly pdfUrl?: string | null; readonly label?: string | null }
const stateOf = (error: unknown, data: PublicCvData | null | undefined) => error !== undefined ? "error" as const : data === undefined ? "pending" as const : data === null ? "empty" as const : data.pdfUrl == null ? "uncompiled" as const : "ready" as const

/** Connected public-CV owner; the page shell does not proxy this block's query state. */
export type ProfilePublicCvBlockProps = Record<never, never>
/** Load and render the connected public CV block. */
export const ProfilePublicCvBlock = (props: ProfilePublicCvBlockProps) => {
    void props
    const t = useTranslations("profile.cv")
    const locale = useLocale()
    const params = useParams<{ username?: string }>()
    const username = String(params.username ?? "")
    const profile = useQueryUserProfileSwr(username)
    const viewer = useQueryMeSwr()
    const cv = useQueryPublicUserCvSwr(username)
    if (profile.data === undefined || viewer.data === undefined) return <ProfilePublicCvBase state="pending" label={t("label")} title={t("defaultTitle")} description={t("description")} statusLabel={t("status.loading")} noticeTitle="" noticeDescription="" openLabel={t("open")} editLabel={t("edit")} retryLabel={t("retry")} isSelf={false} />
    const isSelf = Boolean(profile.data?.id && viewer.data?.id === profile.data.id)
    if (isSelf) return <ProfileCvBuilder />
    const state = stateOf(cv.error, cv.data)
    const notice = state === "error"
        ? { title: t("states.error.title"), description: t("states.error.description") }
        : state === "empty"
            ? { title: t("states.empty.title"), description: t("states.empty.description") }
            : state === "uncompiled"
                ? { title: t("states.uncompiled.title"), description: t("states.uncompiled.description") }
                : { title: "", description: "" }
    const updatedLabel = cv.data?.updatedAt === undefined || Number.isNaN(Date.parse(cv.data.updatedAt))
        ? undefined
        : t("updated", { date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(cv.data.updatedAt)) })
    const statusLabel = state === "pending" ? t("status.loading") : state === "empty" ? t("status.empty") : state === "uncompiled" ? t("status.uncompiled") : state === "ready" ? t("status.ready") : t("status.error")
    return <ProfilePublicCvBase state={state} label={t("label")} title={cv.data?.label ?? t("defaultTitle")} description={t("description")} statusLabel={statusLabel} noticeTitle={notice.title} noticeDescription={notice.description} updatedLabel={updatedLabel} pdfUrl={cv.data?.pdfUrl ?? undefined} openLabel={t("open")} editLabel={t("edit")} retryLabel={t("retry")} retryPending={state === "error" && cv.isValidating} isSelf={false} on={{ retry: () => { void cv.mutate() } }} />
}
