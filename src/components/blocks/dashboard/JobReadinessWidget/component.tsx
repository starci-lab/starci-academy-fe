import { DashboardSurfaceCard as SurfaceCard } from "@/components/blocks/dashboard/DashboardSurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { Button } from "@/components/leaves/Button"
import { Text } from "@/components/leaves/Text"
import { readinessHeadlineClassName, readinessMetricsClassName } from "./classNames"
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
        <SurfaceCard props={{ label: props.props.label }}>
            <EmptyNotice
                props={{
                    icon: "jobs",
                    message: props.state === "failed" ? props.props.errorMessage : props.props.emptyMessage,
                    actionLabel: props.state === "failed" ? props.props.retryLabel : props.props.actionLabel,
                }}
                on={{ act: props.state === "failed" ? props.on?.retry : props.on?.act }}
            />
        </SurfaceCard>
    )

    const loading = props.state === "pending"
    const metrics = props.props.metrics ?? []
    const headline = props.props.depthScoreLabel ?? (props.props.depthScore === undefined
        ? props.props.courseTitle
        : `${props.props.depthScore} · ${props.props.courseTitle ?? ""}`)

    return (
        <SurfaceCard props={{ label: props.props.label }} isLoading={loading}>
            <div data-part="readiness-headline" className={readinessHeadlineClassName}>
                <Text props={{ content: headline, size: "sm", weight: "semibold" }} isLoading={loading} />
                <Text props={{ content: props.props.bandLabel, size: "xs", tone: "muted" }} isLoading={loading} />
            </div>
            {props.props.percentileLabel === undefined ? null : (
                <Text props={{ content: props.props.percentileLabel, size: "xs", tone: "muted" }} />
            )}
            <div data-part="readiness-metrics" className={readinessMetricsClassName}>
                {metrics.map((metric) => (
                    <LabelledProgressRow
                        key={metric.id}
                        props={{ id: metric.id, title: metric.label, percent: metric.score, percentText: metric.scoreLabel }}
                        isLoading={loading}
                    />
                ))}
            </div>
            {props.props.actionLabel === undefined ? null : (
                <Button props={{ label: props.props.actionLabel, size: "sm", variant: "primary" }} on={{ press: props.on?.act }} isLoading={loading} />
            )}
        </SurfaceCard>
    )
}
