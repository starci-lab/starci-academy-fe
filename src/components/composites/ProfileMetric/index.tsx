import { Tree } from "@/components/branches/Tree"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "@/components/contracts/props"

/** One public coding-standing figure and its qualifier. */
export type ProfileMetricData = { readonly value?: string, readonly label?: string }
/** Settled input for one profile metric. */
export type ProfileMetricProps = CompositeProps<ProfileMetricData>

/** Draw one fixed metric sentence. */
export const ProfileMetric = ({ props, isLoading = false }: ProfileMetricProps) => (
    <Tree contract="profile-proof-metric" render={defineContractComponent("profile-proof-metric", {
        figure: defineLeafComponent("text", {}, () => <Text props={{ content: props.value, weight: "semibold" }} isLoading={isLoading} />),
        label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.label, size: "xs", tone: "muted" }} isLoading={isLoading} />),
    })} />
)

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
