import { Switch } from "@heroui/react"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"

/** Current appearance and accessible copy for the navbar switch. */
export type ThemeSwitchData = {
    readonly isDark: boolean
    readonly label: string
}

/** What changing the appearance switch reports. */
export type ThemeSwitchActions = {
    readonly change?: (isDark: boolean) => void
}

/** Fixed props for the light/dark switch. */
export type ThemeSwitchProps = { readonly props: ThemeSwitchData; readonly on?: ThemeSwitchActions; readonly isLoading?: boolean }

/** Draw the same native HeroUI switch used by the legacy navbar. */
export const ThemeSwitch = (props: ThemeSwitchProps) => {
    const data = props.props
    const on = props.on
    return (
        <Switch
            isSelected={data.isDark}
            onChange={on?.change}
            aria-label={data.label}
        >
            {({ isSelected }) => (
                <Switch.Content>
                    <Switch.Control>
                        <Switch.Thumb>
                            <Switch.Icon>
                                <Icon source={iconSourceFor(isSelected ? "dark" : "light", "leading")} role={"leading"} />
                            </Switch.Icon>
                        </Switch.Thumb>
                    </Switch.Control>
                </Switch.Content>
            )}
        </Switch>
    )
}
