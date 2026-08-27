import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Heading } from "@/components/leaves/Heading"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import { Text } from "@/components/leaves/Text"
import { courseLearningSignalDetailClassName } from "./classNames"

/** The selected signal and the evidence explaining its consequence. */
export type CourseLearningSignalDetailData = {
    readonly label: string
    readonly title: string
    readonly fact: string
    readonly caption: string
    readonly actionLabel: string
}

/** Props for the accepted contextual signal-detail anatomy. */
type CourseLearningSignalDetailStateProps =
    | { readonly state: "pending"; readonly props: { readonly label: string } }
    | { readonly state: "empty"; readonly props: { readonly label: string; readonly message: string } }
    | { readonly state: "failed"; readonly props: { readonly label: string; readonly message: string; readonly retryLabel: string } }
    | { readonly state: "ready"; readonly props: CourseLearningSignalDetailData }

/** Actions reported by the contextual detail. */
export type CourseLearningSignalDetailActions = {
    readonly open?: () => void
    readonly retry?: () => void
}

/** Complete signal-detail state and actions. */
export type CourseLearningSignalDetailProps = CourseLearningSignalDetailStateProps & {
    readonly on?: CourseLearningSignalDetailActions
}

/** Explain the selected signal without replacing the dashboard page owner. */
export const CourseLearningSignalDetail = (props: CourseLearningSignalDetailProps) => {
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
    const detail = props.state === "pending" ? undefined : props.props
    return (
        <SurfaceCard props={{ label: props.props.label }} isLoading={isLoading}>
            <div className={courseLearningSignalDetailClassName}>
                <Heading props={{ content: detail?.title, level: 3 }} isLoading={isLoading} />
                <Text props={{ content: detail?.fact, size: "sm", weight: "medium" }} isLoading={isLoading} />
                <Text props={{ content: detail?.caption, size: "sm", tone: "muted" }} isLoading={isLoading} />
                {isLoading ? null : (
                    <SeeMoreLink props={{ label: detail?.actionLabel ?? "" }} on={{ press: props.on?.open }} />
                )}
            </div>
        </SurfaceCard>
    )
}
