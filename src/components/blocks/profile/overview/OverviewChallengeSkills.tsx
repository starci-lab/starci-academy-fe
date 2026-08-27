"use client"

import { useTranslations } from "next-intl"
import type { LabelledProgressRowData } from "@/components/composites/LabelledProgressRow"
import { SkillSnapshot } from "./SkillSnapshot"
import { useOverviewEvidence } from "./useOverviewEvidence"

type Challenge = {
  readonly id: string;
  readonly difficulty?: string | null;
  readonly selectedLang?: string | null;
};

/** Challenge proof snapshot preserves passed count, difficulty depth, and language breadth. */
/** Props for the connected challenge-skills overview block. */
export type OverviewChallengeSkillsProps = Record<never, never>
/** Load and render challenge skills in the profile overview. */
export const OverviewChallengeSkills = (props: OverviewChallengeSkillsProps) => {
    void props
    const t = useTranslations("profile")
    const request =
    useOverviewEvidence<ReadonlyArray<Challenge>>("solved-challenges")
    const challenges = request.data ?? []
    const difficulty = new Map<string, number>()
    const languages = new Set<string>()
    challenges.forEach((item) => {
        if (item.difficulty)
            difficulty.set(
                item.difficulty,
                (difficulty.get(item.difficulty) ?? 0) + 1,
            )
        if (item.selectedLang) languages.add(item.selectedLang)
    })
    const rows: Array<LabelledProgressRowData> = [...difficulty].map(
        ([key, value]) => ({
            id: `difficulty-${key}`,
            title: key,
            percent: challenges.length
                ? Math.round((value / challenges.length) * 100)
                : 0,
            percentText: String(value),
        }),
    )
    if (request.isLoading) rows.push({ id: "resting", title: "" })
    return (
        <SkillSnapshot
            label={t("overview.challengeSkills")}
            totalLabel={t("overview.passed")}
            totalValue={request.isLoading ? undefined : String(challenges.length)}
            rows={rows}
            isLoading={request.isLoading}
            stateMessage={
                request.error
                    ? t("evidence.error")
                    : !request.isLoading && challenges.length === 0
                        ? t("evidence.solved-challenges.empty")
                        : languages.size
                            ? t("overview.languages", {
                                count: languages.size,
                                list: [...languages].join(" · "),
                            })
                            : undefined
            }
        />
    )
}
