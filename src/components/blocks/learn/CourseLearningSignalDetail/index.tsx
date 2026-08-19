import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Heading } from "@/components/leaves/Heading"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
} from "@/components/contracts/props"

/** The selected signal and the evidence explaining its consequence. */
export type CourseLearningSignalDetailData = {
    readonly label: string
    readonly title: string
    readonly fact: string
    readonly caption: string
    readonly actionLabel: string
}

/** Props for the accepted contextual signal-detail anatomy. */
export type CourseLearningSignalDetailProps =
    | { readonly state: "pending"; readonly props: { readonly label: string } }
    | { readonly state: "empty"; readonly props: { readonly label: string; readonly message: string } }
    | { readonly state: "failed"; readonly props: { readonly label: string; readonly message: string; readonly retryLabel: string } }
    | { readonly state: "ready"; readonly props: CourseLearningSignalDetailData }

/** Actions reported by the contextual detail. */
export type CourseLearningSignalDetailActions = {
    readonly open?: () => void
    readonly retry?: () => void
}

type CourseLearningSignalDetailInput = CourseLearningSignalDetailProps & { readonly on?: CourseLearningSignalDetailActions }

/** Explain the selected signal without replacing the dashboard page owner. */
export const CourseLearningSignalDetail = (input: CourseLearningSignalDetailInput) => {
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
    const detail = input.state === "pending" ? undefined : input.props
    return (
        <SurfaceCard
            props={{ label: input.props.label }}
            contract="course-learning-signal-detail-stack"
            isLoading={isLoading}
            render={defineContractComponent("course-learning-signal-detail-stack", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: detail?.title, level: 3 }} isLoading={isLoading} />
                )),
                fact: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                    <Text props={{ content: detail?.fact, size: "sm", weight: "medium" }} isLoading={isLoading} />
                )),
                caption: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: detail?.caption, size: "sm", tone: "muted" }} isLoading={isLoading} />
                )),
                action: isLoading ? undefined : defineLeafComponent("see-more-link", {}, () => (
                    <SeeMoreLink props={{ label: detail?.actionLabel ?? "" }} on={{ press: input.on?.open }} />
                )),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
