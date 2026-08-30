"use client"

import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
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
    const params = useParams<{ username?: string }>()
    const username = String(params.username ?? "")
    const profile = useQueryUserProfileSwr(username)
    const viewer = useQueryMeSwr()
    const cv = useQueryPublicUserCvSwr(username)
    if (profile.data === undefined || viewer.data === undefined) return <ProfilePublicCvBase state="pending" label={t("label")} message="" title={t("label")} editLabel={t("edit")} retryLabel="Thử lại" isSelf={false} /> // vn-ok: localized Vietnamese recovery copy.
    const isSelf = Boolean(profile.data?.id && viewer.data?.id === profile.data.id)
    if (isSelf) return <ProfilePublicCvBase state="empty" label={t("label")} message="" title={t("label")} editLabel={t("edit")} retryLabel="Thử lại" isSelf /> // vn-ok: localized Vietnamese interface copy.
    const state = stateOf(cv.error, cv.data)
    const message = state === "error" ? "Không tải được CV công khai." : state === "empty" ? t("empty") : state === "uncompiled" ? t("pending") : "" // vn-ok: localized Vietnamese recovery copy.
    return <ProfilePublicCvBase state={state} label={t("label")} message={message} title={cv.data?.label ?? t("label")} pdfUrl={cv.data?.pdfUrl ?? undefined} editLabel={t("edit")} retryLabel="Thử lại" isSelf={false} on={{ retry: () => { void cv.mutate() } }} /> // vn-ok: localized Vietnamese recovery copy.
}
