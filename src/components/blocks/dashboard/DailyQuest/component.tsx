import { DashboardSurfaceCard as SurfaceCard } from "@/components/blocks/dashboard/DashboardSurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { TaskProgressRow } from "@/components/composites/TaskProgressRow"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Text } from "@/components/leaves/Text"
import type { LabelledProgressRowData } from "@/components/composites/LabelledProgressRow"
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
    const tasks = loading ? Array.from({ length: 4 }, (_, index) => ({ id: `resting-${index}`, title: "", percentText: "", percent: 0 })) : props.props.tasks ?? []
    return <SurfaceListCard props={{ label: props.props.label, description: props.state === "open" ? props.props.rewardLine : props.state === "claimed" ? props.props.claimedLine : undefined, actionLabel: props.state === "claimable" ? props.props.claimLabel : undefined }}>{props.state === "claimable" ? <Text props={{ content: props.props.rewardLine, size: "sm" }} /> : null}{tasks.map((task) => <TaskProgressRow key={task.id} props={{ id: task.id, title: task.title, fact: task.percentText, isComplete: task.percent === 100 }} isLoading={loading} />)}<Text props={{ content: undefined }} isLoading={loading} /></SurfaceListCard>
}
