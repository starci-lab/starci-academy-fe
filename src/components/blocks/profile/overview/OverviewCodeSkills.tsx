"use client"

import { useTranslations } from "next-intl"
import type { LabelledProgressRowData } from "@/components/composites/LabelledProgressRow"
import { SkillSnapshot } from "./SkillSnapshot"
import { useOverviewEvidence } from "./useOverviewEvidence"

type Breakdown = { readonly key: string, readonly solved: number }
type CodingSkills = { readonly byLanguage: ReadonlyArray<Breakdown>, readonly byDifficulty: ReadonlyArray<Breakdown>, readonly byDomain: ReadonlyArray<Breakdown> }

/** Practice proof snapshot preserves solved total and the legacy difficulty/language breakdowns. */
export const OverviewCodeSkills = () => {
    const t = useTranslations("profile")
    const request = useOverviewEvidence<CodingSkills>("coding-skills")
    const data = request.data
    const total = data?.byDifficulty.reduce((sum, item) => sum + item.solved, 0) ?? 0
    const rows: Array<LabelledProgressRowData> = (data?.byDifficulty ?? []).map((item) => ({ id: `difficulty-${item.key}`, title: item.key, percent: total ? Math.round(item.solved / total * 100) : 0, percentText: String(item.solved) }))
    if (request.isLoading) rows.push({ id: "resting", title: "" })
    const languages = data?.byLanguage ?? []
    return <SkillSnapshot label={t("overview.codeSkills")} totalLabel={t("overview.solved")} totalValue={request.isLoading ? undefined : String(total)} rows={rows} isLoading={request.isLoading} stateMessage={request.error ? t("evidence.error") : !request.isLoading && total === 0 ? t("evidence.coding-skills.empty") : languages.length ? t("overview.languageBreakdown", { list: languages.map((item) => `${item.key} ${item.solved}`).join(" · ") }) : undefined} />
}
