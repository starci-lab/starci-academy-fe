import { Input, Button } from "@starci/grammar/common"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"
import { Select } from "@/components/leaves/Select"
import { Text } from "@starci/grammar/common"
import { personalProjectGradingSettingsActionsClassName, personalProjectGradingSettingsClassName, personalProjectGradingSettingsSectionClassName } from "./classNames"

const RevealTokenIcon = () => <Icon source={iconSourceFor("revealPassword", "chip")} usage={"chip"} />
const HideTokenIcon = () => <Icon source={iconSourceFor("hidePassword", "chip")} usage={"chip"} />

/** One language or grading-model choice shown in the settings drawer. */
export type PersonalProjectGradingSettingsOption = { readonly id: string; readonly label: string; readonly disabled?: boolean }
/** Localized copy required by the pure settings renderer. */
export type PersonalProjectGradingSettingsLabels = {
    readonly language: string; readonly model: string; readonly branch: string; readonly branchPlaceholder: string
    readonly token: string; readonly tokenPlaceholder: string; readonly tokenStored: (last4: string) => string
    readonly settingsSaved: string; readonly saveSettings: string
    readonly description?: string; readonly sourceSection?: string; readonly analysisSection?: string
    readonly branchHelp?: string; readonly tokenHelp?: string; readonly privacy?: string; readonly clearToken?: string
    readonly revealToken?: string; readonly hideToken?: string
    readonly unavailableModels?: (models: string) => string
}
/** Transport and mutation conditions owned by the settings block. */
export type PersonalProjectGradingSettingsState = "ready" | "saving" | "saved" | "failed"
/** Pure settings renderer input. */
export type PersonalProjectGradingSettingsBlockProps = {
    readonly state: PersonalProjectGradingSettingsState
    readonly props: {
        readonly labels: PersonalProjectGradingSettingsLabels
        readonly languageOptions: ReadonlyArray<PersonalProjectGradingSettingsOption>
        readonly selectedLanguage?: string
        readonly modelOptions: ReadonlyArray<PersonalProjectGradingSettingsOption>
        readonly unavailableModelLabels?: ReadonlyArray<string>
        readonly selectedModel?: string
        readonly branch?: string
        readonly tokenLast4?: string
        readonly notice?: string
        readonly validationNotice?: string
        readonly saveDisabled?: boolean
    }
    readonly on?: {
        readonly selectLanguage?: (value: string) => void
        readonly selectModel?: (value: string) => void
        readonly changeBranch?: (value: string) => void
        readonly changeToken?: (value: string) => void
        readonly clearToken?: () => void
        readonly saveSettings?: () => void
    }
}

/** Pure settings drawer content; all values and actions arrive from the connected owner. */
export const PersonalProjectGradingSettingsBlockBase = (props: PersonalProjectGradingSettingsBlockProps) => {
    const disabled = props.state === "saving"
    return <div className={personalProjectGradingSettingsClassName}>
        <Text size={"sm"} tone={"muted"}>{props.props.labels.description}</Text>
        <section className={personalProjectGradingSettingsSectionClassName}>
            <Text weight={"semibold"}>{props.props.labels.sourceSection ?? props.props.labels.branch}</Text>
            <Input id="personal-project-branch" name="personal-project-branch" label={props.props.labels.branch} hint={props.props.labels.branchHelp} placeholder={props.props.labels.branchPlaceholder} value={props.props.branch} variant="secondary" isDisabled={disabled} onValueChange={props.on?.changeBranch} />
            <Input id="personal-project-token" name="personal-project-token" label={props.props.labels.token} kind="newPassword" hint={props.props.labels.tokenHelp} placeholder={props.props.labels.tokenPlaceholder} variant="secondary" isDisabled={disabled} revealLabel={props.props.labels.revealToken ?? props.props.labels.token} hideLabel={props.props.labels.hideToken ?? props.props.labels.token} revealIcon={RevealTokenIcon} hideIcon={HideTokenIcon} onValueChange={props.on?.changeToken} />
            {props.props.tokenLast4 === undefined ? null : <><Text size={"xs"} tone={"muted"}>{props.props.labels.tokenStored(props.props.tokenLast4)}</Text><Button variant="ghost" size="sm" isDisabled={disabled} onPress={props.on?.clearToken}>{props.props.labels.clearToken ?? "Remove token"}</Button></>}
            <Text size={"xs"} tone={"muted"}>{props.props.labels.privacy}</Text>
        </section>
        <section className={personalProjectGradingSettingsSectionClassName}>
            <Text weight={"semibold"}>{props.props.labels.analysisSection ?? props.props.labels.model}</Text>
            <Select props={{ id: "personal-project-language", name: "personal-project-language", label: props.props.labels.language, options: props.props.languageOptions, selectedKey: props.props.selectedLanguage, disabled }} on={{ select: props.on?.selectLanguage }} />
            <Select props={{ id: "personal-project-model", name: "personal-project-model", label: props.props.labels.model, options: props.props.modelOptions.filter((option) => option.disabled !== true), selectedKey: props.props.selectedModel, disabled }} on={{ select: props.on?.selectModel }} />
            {props.props.unavailableModelLabels === undefined || props.props.unavailableModelLabels.length === 0 ? null : <Text size={"xs"} tone={"muted"}>{props.props.labels.unavailableModels?.(props.props.unavailableModelLabels.join(", ")) ?? `Unavailable models: ${props.props.unavailableModelLabels.join(", ")}`}</Text>}
        </section>
        {props.props.validationNotice === undefined ? null : <Text size={"sm"} tone={"muted"} live={"polite"}>{props.props.validationNotice}</Text>}
        {props.state === "ready" ? null : <Text size={"sm"} tone={"muted"} live={props.state === "failed" ? "assertive" : "polite"}>{props.state === "saved" ? props.props.labels.settingsSaved : props.props.notice}</Text>}
        <div className={personalProjectGradingSettingsActionsClassName}><Button variant="primary" isDisabled={disabled || props.props.saveDisabled === true} isPending={disabled} onPress={props.on?.saveSettings}>{props.props.labels.saveSettings}</Button></div>
    </div>
}
