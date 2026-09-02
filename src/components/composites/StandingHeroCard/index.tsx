import { SurfaceCard } from "@starci/grammar/common"
import { LeaderboardStandingRow, type LeaderboardStandingRowData } from "@/components/composites/LeaderboardStandingRow"
import { Button } from "@starci/grammar/common"
import { Progress } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"

/**
 * COMPOSITE - `StandingHeroCard`: the viewer's place, the distance to the next one, and the one
 * action that closes it.
 *
 * WHY `leaderboard-standing-row` DID NOT SIMPLY GROW A METER. The dashboard card genuinely has no
 * meter and no call to action, so adding optional slots there would let every caller of the smaller
 * standing opt into page furniture. The page owns a larger story and gets its own owner rather than
 * a more configurable version of the smaller one.
 *
 * THE METER IS OMITTED, NOT ZEROED, when the viewer is first or the place above them is outside the
 * fetched slice. A bar at zero would claim a measured distance nobody measured.
 */

/** Resolved goal-gradient meter. */
export type StandingHeroProgress = {
    /** Fill ratio, already clamped to 0..1 by the caller. */
    readonly ratio: number
    /** Already-translated distance sentence. */
    readonly label: string
}

/** Resolved hero data. */
export type StandingHeroCardData = {
    readonly standing: LeaderboardStandingRowData
    readonly progress?: StandingHeroProgress
    /** North-star action label. */
    readonly ctaLabel: string
    /** Accessible name for the meter; never drawn. */
    readonly progressAccessibleLabel: string
}

/** The one action this hero exposes. */
export type StandingHeroCardActions = {
    readonly cta?: () => void
}

/** Props for {@link StandingHeroCard}. */
export type StandingHeroCardProps = { readonly props: StandingHeroCardData; readonly on?: StandingHeroCardActions; readonly isLoading?: boolean }

/** Draw the viewer standing, the goal meter and the climb action. */
export const StandingHeroCard = (props: StandingHeroCardProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    const progress = data.progress
    return (
        <SurfaceCard composition="joined"><LeaderboardStandingRow props={data.standing} isLoading={isLoading} />{progress === undefined ? null : <div><Text size={"xs"} tone={"muted"} isSkeleton={isLoading}>{progress.label}</Text><Progress label={data.progressAccessibleLabel} value={Math.round(progress.ratio * 100)} isSkeleton={isLoading} /></div>}<Button variant={"primary"} size={"md"} isSkeleton={isLoading} onPress={({ press: on?.cta })?.press}>{data.ctaLabel}</Button></SurfaceCard>
    )
}
