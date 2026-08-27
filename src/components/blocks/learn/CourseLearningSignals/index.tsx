import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Text } from "@/components/leaves/Text"
/** One supporting fact in the course dashboard rail. */
export type CourseLearningSignal = { readonly id: string; readonly label: string; readonly fact: string; readonly actionLabel: string; readonly isSelected: boolean }
/** Signal list state and resolved data. */
export type CourseLearningSignalsProps = { readonly state: "pending" | "empty" | "failed" | "ready" | "partial"; readonly props: { readonly label: string; readonly message?: string; readonly retryLabel?: string; readonly signals?: ReadonlyArray<CourseLearningSignal> }; readonly on?: { readonly select?: (id: string) => void; readonly retry?: () => void } }
/** Draw course learning signals and their actions. */
export const CourseLearningSignals = (props: CourseLearningSignalsProps) => {
    if (props.state === "failed" || props.state === "empty") return <SurfaceCard props={{ label: props.props.label }}><EmptyNotice props={{ icon: "league", message: props.props.message ?? "", actionLabel: props.state === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.on?.retry }} /></SurfaceCard>
    const loading = props.state === "pending"
    const signals = loading ? Array.from({ length: 3 }, (_, index) => ({ id: `resting-${index}`, label: "", fact: "", actionLabel: "", isSelected: false })) : props.props.signals ?? []
    return <SurfaceListCard props={{ label: props.props.label }} isLoading={loading}>{signals.map((signal) => <div key={signal.id}><Text props={{ content: signal.label, size: "sm", weight: "medium" }} isLoading={loading} /><Text props={{ content: signal.fact, size: "xs", tone: "muted" }} isLoading={loading} />{loading ? null : <Button props={{ label: signal.actionLabel, size: "sm", variant: signal.isSelected ? "primary" : "tertiary" }} on={{ press: () => props.on?.select?.(signal.id) }} />}</div>)}</SurfaceListCard>
}
