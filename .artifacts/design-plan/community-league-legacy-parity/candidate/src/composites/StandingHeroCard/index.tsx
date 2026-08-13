import { Button } from "@/components/leaves/Button"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import { LeaderboardStandingRow, type LeaderboardStandingRowData } from "../LeaderboardStandingRow"
import type { CompositeProps } from "@/components/contracts/props"
import { defineContract, TreeCandidate } from "../../branches/Tree"

/**
 * TARGET PATH: src/components/composites/StandingHeroCard/index.tsx
 * CONTRACTS: "standing-hero-card", "standing-goal-meter" (both proposed)
 *
 * COMPOSITE - `StandingHeroCard`: the viewer's place, the distance to the next one, and the one
 * action that closes it.
 *
 * WHY `leaderboard-standing-row` DID NOT JUST GROW A METER. The dashboard card genuinely has no
 * meter and no CTA — the legacy render proves it — so adding optional slots there would let every
 * caller of the dashboard standing opt into page furniture. The page owns a different, larger
 * story, and it gets its own owner rather than a more configurable version of the smaller one.
 *
 * THE METER IS OMITTED, NOT ZEROED, when the viewer is rank 1 or the rank above them is outside the
 * fetched slice. A bar at 0% would claim a measured distance nobody measured.
 */

/** Resolved goal-gradient meter. */
export type StandingHeroProgress = {
    /** Fill ratio, already clamped to 0..1 by the caller. */
    readonly ratio: number
    /** Already-translated distance sentence, e.g. "86 XP more to reach rank #3". */
    readonly label: string
}

/** Resolved hero data. */
export type StandingHeroCardData = {
    readonly standing: LeaderboardStandingRowData
    readonly progress?: StandingHeroProgress
    /** North-star CTA label, e.g. "Open a course and earn XP". */
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
        <TreeCandidate
            contract="standing-hero-card"
            render={defineContract("standing-hero-card", [
                <LeaderboardStandingRow key="standing" props={props.standing} isLoading={isLoading} />,
                ...(progress === undefined
                    ? []
                    : [(
                        <TreeCandidate
                            key="goal"
                            contract="standing-goal-meter"
                            render={defineContract("standing-goal-meter", [
                                <Text
                                    key="label"
                                    props={{ content: progress.label, size: "xs", tone: "muted" }}
                                    isLoading={isLoading}
                                />,
                                <Progress
                                    key="progress"
                                    props={{
                                        value: Math.round(progress.ratio * 100),
                                        label: props.progressAccessibleLabel,
                                    }}
                                    isLoading={isLoading}
                                />,
                            ])}
                        />
                    )]),
                <Button
                    key="action"
                    props={{ label: props.ctaLabel, variant: "primary", size: "md" }}
                    on={{ press: on?.cta }}
                    isLoading={isLoading}
                />,
            ])}
        />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
