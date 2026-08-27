import { ChoiceTabs, type ChoiceTabsData } from "@/components/leaves/ChoiceTabs"

/** Two controlled peer-choice axes sharing one toolbar row. */
export type DualTabsToolbarData = {
    readonly leading: ChoiceTabsData
    readonly trailing: ChoiceTabsData
}

/** Selection changes reported by the two axes. */
export type DualTabsToolbarActions = {
    readonly selectLeading?: (key: string) => void
    readonly selectTrailing?: (key: string) => void
}

/** Props for the closed two-axis toolbar arrangement. */
export type DualTabsToolbarProps = { readonly props: DualTabsToolbarData; readonly on?: DualTabsToolbarActions }

/** Draw two primary peer-choice axes on the same toolbar. */
export const DualTabsToolbar = (props: DualTabsToolbarProps) => <div><ChoiceTabs props={{ ...props.props.leading, variant: "primary" }} on={{ select: props.on?.selectLeading }} /><ChoiceTabs props={{ ...props.props.trailing, variant: "primary" }} on={{ select: props.on?.selectTrailing }} /></div>
