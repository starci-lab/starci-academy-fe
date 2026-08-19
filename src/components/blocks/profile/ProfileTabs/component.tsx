import { Tree } from "@/components/branches/Tree"
import { ExtendedTabs, type ExtendedTab } from "@/components/leaves/ExtendedTabs"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/** Route-derived public-profile destinations resolved by the persistent layout. */
export type ProfileTabsData = {
    readonly label: string
    readonly selectedKey: string
    readonly tabs: ReadonlyArray<ExtendedTab>
}

/** The one outcome exposed by profile route chrome. */
export type ProfileTabsActions = { readonly select?: (key: string) => void }

/** The tab set this chrome draws, plus the one outcome it reports. */
type ProfileTabsInput = { readonly props: ProfileTabsData, readonly on?: ProfileTabsActions }

/** Draw profile-owned route chrome without borrowing the global navbar owner. */
export const ProfileTabsBase = (input: ProfileTabsInput) => (
    <Tree contract="underlined-tab-strip" render={defineContractComponent("underlined-tab-strip", {
        tabs: defineLeafComponent("extended-tabs", {}, () => (
            <ExtendedTabs props={input.props} on={{ select: input.on?.select }} />
        )),
    })} />
)

/** Source-level marker for the pure profile route-chrome block. */
export const meta = { world: "pure", domain: "profile" } as const
