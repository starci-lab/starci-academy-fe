"use client"

import { useTranslations } from "next-intl"
import { JobReadinessWidgetBase, type JobReadinessBand, type JobReadinessMetric } from "@/components/blocks/dashboard/JobReadinessWidget/component"
import { useOverviewEvidence } from "./useOverviewEvidence"
import { clamp } from "./shared"

type Readiness = { readonly foundation?: { readonly codingPercentile?: number, readonly cvScore?: number }, readonly tracks?: ReadonlyArray<{ readonly courseId: string, readonly courseTitle: string, readonly capstoneScore: number, readonly interviewScore: number, readonly cvScore: number, readonly depthScore: number, readonly band: string }> }

const band = (value?: string): JobReadinessBand => value === "jobReady" ? "jobReady" : value === "building" ? "building" : "needsWork"

/** Public-profile readiness keeps the legacy strongest-track summary and its three scored pillars. */
export const OverviewJobReadiness = () => {
    const t = useTranslations()
    const request = useOverviewEvidence<Readiness>("job-readiness")
    const tracks = request.data?.tracks ?? []
    const track = [...tracks].sort((a, b) => b.depthScore - a.depthScore)[0]
    const retry = () => { void request.mutate() }
    const common = { label: t("profile.evidence.job-readiness.label"), emptyMessage: t("jobReadiness.empty"), errorMessage: t("jobReadiness.error"), retryLabel: t("jobReadiness.retry") }

    if (request.error) return <JobReadinessWidgetBase state="failed" props={common} on={{ retry }} />
    if (request.isLoading) return <JobReadinessWidgetBase state="pending" props={common} />
    if (!track) return <JobReadinessWidgetBase state="empty" props={common} />

    const metrics: ReadonlyArray<JobReadinessMetric> = [
        { id: "capstone", label: t("jobReadiness.metric.capstone"), score: clamp(track.capstoneScore), scoreLabel: `${clamp(track.capstoneScore)}%` },
        { id: "interview", label: t("jobReadiness.metric.interview"), score: clamp(track.interviewScore), scoreLabel: `${clamp(track.interviewScore)}%` },
        { id: "cv", label: t("jobReadiness.metric.cv"), score: clamp(track.cvScore), scoreLabel: `${clamp(track.cvScore)}%` },
    ]
    const trackBand = band(track.band)
    return <JobReadinessWidgetBase state="ready" props={{ ...common, courseTitle: track.courseTitle, depthScore: clamp(track.depthScore), depthScoreLabel: `${clamp(track.depthScore)}% · ${track.courseTitle}`, band: trackBand, bandLabel: t(`jobReadiness.band.${trackBand}`), percentileLabel: request.data?.foundation?.codingPercentile == null ? undefined : t("jobReadiness.foundationPercentile", { percent: request.data.foundation.codingPercentile }), metrics }} />
}
