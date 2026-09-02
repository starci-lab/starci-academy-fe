import { SurfaceCard } from "@starci/grammar/common"
import { StreakWeekRun } from "@/components/composites/StreakWeekRun"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { Badge } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"

import { Text } from "@starci/grammar/common"
import type { DayCellData } from "@/components/leaves/DayCell"
import {
    streakActionClassName,
    streakCardClassName,
    streakFactClassName,
    streakSeparatorClassName,
    streakSummaryClassName,
} from "./classNames"

/** Common streak region frame. */
export type StreakStripFrame = { readonly label: string }
/** Streak display states and their resolved data. */
export type StreakStripProps = { readonly state: "pending" | "failed" | "ready"; readonly props: StreakStripFrame & { readonly message?: string; readonly retryLabel?: string; readonly streak?: number; readonly record?: string; readonly days?: ReadonlyArray<DayCellData>; readonly current?: string; readonly emptyMessage?: string; readonly actionLabel?: string; readonly nudge?: string }; readonly on?: StreakStripActions }
/** Streak retry and learning actions. */
export type StreakStripActions = { readonly retry?: () => void; readonly learn?: () => void }
/** Draw weekly activity, streak outcome and optional nudge. */
export const StreakStripBase = (props: StreakStripProps) => {
    if (props.state === "failed") {
        return (
            <SurfaceCard label={props.props.label} composition={"single"}>
                <EmptyNotice message={props.props.message ?? ""} actionLabel={props.props.retryLabel} iconSource={iconSourceFor("streak", "leading")} onAction={({ act: props.on?.retry })?.act} />
            </SurfaceCard>
        )
    }

    const loading = props.state === "pending"
    const days = props.props.days
    const active = props.state === "ready" && ((props.props.streak ?? 0) > 0 || days?.some((day) => day.active) === true)
    const today = props.state === "ready" && days?.at(-1)?.active === true
    const action = active && !today && props.state === "ready"
        ? (
            <div data-part="streak-nudge" className={streakActionClassName}>
                <Text size={"sm"} weight={"medium"}>{props.props.nudge}</Text>
                <Button variant="primary" size="sm" onPress={props.on?.learn}>{props.props.actionLabel ?? ""}</Button>
            </div>
        )
        : !active && !loading
            ? (
                <div data-part="streak-prompt" className={streakActionClassName}>
                    <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.emptyMessage ?? props.props.message}</Text>
                    <Button variant={"primary"} size={"sm"} isSkeleton={loading} onPress={({ press: props.on?.learn })?.press}>{props.props.actionLabel ?? ""}</Button>
                </div>
            )
            : loading
                ? (
                    <div data-part="streak-prompt" className={streakActionClassName}>
                        <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.message}</Text>
                        <Button variant={"primary"} size={"sm"} isSkeleton={loading} onPress={({ press: props.on?.learn })?.press}>{props.props.actionLabel ?? ""}</Button>
                    </div>
                )
                : null

    return (
        <SurfaceCard label={props.props.label} composition={"joined"} state={loading ? "pending" : "neutral"}>
            <div className={streakCardClassName}>
                <div data-part="streak-summary" className={streakSummaryClassName}>
                    <StreakWeekRun props={{ days }} isLoading={loading} />
                    <div data-part="streak-facts" className={streakFactClassName}>
                        <Text size={"sm"} weight={"medium"} isSkeleton={loading}>{props.props.current}</Text>
                        <Badge tone={"accent"} isSkeleton={loading}>{props.props.record ?? ""}</Badge>
                    </div>
                </div>
                {action === null ? null : (
                    <>
                        <div aria-hidden className={streakSeparatorClassName} />
                        {action}
                    </>
                )}
            </div>
        </SurfaceCard>
    )
}
