import { Field } from "@/components/composites/Field"
import { Button } from "@/components/leaves/Button"
import { Select } from "@/components/leaves/Select"
import { Text } from "@/components/leaves/Text"
import { personalProjectGradingSettingsActionsClassName, personalProjectGradingSettingsClassName, personalProjectGradingSettingsSectionClassName } from "./classNames"

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
        <Text props={{ content: props.props.labels.description, size: "sm", tone: "muted" }} />
        <section className={personalProjectGradingSettingsSectionClassName}>
            <Text props={{ content: props.props.labels.sourceSection ?? props.props.labels.branch, weight: "semibold" }} />
            <Field props={{ id: "personal-project-branch", name: "personal-project-branch", label: props.props.labels.branch, description: props.props.labels.branchHelp, placeholder: props.props.labels.branchPlaceholder, defaultValue: props.props.branch, disabled }} on={{ change: props.on?.changeBranch }} />
            <Field props={{ id: "personal-project-token", name: "personal-project-token", label: props.props.labels.token, kind: "newPassword", description: props.props.labels.tokenHelp, placeholder: props.props.labels.tokenPlaceholder, disabled, revealLabel: props.props.labels.revealToken ?? props.props.labels.token, hideLabel: props.props.labels.hideToken ?? props.props.labels.token }} on={{ change: props.on?.changeToken }} />
            {props.props.tokenLast4 === undefined ? null : <><Text props={{ content: props.props.labels.tokenStored(props.props.tokenLast4), size: "xs", tone: "muted" }} /><Button props={{ label: props.props.labels.clearToken ?? "Remove token", variant: "ghost", size: "sm", disabled }} on={{ press: props.on?.clearToken }} /></>}
            <Text props={{ content: props.props.labels.privacy, size: "xs", tone: "muted" }} />
        </section>
        <section className={personalProjectGradingSettingsSectionClassName}>
            <Text props={{ content: props.props.labels.analysisSection ?? props.props.labels.model, weight: "semibold" }} />
            <Select props={{ id: "personal-project-language", name: "personal-project-language", label: props.props.labels.language, options: props.props.languageOptions, selectedKey: props.props.selectedLanguage, disabled }} on={{ select: props.on?.selectLanguage }} />
            <Select props={{ id: "personal-project-model", name: "personal-project-model", label: props.props.labels.model, options: props.props.modelOptions.filter((option) => option.disabled !== true), selectedKey: props.props.selectedModel, disabled }} on={{ select: props.on?.selectModel }} />
            {props.props.unavailableModelLabels === undefined || props.props.unavailableModelLabels.length === 0 ? null : <Text props={{ content: props.props.labels.unavailableModels?.(props.props.unavailableModelLabels.join(", ")) ?? `Unavailable models: ${props.props.unavailableModelLabels.join(", ")}`, size: "xs", tone: "muted" }} />}
        </section>
        {props.props.validationNotice === undefined ? null : <Text props={{ content: props.props.validationNotice, size: "sm", tone: "muted", live: "polite" }} />}
        {props.state === "ready" ? null : <Text props={{ content: props.state === "saved" ? props.props.labels.settingsSaved : props.props.notice, size: "sm", tone: "muted", live: props.state === "failed" ? "assertive" : "polite" }} />}
        <div className={personalProjectGradingSettingsActionsClassName}><Button props={{ label: props.props.labels.saveSettings, variant: "primary", isPending: disabled, disabled: disabled || props.props.saveDisabled === true }} on={{ press: props.on?.saveSettings }} /></div>
    </div>
}
