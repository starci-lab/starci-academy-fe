import { Text } from "@/components/leaves/Text"

/** Resolved caption for one distribution segment. */
export type ProfileSegmentData = { readonly label?: string }
/** Settled input for one profile segment. */
export type ProfileSegmentProps = { readonly props: ProfileSegmentData; readonly isLoading?: boolean }

/** Draw one share inside a joined distribution run. */
export const ProfileSegment = (props: ProfileSegmentProps) => {
    const data = props.props
    const isLoading = props.isLoading ?? false
    return <Text props={{ content: data.label, size: "xs", tone: "muted" }} isLoading={isLoading} />
}
