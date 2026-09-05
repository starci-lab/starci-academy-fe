"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useQueryConceptSwr } from "@/hooks/swr/useQueryConceptSwr"
import { ConceptDetailPageBase, type ConceptDetailState, type ConceptReaderTab } from "./component"

/** Routed identity required to connect one concept page. */
export interface ConceptDetailPageProps { readonly displayId: string }

/** Connect one routed concept to its localized API document and local reading position. */
export const ConceptDetailPage = (props: ConceptDetailPageProps) => {
    const { displayId } = props
    const locale = useLocale()
    const t = useTranslations("concept.detail")
    const query = useQueryConceptSwr(displayId)
    const [selectedSectionId, setSelectedSectionId] = useState("overview")
    const [selectedTab, setSelectedTab] = useState<ConceptReaderTab>("lesson")
    const firstSectionId = query.data == null ? undefined : [...query.data.sections].sort((left, right) => left.sortIndex - right.sortIndex)[0]?.displayId
    useEffect(() => { setSelectedSectionId(firstSectionId ?? "overview"); setSelectedTab("lesson") }, [displayId, firstSectionId])
    const state: ConceptDetailState = query.error !== undefined ? "failed" : query.data === undefined ? "pending" : query.data === null ? "missing" : "ready"
    const categoryLabels: Readonly<Record<string, string>> = {
        backend: t("category.backend"), frontend: t("category.frontend"), "system-design": t("category.systemDesign"),
        testing: t("category.testing"), devops: t("category.devops"), cloud: t("category.cloud"), "ai-harness": t("category.aiHarness"),
    }
    const difficultyLabels: Readonly<Record<string, string>> = {
        foundation: t("difficulty.foundation"), intermediate: t("difficulty.intermediate"), advanced: t("difficulty.advanced"),
    }
    const phaseLabels: Readonly<Record<string, string>> = {
        challenge: t("phase.challenge"), predict: t("phase.predict"), explore: t("phase.explore"),
        explain: t("phase.explain"), apply: t("phase.apply"), reflect: t("phase.reflect"),
    }
    const activityLabels: Readonly<Record<string, string>> = {
        choice: t("activity.choice"), exercise: t("activity.exercise"), explain: t("activity.explain"),
        retrieval: t("activity.retrieval"), simulation: t("activity.simulation"),
    }

    return <ConceptDetailPageBase
        state={state}
        concept={query.data}
        selectedSectionId={selectedSectionId}
        selectedTab={selectedTab}
        catalogHref={`/${locale}/concept`}
        labels={{
            back: t("back"), loadingTitle: t("loadingTitle"), loadingDescription: t("loadingDescription"),
            failed: t("failed"), missing: t("missing"), retry: t("retry"), minutes: (count) => t("minutes", { count }),
            overview: t("overview"), overviewPosition: t("overviewPosition"), path: t("path"), position: (current, total) => t("position", { current, total }),
            tabs: { group: t("tabs.group"), lesson: t("tabs.lesson"), source: t("tabs.source"), practice: t("tabs.practice") },
            outcomes: t("outcomes"), prerequisites: t("prerequisites"), sources: t("sources"), sourceUnavailable: t("sourceUnavailable"), runCommand: t("runCommand"),
            practice: t("practice"), practiceUnavailable: t("practiceUnavailable"), currentPrompt: t("currentPrompt"), references: t("references"),
            noActivities: t("noActivities"), diagnostic: t("diagnostic"), delayed: (days) => t("delayed", { days }),
            category: (value) => categoryLabels[value] ?? value,
            difficulty: (value) => difficultyLabels[value] ?? value,
            phase: (value) => phaseLabels[value] ?? value,
            activity: (value) => activityLabels[value] ?? value,
        }}
        onSelectSection={setSelectedSectionId}
        onSelectTab={(tab) => setSelectedTab(tab)}
        onRetry={() => { void query.mutate() }}
    />
}
