import { SurfaceCard } from "@starci/grammar/common"
import { SurfaceListCard } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
/** One supporting fact in the course dashboard rail. */
export type CourseLearningSignal = { readonly id: string; readonly label: string; readonly fact: string; readonly actionLabel: string; readonly isSelected: boolean }
/** Signal list state and resolved data. */
export type CourseLearningSignalsProps = { readonly state: "pending" | "empty" | "failed" | "ready" | "partial"; readonly props: { readonly label: string; readonly message?: string; readonly retryLabel?: string; readonly signals?: ReadonlyArray<CourseLearningSignal> }; readonly on?: { readonly select?: (id: string) => void; readonly retry?: () => void } }
/** Draw course learning signals and their actions. */
export const CourseLearningSignals = (props: CourseLearningSignalsProps) => {
    if (props.state === "failed" || props.state === "empty") return <SurfaceCard label={props.props.label} composition="joined"><EmptyNotice message={props.props.message ?? ""} actionLabel={props.state === "failed" ? props.props.retryLabel : undefined} iconSource={iconSourceFor("league", "leading")} onAction={({ act: props.on?.retry })?.act} /></SurfaceCard>
    const loading = props.state === "pending"
    const signals = loading ? Array.from({ length: 3 }, (_, index) => ({ id: `resting-${index}`, label: "", fact: "", actionLabel: "", isSelected: false })) : props.props.signals ?? []
    return <SurfaceListCard label={props.props.label} isLoading={loading}>{signals.map((signal) => <div key={signal.id}><Text size={"sm"} weight={"medium"} isSkeleton={loading}>{signal.label}</Text><Text size={"xs"} tone={"muted"} isSkeleton={loading}>{signal.fact}</Text>{loading ? null : <Button variant={signal.isSelected ? "primary" : "tertiary"} size="sm" onPress={() => props.on?.select?.(signal.id)}>{signal.actionLabel}</Button>}</div>)}</SurfaceListCard>
}
