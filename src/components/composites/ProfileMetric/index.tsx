import { Text } from "@/components/leaves/Text"
import { profileProofMetricClassName } from "./classNames"

/** One public coding-standing figure and its qualifier. */
export type ProfileMetricData = { readonly value?: string, readonly label?: string }
/** Settled input for one profile metric. */
export type ProfileMetricProps = { readonly props: ProfileMetricData; readonly isLoading?: boolean }

/** Draw one fixed metric sentence. */
export const ProfileMetric = (props: ProfileMetricProps) => {
    const data = props.props
    const isLoading = props.isLoading ?? false
    return <div className={profileProofMetricClassName}><Text props={{ content: data.value, weight: "semibold" }} isLoading={isLoading} /><Text props={{ content: data.label, size: "xs", tone: "muted" }} isLoading={isLoading} /></div>
}
