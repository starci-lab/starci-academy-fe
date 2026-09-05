"use client"

import { useLocale, useTranslations } from "next-intl"
import { useQueryConceptsSwr } from "@/hooks/swr/useQueryConceptsSwr"
import { ConceptCatalogPageBase, type ConceptCatalogState } from "./component"

/** The catalog route has no routed identity beyond its locale. */
export type ConceptCatalogPageProps = Record<never, never>

/** Connect the public concept catalog to the localized GraphQL result. */
export const ConceptCatalogPage = (props: ConceptCatalogPageProps) => {
    void props
    const locale = useLocale()
    const t = useTranslations("concept.catalog")
    const query = useQueryConceptsSwr()
    const state: ConceptCatalogState = query.error !== undefined
        ? "failed"
        : query.data === undefined
            ? "pending"
            : query.data.length === 0 ? "empty" : "ready"
    const concepts = [...(query.data ?? [])]
        .sort((left, right) => left.sortIndex - right.sortIndex)
        .map((concept) => ({
            ...concept,
            href: `/${locale}/concept/${encodeURIComponent(concept.displayId)}`,
        }))
    const categoryLabels: Readonly<Record<string, string>> = {
        backend: t("category.backend"), frontend: t("category.frontend"), "system-design": t("category.systemDesign"),
        testing: t("category.testing"), devops: t("category.devops"), cloud: t("category.cloud"), "ai-harness": t("category.aiHarness"),
    }
    const difficultyLabels: Readonly<Record<string, string>> = {
        foundation: t("difficulty.foundation"), intermediate: t("difficulty.intermediate"), advanced: t("difficulty.advanced"),
    }

    return <ConceptCatalogPageBase
        state={state}
        concepts={concepts}
        labels={{
            eyebrow: t("eyebrow"),
            title: t("title"),
            description: t("description"),
            empty: t("empty"),
            failed: t("failed"),
            retry: t("retry"),
            open: (title) => t("open", { title }),
            minutes: (count) => t("minutes", { count }),
            category: (value) => categoryLabels[value] ?? value,
            difficulty: (value) => difficultyLabels[value] ?? value,
        }}
        onRetry={() => { void query.mutate() }}
    />
}
