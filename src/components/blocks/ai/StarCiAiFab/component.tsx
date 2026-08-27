import { Badge } from "@/components/leaves/Badge"
import { StarCiAiMark } from "@/components/leaves/StarCiAiMark"
import { Text } from "@/components/leaves/Text"

/** Closed semantic data for the one global AI trigger. */
export type StarCiAiFabData = {
    readonly label: string
    readonly isOpen: boolean
    readonly hasUnread?: boolean
}

/** The one action emitted by the persistent StarCi AI entry. */
export type StarCiAiFabActions = {
    readonly press?: () => void
}

/** Props for the product-branded global AI trigger. */
export type StarCiAiFabProps = {
    readonly props: StarCiAiFabData
    readonly on?: StarCiAiFabActions
    readonly isLoading?: boolean
}

/** Draw the purpose-named StarCi AI entry and return focus to the same semantic control. */
export const StarCiAiFab = (props: StarCiAiFabProps) => (
    <button
        type="button"
        aria-label={props.props.label}
        aria-expanded={props.props.isOpen}
        data-unread={props.props.hasUnread === true ? "true" : "false"}
        style={{ position: "fixed", right: 16, bottom: 16, zIndex: 50 }}
        onClick={props.on?.press}
    >
        <StarCiAiMark props={{}} isLoading={props.isLoading} />
        <Text props={{ content: props.props.label, size: "sm", weight: "semibold" }} isLoading={props.isLoading} />
        {props.props.hasUnread === true ? <Badge props={{ content: "1", tone: "accent" }} /> : null}
    </button>
)
