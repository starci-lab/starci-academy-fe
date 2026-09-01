import { LeagueCard } from "@/components/blocks/dashboard/LeagueCard"
import { TopLearners } from "@/components/blocks/dashboard/TopLearners"
import { Button } from "@/components/leaves/Button"
import { communityActionRowClassName, communityTabClassName } from "./classNames"

/** Inputs for the presentational leaderboard destination. */
export type CommunityTabData = { readonly seeMoreLabel: string }
/** Interactions owned by the leaderboard destination. */
export type CommunityTabActions = { readonly seeMore?: () => void }
/** Presentational leaderboard destination props. */
export type CommunityTabProps = { readonly props: CommunityTabData; readonly on?: CommunityTabActions }

/** Compose weekly and platform rankings in the same one-column reading track as Courses. */
export const CommunityTabBase = (props: CommunityTabProps) => {
    return (
        <div className={communityTabClassName}>
            <LeagueCard />
            <TopLearners />
            <div className={communityActionRowClassName}>
                <Button
                    props={{ label: props.props.seeMoreLabel, variant: "primary", size: "sm" }}
                    on={{ press: props.on?.seeMore }}
                />
            </div>
        </div>
    )
}
