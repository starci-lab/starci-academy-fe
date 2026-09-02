"use client"

import { useTranslations } from "next-intl"
import { SurfaceCard } from "@starci/grammar/common"
import { SurfaceListCard } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Badge } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { useOverviewEvidence } from "./useOverviewEvidence"
import { clamp } from "./shared"
import {
    profileReadinessCardClassName,
    profileReadinessListClassName,
    profileReadinessSummaryClassName,
    profileReadinessTrackClassName,
} from "./classNames"

type JobReadinessBand = "needsWork" | "building" | "jobReady"
type JobReadinessMetric = {
  readonly id: string;
  readonly label: string;
  readonly scoreLabel?: string;
};

type Readiness = {
  readonly foundation?: {
    readonly codingPercentile?: number;
    readonly cvScore?: number;
  };
  readonly tracks?: ReadonlyArray<{
    readonly courseId: string;
    readonly courseTitle: string;
    readonly capstoneScore: number;
    readonly interviewScore: number;
    readonly cvScore: number;
    readonly depthScore: number;
    readonly band: string;
  }>;
};

const band = (value?: string): JobReadinessBand =>
    value === "jobReady"
        ? "jobReady"
        : value === "building"
            ? "building"
            : "needsWork"

const restingMetrics: ReadonlyArray<JobReadinessMetric> = Array.from(
    { length: 3 },
    (_unused, index) => ({ id: `resting-${index + 1}`, label: "" }),
)

/** Public-profile readiness keeps the legacy strongest-track summary and its three scored pillars. */
/** Props for the connected job-readiness overview block. */
export type OverviewJobReadinessProps = Record<never, never>
/** Load and render job readiness in the profile overview. */
export const OverviewJobReadiness = (props: OverviewJobReadinessProps) => {
    void props
    const t = useTranslations()
    const request = useOverviewEvidence<Readiness>("job-readiness")
    const tracks = request.data?.tracks ?? []
    const track = [...tracks].sort((a, b) => b.depthScore - a.depthScore)[0]
    const retry = () => {
        void request.mutate()
    }
    const common = {
        label: t("profile.evidence.job-readiness.label"),
        emptyMessage: t("jobReadiness.empty"),
        errorMessage: t("jobReadiness.error"),
        retryLabel: t("jobReadiness.retry"),
    }

    if (request.error || (!request.isLoading && !track)) {
        const failed = Boolean(request.error)
        return (
            <SurfaceCard label={common.label} composition="joined">
                <EmptyNotice message={failed ? common.errorMessage : common.emptyMessage} actionLabel={failed ? common.retryLabel : undefined} iconSource={iconSourceFor("jobs", "leading")} onAction={({ act: failed ? retry : undefined })?.act} />
            </SurfaceCard>
        )
    }

    const metrics: ReadonlyArray<JobReadinessMetric> = track ? [
        {
            id: "capstone",
            label: t("jobReadiness.metric.capstone"),
            scoreLabel: `${clamp(track.capstoneScore)}%`,
        },
        {
            id: "interview",
            label: t("jobReadiness.metric.interview"),
            scoreLabel: `${clamp(track.interviewScore)}%`,
        },
        {
            id: "cv",
            label: t("jobReadiness.metric.cv"),
            scoreLabel: `${clamp(track.cvScore)}%`,
        },
    ] : restingMetrics
    const trackBand = band(track?.band)
    const loading = request.isLoading
    const settledMetrics = loading ? restingMetrics : metrics
    const scoreLabel = loading ? undefined : `${clamp(track?.depthScore)}%`
    const trackLabel = loading ? undefined : track?.courseTitle
    const codingPercentile = request.data?.foundation?.codingPercentile
    const evidenceMessage = codingPercentile !== undefined && codingPercentile > 0
        ? t("jobReadiness.foundationPercentile", { percent: codingPercentile })
        : t("jobReadiness.evidencePending")
    return (
        <SurfaceCard label={common.label} composition="single" state={loading ? "pending" : "neutral"}>
            <div className={profileReadinessCardClassName}>
                <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{evidenceMessage}</Text>
                <div className={profileReadinessSummaryClassName}>
                    <div className={profileReadinessTrackClassName}>
                        <Badge isSkeleton={loading}>{scoreLabel}</Badge>
                        <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{trackLabel}</Text>
                    </div>
                    <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{loading ? undefined : t(`jobReadiness.band.${trackBand}`)}</Text>
                </div>
                <SurfaceListCard label={common.label} labelHidden={true} depth={"nested"} isLoading={loading}>
                    <div className={profileReadinessListClassName}>
                        {settledMetrics.map((metric) => <EvidenceRow
                            key={metric.id}
                            props={{ title: metric.label, fact: metric.scoreLabel }}
                            isLoading={loading}
                        />)}
                    </div>
                </SurfaceListCard>
            </div>
        </SurfaceCard>
    )
}
