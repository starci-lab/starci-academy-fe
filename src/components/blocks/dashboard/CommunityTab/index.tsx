import { LeagueCard } from "@/components/blocks/dashboard/LeagueCard"
import { TopLearners } from "@/components/blocks/dashboard/TopLearners"
/** Orchestrate weekly and global competition blocks in legacy order. */
/** Props for the community tab composition. */
export type CommunityTabProps = Record<string, never>
/** Connect the community tab's competition blocks. */
export const CommunityTab = (props: CommunityTabProps) => { void props; return <div><LeagueCard /><TopLearners /></div> }
