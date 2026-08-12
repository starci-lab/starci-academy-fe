"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useQueryChangelogEntriesSwr } from "@/hooks"
import { _ChangelogList, type ChangelogCategory } from "./component"

const isCategory = (value: string): value is ChangelogCategory =>
    value === "feature" || value === "fix" || value === "announcement"

/** Connected half: resolves dates/categories and routes an entry action without href ownership. */
export const ChangelogList = () => {
    const t = useTranslations("changelog")
    const locale = useLocale()
    const router = useRouter()
    const changelog = useQueryChangelogEntriesSwr()
    const entries = changelog.data ?? []
    const state = changelog.error !== undefined && changelog.data === undefined
        ? "failed"
        : changelog.data === undefined
            ? "pending"
            : entries.length === 0
                ? "empty"
                : "ready"
    const byId = new Map(entries.map((entry) => [entry.id, entry]))

    return (
        <_ChangelogList
            state={state}
            props={{
                label: t("title"),
                emptyMessage: t("empty"),
                errorMessage: t("failed"),
                entries: entries.map((entry) => {
                    const category = isCategory(entry.category) ? entry.category : undefined
                    return {
                        id: entry.id,
                        dateLabel: new Date(entry.publishedAt).toLocaleDateString(locale),
                        category,
                        categoryLabel: category === undefined ? undefined : t(`category.${category}`),
                        title: entry.title,
                        body: entry.body,
                        isAction: entry.linkUrl !== null,
                    }
                }),
            }}
            on={{ open: (id) => {
                const destination = byId.get(id)?.linkUrl
                if (destination !== null && destination !== undefined) router.push(destination)
            } }}
        />
    )
}

export * from "./component"

/** Source-level tier marker for the connected dashboard block. */
export const meta = { world: "connected", domain: "dashboard" } as const
