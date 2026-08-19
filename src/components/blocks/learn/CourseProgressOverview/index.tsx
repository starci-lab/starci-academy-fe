import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"

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
export type CourseProgressOverviewProps =
    | { readonly state: "pending"; readonly props: CourseProgressOverviewFrame }
    | { readonly state: "empty"; readonly props: CourseProgressOverviewFrame & { readonly message: string } }
    | { readonly state: "failed"; readonly props: CourseProgressOverviewFrame & { readonly message: string; readonly retryLabel: string } }
    | { readonly state: "ready" | "partial"; readonly props: CourseProgressOverviewFrame & CourseProgressOverviewEvidence }

/** Recovery reported by the progress region. */
export type CourseProgressOverviewActions = {
    readonly retry?: () => void
}

type CourseProgressOverviewInput = CourseProgressOverviewProps & { readonly on?: CourseProgressOverviewActions }

const supportFact = (label: string | undefined, fact: string | undefined, isLoading: boolean) =>
    defineContractComponent("label-with-muted-fact-row", {
        label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
            <Text props={{ content: label, size: "sm", weight: "semibold" }} isLoading={isLoading} />
        )),
        fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ content: fact, size: "xs", tone: "muted" }} isLoading={isLoading} />
        )),
    })

/** Draw completion first, with continuity and standing as coordinated supporting evidence. */
export const CourseProgressOverview = (input: CourseProgressOverviewInput) => {
    if (input.state === "failed" || input.state === "empty") {
        return (
            <SurfaceCard
                props={{ label: input.props.label }}
                contract="empty-notice-card"
                render={defineContractComponent("empty-notice-card", {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{
                                icon: "course",
                                message: input.props.message,
                                ...(input.state === "failed" ? { actionLabel: input.props.retryLabel } : {}),
                            }}
                            on={{ act: input.on?.retry }}
                        />
                    )),
                })}
            />
        )
    }

    const isLoading = input.state === "pending"
    const evidence = input.state === "pending" ? undefined : input.props
    return (
        <SurfaceCard
            props={{ label: input.props.label }}
            contract="course-progress-overview"
            isLoading={isLoading}
            render={defineContractComponent("course-progress-overview", {
                completion: defineContractProjection("label-fact-over-progress", () => (
                    <LabelledProgressRow
                        props={{
                            id: "course-completion",
                            title: input.props.completionLabel,
                            percent: evidence?.completionValue,
                            percentText: evidence?.completionFact,
                        }}
                        isLoading={isLoading}
                    />
                )),
                support: defineContractComponent("course-progress-support-facts", {
                    continuity: supportFact(evidence?.continuityLabel, evidence?.continuityFact, isLoading),
                    standing: supportFact(evidence?.standingLabel, evidence?.standingFact, isLoading),
                }),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
