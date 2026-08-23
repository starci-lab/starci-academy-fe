import { Tree } from "@/components/branches/Tree"
import { Field } from "@/components/composites/Field"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import { Button } from "@/components/leaves/Button"
import { Select } from "@/components/leaves/Select"
import { Text } from "@/components/leaves/Text"

/** One language or grading-model choice shown in the settings drawer. */
export type PersonalProjectGradingSettingsOption = { readonly id: string; readonly label: string; readonly disabled?: boolean }
/** Localized copy required by the pure settings renderer. */
export type PersonalProjectGradingSettingsLabels = {
    readonly language: string; readonly model: string; readonly branch: string; readonly branchPlaceholder: string
    readonly token: string; readonly tokenPlaceholder: string; readonly tokenStored: (last4: string) => string
    readonly settingsSaved: string; readonly saveSettings: string
}
/** Transport and mutation conditions owned by the settings block. */
export type PersonalProjectGradingSettingsState = "ready" | "saving" | "saved" | "failed"
/** Pure settings renderer input. */
export type PersonalProjectGradingSettingsProps = {
    readonly state: PersonalProjectGradingSettingsState
    readonly props: {
        readonly labels: PersonalProjectGradingSettingsLabels
        readonly languageOptions: ReadonlyArray<PersonalProjectGradingSettingsOption>
        readonly selectedLanguage?: string
        readonly modelOptions: ReadonlyArray<PersonalProjectGradingSettingsOption>
        readonly selectedModel?: string
        readonly branch?: string
        readonly tokenLast4?: string
        readonly notice?: string
    }
    readonly on?: {
        readonly selectLanguage?: (value: string) => void
        readonly selectModel?: (value: string) => void
        readonly changeBranch?: (value: string) => void
        readonly changeToken?: (value: string) => void
        readonly saveSettings?: () => void
    }
}

/** Pure settings drawer content; all values and actions arrive from the connected owner. */
export const PersonalProjectGradingSettingsBlockBase = (input: PersonalProjectGradingSettingsProps) => {
    const disabled = input.state === "saving"
    return <Tree contract="personal-project-grading-settings-drawer" render={defineContractComponent("personal-project-grading-settings-drawer", {
        language: defineLeafComponent("select", {}, () => <Select props={{ id: "personal-project-language", name: "personal-project-language", label: input.props.labels.language, options: input.props.languageOptions, selectedKey: input.props.selectedLanguage, disabled }} on={{ select: input.on?.selectLanguage }} />),
        model: defineLeafComponent("select", {}, () => <Select props={{ id: "personal-project-model", name: "personal-project-model", label: input.props.labels.model, options: input.props.modelOptions.filter((option) => option.disabled !== true), selectedKey: input.props.selectedModel, disabled }} on={{ select: input.on?.selectModel }} />),
        branch: defineCompositeComponent("field", {}, () => <Field props={{ id: "personal-project-branch", name: "personal-project-branch", label: input.props.labels.branch, placeholder: input.props.branch ?? input.props.labels.branchPlaceholder, disabled }} on={{ change: input.on?.changeBranch }} />),
        token: defineCompositeComponent("field", {}, () => <Field props={{ id: "personal-project-token", name: "personal-project-token", label: input.props.labels.token, kind: "newPassword", placeholder: input.props.labels.tokenPlaceholder, disabled, revealLabel: input.props.labels.token, hideLabel: input.props.labels.token }} on={{ change: input.on?.changeToken }} />),
        ...(input.props.tokenLast4 === undefined ? {} : { tokenFact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: input.props.labels.tokenStored(input.props.tokenLast4 ?? ""), size: "xs", tone: "muted" }} />) }),
        ...(input.state === "ready" ? {} : { status: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.state === "saved" ? input.props.labels.settingsSaved : input.props.notice, size: "sm", tone: "muted", live: input.state === "failed" ? "assertive" : "polite" }} />) }),
        action: defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.saveSettings, variant: "primary", isPending: disabled }} on={{ press: input.on?.saveSettings }} />),
    })} />
}

/** Source-level ownership marker for the pure settings renderer. */
export const meta = { world: "pure", domain: "learn" } as const
