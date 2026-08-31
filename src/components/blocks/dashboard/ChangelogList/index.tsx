"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryChangelogEntriesSwr } from "@/hooks"
import { ChangelogListBase, type ChangelogCategory } from "./component"

const isCategory = (value: string): value is ChangelogCategory =>
    value === "feature" || value === "fix" || value === "announcement"

/** Connected half: resolves dates/categories and routes an entry action without href ownership. */
/** Props for the connected changelog list. */
export type ChangelogListProps = Record<string, never>
/** Connect the ChangelogList block to its data source. */
export const ChangelogList = (props: ChangelogListProps) => {
    void props
    const t = useTranslations("changelog")
    const tCourses = useTranslations("courses.catalog")
    const locale = useLocale()
    const router = useRouter()
    const changelog = useQueryChangelogEntriesSwr()
    const entries = changelog.data ?? []
    const state: "failed" | "pending" | "empty" | "ready" = changelog.error !== undefined && changelog.data === undefined
        ? "failed"
        : changelog.data === undefined
            ? "pending"
            : entries.length === 0
                ? "empty"
                : "ready"
    const byId = new Map(entries.map((entry) => [entry.id, entry]))

    const viewProps = { state, props: {
        label: t("title"), emptyMessage: t("empty"), errorMessage: t("failed"), retryLabel: tCourses("retry"), entries: entries.map((entry) => {
            const category = isCategory(entry.category) ? entry.category : undefined
            return {
                id: entry.id,
                dateLabel: new Date(entry.publishedAt).toLocaleDateString(locale),
                category,
                categoryLabel: category === undefined ? undefined : t(`category.${category}`),
                title: entry.title,
                body: entry.body,
                isAction: typeof entry.linkUrl === "string" && entry.linkUrl.length > 0,
            }
        }) }, on: { open: (id: string) => {
        const destination = byId.get(id)?.linkUrl
        if (destination !== null && destination !== undefined && destination.length > 0) router.push(destination)
    }, retry: () => { void changelog.mutate() } }}
    return <ChangelogListBase {...viewProps} />
}

export * from "./component"
