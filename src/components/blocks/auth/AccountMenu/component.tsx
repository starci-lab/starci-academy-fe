import { Avatar } from "@/components/leaves/Avatar"
import { Icon, type IconName } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
import { DropdownBranch } from "@/components/branches/DropdownBranch"

type AccountMenuFrame = {
    readonly label: string
}

type GuestAccountMenuData = AccountMenuFrame & {
    readonly guestMessage: string
    readonly signInLabel: string
    readonly signUpLabel: string
}

/** One signed-in account journey shown as an actionable ListBox row. */
export type AccountMenuDestination = {
    readonly id: "dashboard" | "profile" | "cv"
    readonly label: string
    readonly icon: IconName
    readonly isDisabled?: boolean
}

type SignedInAccountMenuData = AccountMenuFrame & {
    readonly displayName: string
    readonly email: string
    readonly avatar?: string
    readonly destinations: ReadonlyArray<AccountMenuDestination>
    readonly signOutLabel: string
    readonly isIdentityLoading?: boolean
    readonly isSigningOut?: boolean
}

/** Resolved guest or signed-in account content rendered by the pure block. */
export type AccountMenuData = GuestAccountMenuData | SignedInAccountMenuData

/** Account journeys reported to the connected owner. */
export type AccountMenuActions = {
    readonly signIn?: () => void
    readonly signUp?: () => void
    readonly navigate?: (id: AccountMenuDestination["id"]) => void
    readonly signOut?: () => void
}

/** The exhaustive guest or signed-in view state accepted by the pure account block. */
export type AccountMenuProps =
    | { readonly state: "guest"; readonly props: GuestAccountMenuData; readonly on?: AccountMenuActions }
    | { readonly state: "signedIn"; readonly props: SignedInAccountMenuData; readonly on?: AccountMenuActions }

/**
 * BLOCK - the current account identity and the journeys it offers.
 *
 * DropdownBranch owns only vendor mechanics. This block decides that a guest first sees an account
 * summary, then chooses sign in or sign up; that decision is product behavior, not a leaf shape.
 */
export const AccountMenuBase = (props: AccountMenuProps) => (
    <DropdownBranch
        props={{
            label: props.props.label,
            sections: props.state === "guest"
                ? [{ items: [
                    { id: "sign-in", label: props.props.signInLabel, icon: "signIn" },
                    { id: "sign-up", label: props.props.signUpLabel, icon: "signUp" },
                ] }]
                : [
                    { items: props.props.destinations },
                    { items: [{
                        id: "sign-out",
                        label: props.props.signOutLabel,
                        icon: "signOut",
                        tone: "danger",
                        isDisabled: props.props.isSigningOut,
                    }] },
                ],
        }}
        on={{
            action: (id) => {
                if (id === "sign-in") props.on?.signIn?.()
                if (id === "sign-up") props.on?.signUp?.()
                if (id === "dashboard" || id === "profile" || id === "cv") props.on?.navigate?.(id)
                if (id === "sign-out") props.on?.signOut?.()
            },
        }}
        trigger={props.state === "guest" ? <Icon props={{ name: "account", role: "leading" }} /> : (
            <Avatar props={{ name: props.props.displayName, src: props.props.avatar, size: "sm" }} isLoading={props.props.isIdentityLoading} />
        )}
        header={props.state === "guest" ? (
            <Text
                props={{ content: props.props.guestMessage, icon: "account", size: "sm", tone: "muted" }}
            />
        ) : (
            <div>
                <Avatar props={{ name: props.props.displayName, src: props.props.avatar, size: "sm" }} isLoading={props.props.isIdentityLoading} />
                <Text props={{ content: props.props.displayName, size: "sm", weight: "semibold" }} isLoading={props.props.isIdentityLoading} />
                <Text props={{ content: props.props.email, size: "xs", tone: "muted" }} isLoading={props.props.isIdentityLoading} />
            </div>
        )}
    />
)
