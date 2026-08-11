import { Dropdown } from "@heroui/react"
import { Icon } from "@/components/leaves/Icon"
import { IconButton } from "@/components/leaves/IconButton"
import type { LeafProps } from "@/components/contracts/props"

/** Copy drawn by the signed-out navbar account dropdown. */
export type AccountMenuData = {
    readonly label: string
    readonly guestMessage: string
    readonly signInLabel: string
    readonly signUpLabel: string
}

/** Authentication choices reported by the account dropdown. */
export type AccountMenuActions = {
    readonly signIn?: () => void
    readonly signUp?: () => void
}

/** Props for {@link AccountMenu}. */
export type AccountMenuProps = LeafProps<AccountMenuData, AccountMenuActions>

/**
 * Draw the account trigger and its guest choices as one HeroUI dropdown.
 *
 * @param input - {@link AccountMenuProps}
 */
export const AccountMenu = ({ props, on }: AccountMenuProps) => (
    <Dropdown>
        <IconButton props={{ icon: "account", label: props.label }} />
        <Dropdown.Popover placement="bottom right">
            <Dropdown.Menu aria-label={props.label}>
                <Dropdown.Section>
                    <Dropdown.Item id="guest-summary" isDisabled textValue={props.guestMessage}>
                        <Icon props={{ name: "account", role: "leading" }} />
                        {props.guestMessage}
                    </Dropdown.Item>
                </Dropdown.Section>
                <Dropdown.Section>
                    <Dropdown.Item id="sign-in" textValue={props.signInLabel} onAction={on?.signIn}>
                        <Icon props={{ name: "signIn", role: "leading" }} />
                        {props.signInLabel}
                    </Dropdown.Item>
                    <Dropdown.Item id="sign-up" textValue={props.signUpLabel} onAction={on?.signUp}>
                        <Icon props={{ name: "signUp", role: "leading" }} />
                        {props.signUpLabel}
                    </Dropdown.Item>
                </Dropdown.Section>
            </Dropdown.Menu>
        </Dropdown.Popover>
    </Dropdown>
)

/** Source-level tier marker for the account dropdown leaf. */
export const meta = { shape: "leaf", world: "pure" } as const
