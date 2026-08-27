import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { StreakWeekRun } from "@/components/composites/StreakWeekRun"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Text } from "@/components/leaves/Text"
import type { DayCellData } from "@/components/leaves/DayCell"
/** Common streak region frame. */
export type StreakStripFrame = { readonly label: string }
/** Streak display states and their resolved data. */
export type StreakStripProps = { readonly state: "pending" | "failed" | "ready"; readonly props: StreakStripFrame & { readonly message?: string; readonly retryLabel?: string; readonly streak?: number; readonly record?: string; readonly days?: ReadonlyArray<DayCellData>; readonly current?: string; readonly emptyMessage?: string; readonly actionLabel?: string; readonly nudge?: string }; readonly on?: StreakStripActions }
/** Streak retry and learning actions. */
export type StreakStripActions = { readonly retry?: () => void; readonly learn?: () => void }
/** Draw weekly activity, streak outcome and optional nudge. */
export const StreakStripBase = (props: StreakStripProps) => { if (props.state === "failed") return <SurfaceCard props={{ label: props.props.label }}><EmptyNotice props={{ icon: "streak", message: props.props.message ?? "", actionLabel: props.props.retryLabel }} on={{ act: props.on?.retry }} /></SurfaceCard>; const loading = props.state === "pending"; const days = props.props.days; const active = props.state === "ready" && ((props.props.streak ?? 0) > 0 || days?.some((day) => day.active) === true); const today = props.state === "ready" && days?.at(-1)?.active === true; return <SurfaceCard props={{ label: props.props.label }} isLoading={loading}><StreakWeekRun props={{ days }} isLoading={loading} />{active || loading ? <div><Text props={{ content: props.props.current, size: "sm", weight: "medium" }} isLoading={loading} /><Badge props={{ content: props.props.record ?? "", tone: "accent" }} isLoading={loading} /></div> : <div><Text props={{ content: props.props.emptyMessage ?? props.props.message, size: "sm", tone: "muted" }} isLoading={loading} /><Button props={{ label: props.props.actionLabel ?? "", size: "sm", variant: "primary" }} on={{ press: props.on?.learn }} isLoading={loading} /></div>}{active && !today && props.state === "ready" && <div><Text props={{ content: props.props.nudge, size: "sm", weight: "medium" }} /><Button props={{ label: props.props.actionLabel ?? "", size: "sm", variant: "primary" }} on={{ press: props.on?.learn }} /></div>}</SurfaceCard> }
