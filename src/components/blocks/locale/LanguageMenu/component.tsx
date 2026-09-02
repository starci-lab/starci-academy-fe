import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { DropdownBranch } from "@/components/branches/DropdownBranch"
import type { Locale } from "@/i18n/config"

/** One locale choice already resolved to its display label. */
export type LanguageMenuOption = {
    readonly id: Locale
    readonly label: string
}

/** Resolved single-select locale state accepted by the pure language block. */
export type LanguageMenuProps = {
    readonly props: {
        readonly label: string
        readonly selectedLocale: Locale
        readonly options: ReadonlyArray<LanguageMenuOption>
    }
    readonly on?: {
        readonly select?: (locale: Locale) => void
    }
}

/** Pure single-select locale ListBox matching the legacy navbar disclosure. */
export const LanguageMenuBase = (props: LanguageMenuProps) => (
    <DropdownBranch
        props={{
            label: props.props.label,
            selectionMode: "single",
            selectedId: props.props.selectedLocale,
            sections: [{
                items: props.props.options.map((option) => ({ ...option, showsIndicator: true })),
            }],
        }}
        on={{ action: (id) => props.on?.select?.(id) }}
        trigger={<Icon source={iconSourceFor("locale", "leading")} role={"leading"} />}
    />
)
