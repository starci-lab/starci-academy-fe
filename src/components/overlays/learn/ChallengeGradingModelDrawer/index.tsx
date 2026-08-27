"use client"

import useSWR from "swr"
import { useTranslations } from "next-intl"
import { useQueryMyAiQuotaSwr } from "@/hooks"
import { queryPersonalProjectGradingModels } from "@/modules/api/graphql/queries/query-course-personal-project"
import {
    ChallengeGradingModelDrawerBase,
    type ChallengeGradingModelDeliverable,
    type ChallengeGradingModelOption,
} from "./component"

/** Controlled Challenge model drawer; the Challenge draft remains the selection owner. */
export type ChallengeGradingModelDrawerProps = {
    readonly isOpen: boolean
    readonly selectedDefaultModelId: string
    readonly deliverables: ReadonlyArray<ChallengeGradingModelDeliverable>
    readonly onDismiss: () => void
    readonly onSelectDefault?: (modelId: string) => void
    readonly onApplyAll?: () => void
    readonly onOverride?: (deliverableId: string, modelId: string) => void
}

/** Resolve the public grading catalogue without adopting Personal Project business ownership. */
export const ChallengeGradingModelDrawer = (input: ChallengeGradingModelDrawerProps) => {
    const t = useTranslations("learn.content")
    const quota = useQueryMyAiQuotaSwr()
    const catalogue = useSWR(
        input.isOpen ? "CHALLENGE_GRADING_MODEL_CATALOGUE" : null,
        async () => {
            const result = await queryPersonalProjectGradingModels()
            return result.data?.aiModels?.data?.gradableModels ?? []
        },
    )
    const models: ReadonlyArray<ChallengeGradingModelOption> = [
        { id: "auto", label: t("challengeModelAuto"), detail: t("challengeModelAutoDetail") },
        ...(catalogue.data ?? []).map((model) => ({
            id: `${model.provider}:${model.model}`,
            label: model.model,
            detail: `${model.provider} · ${model.category}`,
            disabled: !model.available,
        })),
    ]
    const quotaLabel = quota.data === undefined || quota.data === null
        ? undefined
        : t("challengeModelQuota", { remaining: quota.data.credit.remainingWeek })

    return (
        <ChallengeGradingModelDrawerBase
            {...input}
            labels={{
                title: t("challengeModelTitle"),
                description: t("challengeModelDescription"),
                quotaUnavailable: t("challengeModelQuotaUnavailable"),
                applyAll: t("challengeModelApplyAll"),
                selected: t("challengeModelSelected"),
                override: (title) => t("challengeModelOverride", { title }),
            }}
            quotaLabel={quotaLabel}
            models={models}
        />
    )
}

export * from "./component"
/** Connected ownership marker for the Challenge grading catalogue boundary. */
export const meta = { shape: "overlay", world: "connected", domain: "learn" } as const
