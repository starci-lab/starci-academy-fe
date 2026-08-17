import { Avatar } from "@/components/leaves/Avatar"
import { Icon, type IconName } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
import { DropdownBranch } from "@/components/branches/DropdownBranch"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

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
export type AccountMenuViewProps =
    | { readonly state: "guest"; readonly props: GuestAccountMenuData; readonly on?: AccountMenuActions }
    | { readonly state: "signedIn"; readonly props: SignedInAccountMenuData; readonly on?: AccountMenuActions }

/**
 * BLOCK - the current account identity and the journeys it offers.
 *
 * DropdownBranch owns only vendor mechanics. This block decides that a guest first sees an account
 * summary, then chooses sign in or sign up; that decision is product behavior, not a leaf shape.
 */
export const _AccountMenu = (input: AccountMenuViewProps) => (
    <DropdownBranch
        props={{
            label: input.props.label,
            sections: input.state === "guest"
                ? [{ items: [
                    { id: "sign-in", label: input.props.signInLabel, icon: "signIn" },
                    { id: "sign-up", label: input.props.signUpLabel, icon: "signUp" },
                ] }]
                : [
                    { items: input.props.destinations },
                    { items: [{
                        id: "sign-out",
                        label: input.props.signOutLabel,
                        icon: "signOut",
                        tone: "danger",
                        isDisabled: input.props.isSigningOut,
                    }] },
                ],
        }}
        on={{
            action: (id) => {
                if (id === "sign-in") input.on?.signIn?.()
                if (id === "sign-up") input.on?.signUp?.()
                if (id === "dashboard" || id === "profile" || id === "cv") input.on?.navigate?.(id)
                if (id === "sign-out") input.on?.signOut?.()
            },
        }}
        trigger={input.state === "guest"
            ? defineLeafComponent("icon", {}, () => (
                <Icon props={{ name: "account", role: "leading" }} />
            ))
            : defineLeafComponent("avatar", {}, () => (
                <Avatar
                    props={{ name: input.props.displayName, src: input.props.avatar, size: "sm" }}
                    isLoading={input.props.isIdentityLoading}
                />
            ))}
        header={input.state === "guest"
            ? defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text
                    props={{ content: input.props.guestMessage, icon: "account", size: "sm", tone: "muted" }}
                />
            ))
            : defineContractComponent("profile-avatar-name-handle-disclosure-row", {
                avatar: defineLeafComponent("avatar", {}, () => (
                    <Avatar
                        props={{ name: input.props.displayName, src: input.props.avatar, size: "sm" }}
                        isLoading={input.props.isIdentityLoading}
                    />
                )),
                identity: defineContractComponent("profile-name-over-handle", {
                    name: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                        <Text
                            props={{ content: input.props.displayName, size: "sm", weight: "semibold" }}
                            isLoading={input.props.isIdentityLoading}
                        />
                    )),
                    handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text
                            props={{ content: input.props.email, size: "xs", tone: "muted" }}
                            isLoading={input.props.isIdentityLoading}
                        />
                    )),
                }),
            })}
    />
)

/** Source-level tier marker for the pure account-menu block half. */
export const meta = { shape: "block", world: "pure", domain: "auth" } as const
