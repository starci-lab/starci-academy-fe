import { Badge } from "@/components/leaves/Badge"
import { StarCiAiMark } from "@/components/leaves/StarCiAiMark"
import { Text } from "@/components/leaves/Text"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

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
export const StarCiAiFab = (input: StarCiAiFabProps) => (
    <button
        type="button"
        aria-label={input.props.label}
        aria-expanded={input.props.isOpen}
        data-tier="block"
        data-component="StarCiAiFab"
        data-unread={input.props.hasUnread === true ? "true" : "false"}
        style={{ position: "fixed", right: 16, bottom: 16, zIndex: 50 }}
        onClick={input.on?.press}
    >
        <Tree
            contract="floating-ai-trigger"
            render={defineContractComponent("floating-ai-trigger", {
                mark: defineLeafComponent("starci-ai-mark", {}, () => (
                    <StarCiAiMark props={{}} isLoading={input.isLoading} />
                )),
                label: defineLeafComponent("text", {}, () => (
                    <Text props={{ content: input.props.label, size: "sm", weight: "semibold" }} isLoading={input.isLoading} />
                )),
                badge: input.props.hasUnread === true
                    ? defineLeafComponent("badge", {}, () => <Badge props={{ content: "1", tone: "accent" }} />)
                    : undefined,
            })}
        />
    </button>
)

/** Source-level ownership marker. */
export const meta = { shape: "block", world: "pure", domain: "ai" } as const
