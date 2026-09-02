import { Text } from "@starci/grammar/common"
import { profileProofMetricClassName } from "./classNames"

/** One public coding-standing figure and its qualifier. */
export type ProfileMetricData = { readonly value?: string, readonly label?: string }
/** Settled input for one profile metric. */
export type ProfileMetricProps = { readonly props: ProfileMetricData; readonly isLoading?: boolean }

/** Draw one fixed metric sentence. */
export const ProfileMetric = (props: ProfileMetricProps) => {
    const data = props.props
    const isLoading = props.isLoading ?? false
    return <div className={profileProofMetricClassName}><Text weight={"semibold"} isSkeleton={isLoading}>{data.value}</Text><Text size={"xs"} tone={"muted"} isSkeleton={isLoading}>{data.label}</Text></div>
}
