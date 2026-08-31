import { LeagueCard } from "@/components/blocks/dashboard/LeagueCard"
import { TopLearners } from "@/components/blocks/dashboard/TopLearners"
import { communityTabClassName } from "./classNames"
/** Orchestrate weekly and global competition blocks in legacy order. */
/** Props for the community tab composition. */
export type CommunityTabProps = Record<string, never>
/** Connect the community tab's competition blocks. */
export const CommunityTab = (props: CommunityTabProps) => { void props; return <div className={communityTabClassName}><LeagueCard /><TopLearners /></div> }
