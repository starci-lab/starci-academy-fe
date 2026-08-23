import { Tree } from "@/components/branches/Tree"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import { LeagueBlock, type LeagueBlockScope } from "@/components/blocks/community/LeagueBlock"

/** The two URL-selected competitions this page can show. */
export type LeagueScope = LeagueBlockScope
/** Page-owned shell copy and URL scope; board data remains in LeagueBlock. */
export type LeaguePageProps = {
    readonly title: string
    readonly trail: ReadonlyArray<BreadcrumbStep>
    readonly scopeLabel: string
    readonly scope: LeagueScope
    readonly weeklyLabel: string
    readonly globalLabel: string
    readonly on?: { readonly selectScope?: (scope: string) => void; readonly goHome?: () => void }
}

/** Render the canonical page shell and compose the connected board at its legal inner contract. */
export const LeaguePageBase = (input: LeaguePageProps) => <Tree contract="league-page-column" render={defineContractComponent("league-page-column", {
    header: defineContractComponent("page-header-stack", {
        trail: defineLeafComponent("breadcrumbs", {}, () => <Breadcrumbs props={{ steps: input.trail, label: input.title }} on={{ home: input.on?.goHome }} />),
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.title, level: 1 }} />),
    }),
    scope: defineContractComponent("scope-switch-row", {
        tabs: defineLeafComponent("choice-tabs", {}, () => <ChoiceTabs props={{ label: input.scopeLabel, selectedKey: input.scope, variant: "primary", tabs: [{ id: "weekly", label: input.weeklyLabel }, { id: "global", label: input.globalLabel }] }} on={{ select: input.on?.selectScope }} />),
    }),
    board: defineContractProjection("league-board-stack", () => <LeagueBlock scope={input.scope} />),
})} />

/** Source-level ownership marker for the pure page shell. */
export const meta = { world: "pure", domain: "community" } as const
