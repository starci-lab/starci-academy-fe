import { SurfaceCard } from "@starci/grammar/common"
import { EmptyNotice } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { courseLearningSignalDetailClassName } from "./classNames"
import { Icon, TextAction } from "@starci/grammar/common"


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
    const detail = props.state === "pending" ? undefined : props.props
    return (
        <SurfaceCard label={props.props.label} composition="joined" state={isLoading ? "pending" : "neutral"}>
            <div className={courseLearningSignalDetailClassName}>
                <Heading level={3} isSkeleton={isLoading}>{detail?.title}</Heading>
                <Text size={"sm"} weight={"medium"} isSkeleton={isLoading}>{detail?.fact}</Text>
                <Text size={"sm"} tone={"muted"} isSkeleton={isLoading}>{detail?.caption}</Text>
                {isLoading ? null : (
                    <TextAction appearance="disclosure" onPress={props.on?.open} endContent={<Icon source={iconSourceFor("next", "chip")} usage="chip" />}>{detail?.actionLabel ?? ""}</TextAction>
                )}
            </div>
        </SurfaceCard>
    )
}
