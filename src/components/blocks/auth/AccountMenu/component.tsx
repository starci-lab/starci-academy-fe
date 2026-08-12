import { Icon } from "@/components/leaves/Icon"
import { DropdownShell } from "@/components/shells/DropdownShell"

/** Resolved account copy owned by the account-menu block. */
export type AccountMenuData = {
    readonly label: string
    readonly guestMessage: string
    readonly signInLabel: string
    readonly signUpLabel: string
}

/** Authentication choices reported by the account-menu block. */
export type AccountMenuActions = {
    readonly signIn?: () => void
    readonly signUp?: () => void
}

/** Props for the pure account-menu block half. */
export type AccountMenuProps = {
    readonly props: AccountMenuData
    readonly on?: AccountMenuActions
}

/**
 * BLOCK - the guest account sentence and the journeys it offers.
 *
 * DropdownShell owns only vendor mechanics. This block decides that a guest first sees an account
 * summary, then chooses sign in or sign up; that decision is product behavior, not a leaf shape.
 */
export const _AccountMenu = (input: AccountMenuProps) => (
    <DropdownShell
        props={{
            label: input.props.label,
            sections: [
                {
                    items: [{
                        id: "guest-summary",
                        label: input.props.guestMessage,
                        icon: "account",
                        isDisabled: true,
                    }],
                },
                {
                    items: [
                        { id: "sign-in", label: input.props.signInLabel, icon: "signIn" },
                        { id: "sign-up", label: input.props.signUpLabel, icon: "signUp" },
                    ],
                },
            ],
        }}
        on={{
            action: (id) => {
                if (id === "sign-in") input.on?.signIn?.()
                if (id === "sign-up") input.on?.signUp?.()
            },
        }}
        trigger={<Icon props={{ name: "account", role: "leading" }} />}
    />
)

/** Source-level tier marker for the pure account-menu block half. */
export const meta = { shape: "block", world: "pure", domain: "auth" } as const
