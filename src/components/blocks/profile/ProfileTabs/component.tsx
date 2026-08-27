import { ExtendedTabs, type ExtendedTab } from "@/components/leaves/ExtendedTabs"

/** Route-derived public-profile destinations resolved by the persistent layout. */
export type ProfileTabsData = {
    readonly label: string
    readonly selectedKey: string
    readonly tabs: ReadonlyArray<ExtendedTab>
}

/** The one outcome exposed by profile route chrome. */
export type ProfileTabsActions = { readonly select?: (key: string) => void }

/** The tab set this chrome draws, plus the one outcome it reports. */
export type ProfileTabsProps = { readonly props: ProfileTabsData, readonly on?: ProfileTabsActions }

/** Draw profile-owned route chrome without borrowing the global navbar owner. */
export const ProfileTabsBase = (props: ProfileTabsProps) => (
    <ExtendedTabs props={props.props} on={{ select: props.on?.select }} />
)

/** Source-level marker for the pure profile route-chrome block. */
