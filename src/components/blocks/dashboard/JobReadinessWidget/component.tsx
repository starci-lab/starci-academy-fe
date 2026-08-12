import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { Button } from "@/components/leaves/Button"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type LeafProps,
} from "@/components/contracts/props"

/** Readiness band already resolved by product policy. */
export type JobReadinessBand = "needsWork" | "building" | "jobReady"

/** One independently meaningful readiness pillar. */
export type JobReadinessMetric = {
    readonly id: string
    readonly label: string
    readonly score?: number
    readonly scoreLabel?: string
}

/** Resolved copy and metrics drawn by the readiness block. */
export type JobReadinessWidgetData = {
    readonly label: string
    readonly emptyMessage: string
    readonly errorMessage: string
    readonly retryLabel: string
    readonly courseTitle?: string
    readonly depthScore?: number
    readonly depthScoreLabel?: string
    readonly band?: JobReadinessBand
    readonly bandLabel?: string
    readonly percentileLabel?: string
    readonly metrics?: ReadonlyArray<JobReadinessMetric>
    readonly actionLabel?: string
}

/** Product outcomes reported by the readiness block. */
export type JobReadinessWidgetActions = {
    readonly act?: () => void
    readonly retry?: () => void
}

/** State, data and actions accepted by the pure readiness block. */
export type JobReadinessWidgetProps = {
    readonly state: "pending" | "empty" | "failed" | "ready"
    readonly props: JobReadinessWidgetData
    readonly on?: JobReadinessWidgetActions
}

/** Three legacy pillars keep the resting card at the same cardinality as the loaded card. */
const RESTING_METRICS: ReadonlyArray<JobReadinessMetric> = Array.from(
    { length: 3 },
    (_unused, index) => ({ id: `resting-${index + 1}`, label: "" }),
)

type JobReadinessListData = SurfaceListCardData & {
    readonly metrics: ReadonlyArray<JobReadinessMetric>
}

/** Render only the peer pillars; the enclosing readiness card owns summary and action. */
const JobReadinessListContent = ({ props, isLoading = false }: LeafProps<JobReadinessListData>) => {
    return (
        <Tree contract="job-readiness-list" render={defineContractComponent("job-readiness-list", {
            row: props.metrics.map((metric) => defineCompositeComponent("labelled-progress-row", {}, () => (
                <LabelledProgressRow
                    props={{ id: metric.id, title: metric.label, percent: metric.score, percentText: metric.scoreLabel }}
                    isLoading={isLoading}
                />
            ))),
        })} />
    )
}

const JobReadinessList = defineContractComponent("job-readiness-list", JobReadinessListContent)

/** Draw the learner's strongest-track readiness without owning routing or fetching. */
export const _JobReadinessWidget = (input: JobReadinessWidgetProps) => {
    if (input.state === "failed" || input.state === "empty") {
        const failed = input.state === "failed"
        return (
            <SurfaceCard
                props={{ label: input.props.label }}
                contract="empty-notice-card"
                render={defineContractComponent("empty-notice-card", {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{
                                icon: "jobs",
                                message: failed ? input.props.errorMessage : input.props.emptyMessage,
                                actionLabel: failed ? input.props.retryLabel : input.props.actionLabel,
                            }}
                            on={{ act: failed ? input.on?.retry : input.on?.act }}
                        />
                    )),
                })}
            />
        )
    }

    const isLoading = input.state === "pending"
    const metrics = input.state === "ready" ? (input.props.metrics ?? []) : RESTING_METRICS
    const headline = input.props.depthScoreLabel ?? (
        input.props.depthScore === undefined ? input.props.courseTitle : `${input.props.depthScore} · ${input.props.courseTitle ?? ""}`
    )

    const metricsList = defineContractProjection("job-readiness-list", () => (
        <SurfaceListCard
            contract="job-readiness-list"
            render={JobReadinessList}
            props={{
                label: headline ?? "",
                fact: input.props.bandLabel,
                metrics,
                isNested: true,
            }}
            isLoading={isLoading}
        />
    ))

    return (
        <SurfaceCard
            props={{ label: input.props.label }}
            contract="job-readiness-card"
            isLoading={isLoading}
            render={defineContractComponent("job-readiness-card", {
                ...(input.props.percentileLabel === undefined && !isLoading ? {} : {
                    percentile: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: input.props.percentileLabel, size: "xs", tone: "muted" }} isLoading={isLoading} />
                    )),
                }),
                metrics: metricsList,
                ...(input.props.actionLabel === undefined && !isLoading ? {} : {
                    action: defineLeafComponent("button", {}, () => (
                        <Button
                            props={{ label: input.props.actionLabel ?? "", size: "sm", variant: "primary" }}
                            on={{ press: input.on?.act }}
                            isLoading={isLoading}
                        />
                    )),
                }),
            })}
        />
    )
}

/** Source-level tier marker for the pure dashboard block. */
export const meta = { world: "pure", domain: "dashboard" } as const
