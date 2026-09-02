import { SurfaceCard } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { Button } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import {
    readinessCardClassName,
    readinessFooterClassName,
    readinessHeadlineClassName,
    readinessMetricsClassName,
    readinessSeparatorClassName,
} from "./classNames"
/** Readiness band. */
export type JobReadinessBand = "needsWork" | "building" | "jobReady"
/** One readiness pillar. */
export type JobReadinessMetric = { readonly id: string; readonly label: string; readonly score?: number; readonly scoreLabel?: string }
/** Resolved readiness content. */
export type JobReadinessWidgetData = { readonly label: string; readonly emptyMessage: string; readonly errorMessage: string; readonly retryLabel: string; readonly courseTitle?: string; readonly depthScore?: number; readonly depthScoreLabel?: string; readonly band?: JobReadinessBand; readonly bandLabel?: string; readonly percentileLabel?: string; readonly metrics?: ReadonlyArray<JobReadinessMetric>; readonly actionLabel?: string }
/** Readiness actions. */
export type JobReadinessWidgetActions = { readonly act?: () => void; readonly retry?: () => void }
/** Traditional readiness widget props. */
export type JobReadinessWidgetProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: JobReadinessWidgetData; readonly on?: JobReadinessWidgetActions }
/** Draw learner job readiness and its metrics. */
export const JobReadinessWidgetBase = (props: JobReadinessWidgetProps) => {
    if (props.state === "empty" || props.state === "failed") return (
        <SurfaceCard label={props.props.label} composition={"single"}>
            <EmptyNotice message={props.state === "failed" ? props.props.errorMessage : props.props.emptyMessage} actionLabel={props.state === "failed" ? props.props.retryLabel : props.props.actionLabel} iconSource={iconSourceFor("jobs", "leading")} onAction={({ act: props.state === "failed" ? props.on?.retry : props.on?.act })?.act} />
        </SurfaceCard>
    )

    const loading = props.state === "pending"
    const metrics = props.props.metrics ?? []
    const headline = props.props.depthScoreLabel ?? (props.props.depthScore === undefined
        ? props.props.courseTitle
        : `${props.props.depthScore} · ${props.props.courseTitle ?? ""}`)
    const action = props.props.actionLabel === undefined
        ? null
        : (
            <div className={readinessFooterClassName}>
                <Button variant={"secondary"} size={"sm"} isSkeleton={loading} onPress={({ press: props.on?.act })?.press}>{props.props.actionLabel}</Button>
            </div>
        )

    return (
        <SurfaceCard label={props.props.label} height={"fill"} composition={"joined"} state={loading ? "pending" : "neutral"}>
            <div className={readinessCardClassName} data-part="readiness-body">
                <div className={readinessHeadlineClassName} data-part="readiness-headline">
                    <Text size={"sm"} weight={"semibold"} isSkeleton={loading}>{headline}</Text>
                    <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{props.props.bandLabel}</Text>
                </div>
                <div aria-hidden className={readinessSeparatorClassName} />
                <div className={readinessMetricsClassName} data-part="readiness-metrics">
                    {metrics.map((metric) => (
                        <LabelledProgressRow
                            key={metric.id}
                            props={{ id: metric.id, title: metric.label, percent: metric.score, percentText: metric.scoreLabel }}
                            titleWeight="normal"
                            isLoading={loading}
                        />
                    ))}
                </div>
                {action === null ? null : (
                    <>
                        <div aria-hidden className={readinessSeparatorClassName} />
                        {action}
                    </>
                )}
            </div>
        </SurfaceCard>
    )
}
