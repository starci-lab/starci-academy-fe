import Image from "next/image"
import { SurfaceCard } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import type { LabelledProgressRowData } from "@/components/composites/LabelledProgressRow"
import {
    dailyQuestCardClassName,
    dailyQuestHeroClassName,
    dailyQuestHeroImageClassName,
    dailyQuestRewardBandClassName,
    dailyQuestSeparatorClassName,
    dailyQuestTaskCellClassName,
    dailyQuestTasksClassName,
} from "./classNames"
/** Shared label frame for the daily quest surface. */
export type DailyQuestFrame = { readonly label: string }
/** Resolved task rows and reward copy. */
export type DailyQuestBody = { readonly tasks: ReadonlyArray<LabelledProgressRowData>; readonly rewardLine: string }
/** Daily quest state, data and actions. */
export type DailyQuestProps = { readonly state: "pending" | "empty" | "failed" | "open" | "claimable" | "claimed"; readonly props: DailyQuestFrame & Partial<DailyQuestBody> & { readonly message?: string; readonly retryLabel?: string; readonly claimLabel?: string; readonly claimedLine?: string }; readonly on?: { readonly retry?: () => void; readonly claim?: () => void } }
/** Draw daily tasks and their reward state. */
export const DailyQuestBase = (props: DailyQuestProps) => {
    if (props.state === "empty" || props.state === "failed") return <SurfaceCard label={props.props.label} composition={"single"}><EmptyNotice message={props.props.message ?? ""} actionLabel={props.state === "failed" ? props.props.retryLabel : undefined} iconSource={iconSourceFor("review", "leading")} onAction={({ act: props.state === "failed" ? props.on?.retry : undefined })?.act} /></SurfaceCard>
    const loading = props.state === "pending"
    const tasks = loading ? Array.from({ length: 5 }, (_, index) => ({ id: `resting-${index}`, title: "", percentText: "", percent: 0 })) : props.props.tasks ?? []
    const rewardLine = props.state === "claimed" ? props.props.claimedLine : props.props.rewardLine
    const claim = props.state === "claimable" && props.props.claimLabel !== undefined
        ? <Button variant="secondary" size="sm" onPress={props.on?.claim}>{props.props.claimLabel}</Button>
        : null
    return (
        <SurfaceCard label={props.props.label} composition={"joined"} state={loading ? "pending" : "neutral"}>
            <div className={dailyQuestCardClassName}>
                <div className={dailyQuestHeroClassName} data-dashboard-quest-hero="true">
                    <Image alt="" aria-hidden className={dailyQuestHeroImageClassName} height={176} priority={false} src="/images/dashboard/daily-quest-reward-v1.png" width={176} />
                </div>
                <div aria-hidden className={dailyQuestSeparatorClassName} />
                <div className={dailyQuestRewardBandClassName(props.state === "claimed")} data-dashboard-quest-reward="true">
                    <Text size={"sm"} tone={props.state === "claimed" ? "default" : "muted"} isSkeleton={loading}>{rewardLine}</Text>
                    {claim}
                </div>
                <div aria-hidden className={dailyQuestSeparatorClassName} />
                <ul className={dailyQuestTasksClassName}>
                    {tasks.map((task) => (
                        <li className={dailyQuestTaskCellClassName} key={task.id}>
                            <Text size={"sm"} weight={"normal"} isSkeleton={loading}>{task.title}</Text>
                            <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{task.percentText}</Text>
                        </li>
                    ))}
                </ul>
            </div>
        </SurfaceCard>
    )
}
