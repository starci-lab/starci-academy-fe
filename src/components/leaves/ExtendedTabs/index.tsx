"use client"

import { Tabs } from "@starci/grammar/common"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor, type IconName } from "@/components/leaves/Icon"

/** One tab in the legacy dashboard strip. */
export type ExtendedTab = {
    readonly id: string
    readonly label: string
    readonly icon: IconName
}

/** The controlled data accepted by the closed StarCi tab primitive. */
export type ExtendedTabsData = {
    readonly label: string
    readonly selectedKey: string
    readonly tabs: ReadonlyArray<ExtendedTab>
    readonly labelVisibility?: "responsive" | "always"
    /** Removes the strip inset when the containing workbench already owns page padding. */
    readonly inset?: "page" | "none"
}

/** Events reported by the tab primitive. */
export type ExtendedTabsActions = {
    readonly select?: (key: string) => void
}

/** Fixed data and actions accepted by the closed StarCi tab leaf. */
export type ExtendedTabsProps = { readonly props: ExtendedTabsData; readonly on?: ExtendedTabsActions; readonly isLoading?: boolean }

/**
 * The original StarCi `ExtendedTabs` rendering, closed over typed tab data.
 *
 * The old public `children` hole is deliberately replaced by `tabs`: the HeroUI compound anatomy,
 * secondary variant, icon sizing and indicator are still the legacy implementation, while callers
 * can no longer replace that anatomy with arbitrary markup.
 */
export const ExtendedTabs = (props: ExtendedTabsProps) => {
    const data = props.props
    const on = props.on
    return <Tabs
        inset={data.inset ?? "page"}
        label={data.label}
        selectedKey={data.selectedKey}
        items={data.tabs.map((tab) => ({
            id: tab.id,
            label: tab.label,
            leading: <Icon source={iconSourceFor(tab.icon, "leading")} usage={"leading"} />,
        }))}
        onSelect={on?.select}
        panelId={(key) => `dashboard-panel-${key}`}
        labelVisibility={data.labelVisibility}
    />
}
