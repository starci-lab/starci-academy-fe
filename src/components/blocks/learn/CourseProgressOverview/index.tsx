import { SurfaceCard } from "@starci/grammar/common"
import { EmptyNotice } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { Text } from "@starci/grammar/common"
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
    <Text size={"sm"} weight={"semibold"} isSkeleton={props.isLoading}>{props.label}</Text>
    <Text size={"xs"} tone={"muted"} isSkeleton={props.isLoading}>{props.fact}</Text>
</div>

/** Draw completion first, with continuity and standing as coordinated supporting evidence. */
export const CourseProgressOverview = (props: CourseProgressOverviewProps) => {
    if (props.state === "failed" || props.state === "empty") {
        return (
            <SurfaceCard label={props.props.label} composition="joined">
                <EmptyNotice
                    iconSource={iconSourceFor("course", "leading")}
                    message={props.props.message}
                    actionLabel={props.state === "failed" ? props.props.retryLabel : undefined}
                    onAction={props.on?.retry}
                />
            </SurfaceCard>
        )
    }

    const isLoading = props.state === "pending"
    const evidence = props.state === "pending" ? undefined : props.props
    return (
        <SurfaceCard label={props.props.label} composition="joined" state={isLoading ? "pending" : "neutral"}>
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
