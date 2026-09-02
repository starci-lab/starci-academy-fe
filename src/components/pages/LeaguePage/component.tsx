import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@starci/grammar/common"
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

/** Render the canonical page shell and compose the connected board in its inner region. */
export const LeaguePageBase = (props: LeaguePageProps) => <>
    <Breadcrumbs props={{ steps: props.trail, label: props.title }} on={{ home: props.on?.goHome }} />
    <Heading level={1}>{props.title}</Heading>
    <ChoiceTabs props={{ label: props.scopeLabel, selectedKey: props.scope, variant: "primary", tabs: [{ id: "weekly", label: props.weeklyLabel }, { id: "global", label: props.globalLabel }] }} on={{ select: props.on?.selectScope }} />
    <LeagueBlock scope={props.scope} />
</>
