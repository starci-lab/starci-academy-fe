"use client"

import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useQueryMeSwr } from "@/hooks/swr/useQueryMeSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import { ProfilePublicCvBase } from "./component"

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
    if (profile.data === undefined || viewer.data === undefined) return <ProfilePublicCvBase state="pending" label={t("label")} title={t("defaultTitle")} description={t("description")} statusLabel={t("status.loading")} noticeTitle="" noticeDescription="" openLabel={t("open")} editLabel={t("edit")} retryLabel={t("retry")} isSelf={false} />
    const isSelf = Boolean(profile.data?.id && viewer.data?.id === profile.data.id)
    return <ProfilePublicCvBase state="empty" label={t("label")} title={t("defaultTitle")} description={t("description")} statusLabel={t("status.empty")} noticeTitle={t("states.empty.title")} noticeDescription={t("states.empty.description")} openLabel={t("open")} editLabel={t("edit")} retryLabel={t("retry")} isSelf={isSelf} />
}
