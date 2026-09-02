import { LeagueCard } from "@/components/blocks/dashboard/LeagueCard"
import { TopLearners } from "@/components/blocks/dashboard/TopLearners"
import { Link } from "@/i18n/navigation"
import {
    communityActionRowClassName,
    communityCardsClassName,
    communityDestinationLinkClassName,
    communityTabClassName,
} from "./classNames"

/** Inputs for the presentational leaderboard destination. */
export type CommunityTabData = { readonly seeMoreLabel: string; readonly seeMoreHref: "/league" }
/** Presentational leaderboard destination props. */
export type CommunityTabProps = { readonly props: CommunityTabData }

/** Compose weekly and platform rankings in the same one-column reading track as Courses. */
export const CommunityTabBase = (props: CommunityTabProps) => {
    return (
        <div className={communityTabClassName}>
            <div className={communityCardsClassName} data-dashboard-community-cards="true">
                <LeagueCard />
                <TopLearners />
            </div>
            <div className={communityActionRowClassName}>
                <Link className={communityDestinationLinkClassName} href={props.props.seeMoreHref}>
                    {props.props.seeMoreLabel}
                </Link>
            </div>
        </div>
    )
}
