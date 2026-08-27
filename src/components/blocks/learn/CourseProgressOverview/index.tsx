import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { Text } from "@/components/leaves/Text"
import {
    courseProgressOverviewClassName,
    courseProgressSupportClassName,
    supportFactClassName,
} from "./classNames"

/** Copy known before the course evidence settles. */
export type CourseProgressOverviewFrame = {
    readonly label: string
    readonly completionLabel: string
}

/** The coordinated whole-course evidence shown after completion resolves. */
export type CourseProgressOverviewEvidence = {
    readonly completionFact: string
    readonly completionValue: number
    readonly continuityLabel: string
    readonly continuityFact: string
    readonly standingLabel: string
    readonly standingFact: string
}

/** Props for the accepted coordinated progress-summary anatomy. */
type CourseProgressOverviewStateProps =
    | { readonly state: "pending"; readonly props: CourseProgressOverviewFrame }
    | { readonly state: "empty"; readonly props: CourseProgressOverviewFrame & { readonly message: string } }
    | { readonly state: "failed"; readonly props: CourseProgressOverviewFrame & { readonly message: string; readonly retryLabel: string } }
    | { readonly state: "ready" | "partial"; readonly props: CourseProgressOverviewFrame & CourseProgressOverviewEvidence }

/** Recovery reported by the progress region. */
export type CourseProgressOverviewActions = {
    readonly retry?: () => void
}

/** Complete progress-overview state and actions. */
export type CourseProgressOverviewProps = CourseProgressOverviewStateProps & {
    readonly on?: CourseProgressOverviewActions
}

type SupportFactProps = { readonly label?: string; readonly fact?: string; readonly isLoading: boolean }

/** Draw one supporting label and muted fact. */
const SupportFact = (props: SupportFactProps) => <div className={supportFactClassName}>
    <Text props={{ content: props.label, size: "sm", weight: "semibold" }} isLoading={props.isLoading} />
    <Text props={{ content: props.fact, size: "xs", tone: "muted" }} isLoading={props.isLoading} />
</div>

/** Draw completion first, with continuity and standing as coordinated supporting evidence. */
export const CourseProgressOverview = (props: CourseProgressOverviewProps) => {
    if (props.state === "failed" || props.state === "empty") {
        return (
            <SurfaceCard props={{ label: props.props.label }}>
                <EmptyNotice
                    props={{
                        icon: "course",
                        message: props.props.message,
                        ...(props.state === "failed" ? { actionLabel: props.props.retryLabel } : {}),
                    }}
                    on={{ act: props.on?.retry }}
                />
            </SurfaceCard>
        )
    }

    const isLoading = props.state === "pending"
    const evidence = props.state === "pending" ? undefined : props.props
    return (
        <SurfaceCard props={{ label: props.props.label }} isLoading={isLoading}>
            <div className={courseProgressOverviewClassName}>
                <LabelledProgressRow
                    props={{
                        id: "course-completion",
                        title: props.props.completionLabel,
                        percent: evidence?.completionValue,
                        percentText: evidence?.completionFact,
                    }}
                    isLoading={isLoading}
                />
                <div className={courseProgressSupportClassName}>
                    <SupportFact label={evidence?.continuityLabel} fact={evidence?.continuityFact} isLoading={isLoading} />
                    <SupportFact label={evidence?.standingLabel} fact={evidence?.standingFact} isLoading={isLoading} />
                </div>
            </div>
        </SurfaceCard>
    )
}
