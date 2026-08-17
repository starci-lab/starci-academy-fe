import { Icon } from "@/components/leaves/Icon"
import { DropdownBranch } from "@/components/branches/DropdownBranch"
import { defineLeafComponent } from "@/components/contracts/props"
import type { Locale } from "@/i18n/config"

/** One locale choice already resolved to its display label. */
export type LanguageMenuOption = {
    readonly id: Locale
    readonly label: string
}

/** Resolved single-select locale state accepted by the pure language block. */
export type LanguageMenuViewProps = {
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
export const _LanguageMenu = (input: LanguageMenuViewProps) => (
    <DropdownBranch
        props={{
            label: input.props.label,
            selectionMode: "single",
            selectedId: input.props.selectedLocale,
            sections: [{
                items: input.props.options.map((option) => ({ ...option, showsIndicator: true })),
            }],
        }}
        on={{ action: (id) => input.on?.select?.(id) }}
        trigger={defineLeafComponent("icon", {}, () => (
            <Icon props={{ name: "locale", role: "leading" }} />
        ))}
    />
)

/** Source-level tier marker for the pure language-menu block half. */
export const meta = { shape: "block", world: "pure", domain: "locale" } as const
