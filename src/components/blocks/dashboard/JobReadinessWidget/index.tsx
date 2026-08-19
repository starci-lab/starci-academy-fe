"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryMyJobReadinessSwr } from "@/hooks"
import { JobReadinessWidgetBase, type JobReadinessMetric } from "./component"

/** Connected half: resolves the strongest readiness track and product navigation. */
export const JobReadinessWidget = () => {
    const t = useTranslations("jobReadiness")
    const router = useRouter()
    const readiness = useQueryMyJobReadinessSwr()
    const track = readiness.data?.tracks[0]
    const state = readiness.error !== undefined && readiness.data === undefined
        ? "failed"
        : readiness.data === undefined
            ? "pending"
            : track === undefined
                ? "empty"
                : "ready"
    const metrics: ReadonlyArray<JobReadinessMetric> | undefined = track === undefined ? undefined : [
        { id: "capstone", label: t("metric.capstone"), score: track.capstoneScore ?? undefined, scoreLabel: track.capstoneScore === null ? "—" : `${track.capstoneScore}%` },
        { id: "interview", label: t("metric.interview"), score: track.interviewScore ?? undefined, scoreLabel: track.interviewScore === null ? "—" : `${track.interviewScore}%` },
        { id: "cv", label: t("metric.cv"), score: track.cvScore ?? undefined, scoreLabel: track.cvScore === null ? "—" : `${track.cvScore}%` },
    ]
    const percentile = readiness.data?.foundation.codingPercentile

    return (
        <JobReadinessWidgetBase
            state={state}
            props={{
                label: t("title"),
                emptyMessage: t("empty"),
                errorMessage: t("error"),
                retryLabel: t("retry"),
                courseTitle: track?.courseTitle,
                depthScore: track?.depthScore ?? undefined,
                depthScoreLabel: track?.depthScore === null || track?.depthScore === undefined ? undefined : `${track.depthScore}% · ${track.courseTitle}`,
                band: track?.band,
                bandLabel: track === undefined ? undefined : t(`band.${track.band}`),
                percentileLabel: percentile === null || percentile === undefined ? undefined : t("foundationPercentile", { percent: percentile }),
                metrics,
                actionLabel: t("action"),
            }}
            on={{
                retry: () => { void readiness.mutate() },
                act: () => router.push(track === undefined ? "/courses" : `/courses/${track.courseSlug}`),
            }}
        />
    )
}

export * from "./component"

/** Source-level tier marker for the connected dashboard block. */
export const meta = { world: "connected", domain: "dashboard" } as const
