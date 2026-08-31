import Image from "next/image"
import { DashboardSurfaceCard as SurfaceCard } from "@/components/blocks/dashboard/DashboardSurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Text } from "@/components/leaves/Text"
import { Button } from "@/components/leaves/Button"
import type { LabelledProgressRowData } from "@/components/composites/LabelledProgressRow"
import {
    dailyQuestCardClassName,
    dailyQuestHeroClassName,
    dailyQuestHeroImageClassName,
    dailyQuestRewardBandClassName,
    dailyQuestSeparatorClassName,
    dailyQuestSurfaceClassName,
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
    if (props.state === "empty" || props.state === "failed") return <SurfaceCard props={{ label: props.props.label }}><EmptyNotice props={{ icon: "review", message: props.props.message ?? "", actionLabel: props.state === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.state === "failed" ? props.on?.retry : undefined }} /></SurfaceCard>
    const loading = props.state === "pending"
    const tasks = loading ? Array.from({ length: 5 }, (_, index) => ({ id: `resting-${index}`, title: "", percentText: "", percent: 0 })) : props.props.tasks ?? []
    const rewardLine = props.state === "claimed" ? props.props.claimedLine : props.props.rewardLine
    const claim = props.state === "claimable" && props.props.claimLabel !== undefined
        ? <Button props={{ label: props.props.claimLabel, variant: "secondary", size: "sm", icon: "reward" }} on={{ press: props.on?.claim }} />
        : null
    return (
        <div className={dailyQuestSurfaceClassName}>
            <SurfaceCard props={{ label: props.props.label }} isLoading={loading}>
                <div className={dailyQuestCardClassName}>
                    <div className={dailyQuestHeroClassName} data-dashboard-quest-hero="true">
                        <Image alt="" aria-hidden className={dailyQuestHeroImageClassName} height={176} priority={false} src="/images/dashboard/daily-quest-reward-v1.png" width={176} />
                    </div>
                    <div aria-hidden className={dailyQuestSeparatorClassName} />
                    <div className={dailyQuestRewardBandClassName} data-dashboard-quest-reward="true">
                        <Text props={{ content: rewardLine, size: "sm" }} isLoading={loading} />
                        {claim}
                    </div>
                    <div aria-hidden className={dailyQuestSeparatorClassName} />
                    <ul className={dailyQuestTasksClassName}>
                        {tasks.map((task) => (
                            <li className={dailyQuestTaskCellClassName} key={task.id}>
                                <Text props={{ content: task.title, size: "sm", weight: "normal" }} isLoading={loading} />
                                <Text props={{ content: task.percentText, size: "xs", tone: "muted" }} isLoading={loading} />
                            </li>
                        ))}
                    </ul>
                </div>
            </SurfaceCard>
        </div>
    )
}
