import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
/** Domain grid lifecycle state. */
export type DomainMasteryGridState = "pending" | "ready" | "guest" | "progress-failed" | "catalog-failed" | "empty"
/** One domain mastery summary. */
export type DomainMastery = { readonly id: string; readonly name: string; readonly total: number; readonly solved?: number; readonly countLabel: string; readonly label: string; readonly meterLabel: string }
/** Resolved domain grid content. */
export type DomainMasteryGridData = { readonly domains?: ReadonlyArray<DomainMastery>; readonly noticeMessage?: string; readonly noticeDescription?: string; readonly noticeActionLabel?: string }
/** Domain grid interaction callbacks. */
export type DomainMasteryGridActions = { readonly open?: (id: string) => void; readonly recover?: () => void }
/** Traditional domain grid props. */
export type DomainMasteryGridProps = { readonly state: DomainMasteryGridState; readonly props: DomainMasteryGridData; readonly on?: DomainMasteryGridActions }
/** Draw coding domains with solved counts and progress meters. */
export const DomainMasteryGridBase = (props: DomainMasteryGridProps) => {
    if (["guest", "progress-failed", "catalog-failed", "empty"].includes(props.state)) return <EmptyNotice props={{ icon: props.state === "guest" ? "signIn" : "retry", message: props.props.noticeMessage ?? "", description: props.props.noticeDescription, actionLabel: props.props.noticeActionLabel }} on={{ act: props.on?.recover }} />
    const loading = props.state === "pending"; const domains = loading ? [] : props.props.domains ?? []
    return <div>{domains.map((domain) => <button type="button" key={domain.id} aria-label={domain.label} onClick={() => props.on?.open?.(domain.id)}><Text props={{ content: domain.name, size: "sm", weight: "semibold" }} /><Text props={{ content: domain.countLabel, size: "xs", tone: "muted" }} /><Progress props={{ label: domain.meterLabel, value: domain.solved === undefined ? 0 : domain.total === 0 ? 0 : domain.solved / domain.total * 100 }} /></button>)}</div>
}
