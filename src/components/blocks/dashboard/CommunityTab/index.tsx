import { Tree } from "@/components/branches/Tree"
import { LeagueCard } from "@/components/blocks/dashboard/LeagueCard"
import { TopLearners } from "@/components/blocks/dashboard/TopLearners"
import { defineContractComponent,defineContractProjection } from "@/components/contracts/props"
/** Orchestrate weekly and global competition blocks in legacy order. */
export const CommunityTab=()=> <Tree contract="dashboard-community-main" render={defineContractComponent("dashboard-community-main",{section:[defineContractProjection("label-row-over-card",()=> <LeagueCard/>),defineContractProjection("label-row-over-card",()=> <TopLearners/>)]})}/>
/** Source-level ownership marker. */
export const meta={world:"pure",domain:"community"} as const
