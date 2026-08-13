import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { LeaderboardStandingRow, type LeaderboardStandingRowData } from "@/components/composites/LeaderboardStandingRow"
import { Button } from "@/components/leaves/Button"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
    type CompositeProps,
} from "@/components/contracts/props"

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
export type StandingHeroCardProps = CompositeProps<StandingHeroCardData, StandingHeroCardActions>

/** Draw the viewer standing, the goal meter and the climb action. */
export const StandingHeroCard = ({ props, on, isLoading = false }: StandingHeroCardProps) => {
    const progress = props.progress
    return (
        <SurfaceCard contract="standing-hero-card" render={defineContractComponent("standing-hero-card", {
            standing: defineCompositeComponent("leaderboard-standing-row", {}, () => (
                <LeaderboardStandingRow props={props.standing} isLoading={isLoading} />
            )),
            ...(progress === undefined ? {} : {
                goal: defineContractComponent("standing-goal-meter", {
                    label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: progress.label, size: "xs", tone: "muted" }} isLoading={isLoading} />
                    )),
                    progress: defineLeafComponent("progress", {}, () => (
                        <Progress
                            props={{
                                value: Math.round(progress.ratio * 100),
                                label: props.progressAccessibleLabel,
                            }}
                            isLoading={isLoading}
                        />
                    )),
                }),
            }),
            action: defineLeafComponent("button", {}, () => (
                <Button
                    props={{ label: props.ctaLabel, variant: "primary", size: "md" }}
                    on={{ press: on?.cta }}
                    isLoading={isLoading}
                />
            )),
        })} />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
