import { DashboardSurfaceCard as SurfaceCard } from "@/components/blocks/dashboard/DashboardSurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Text } from "@/components/leaves/Text"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import { continueLearningGridClassName } from "./classNames"
/** One resumable learning item. */
export type ResumeItem = { readonly id: string; readonly title: string; readonly kindLabel: string }
/** Shared section label. */
export type ContinueLearningFrame = { readonly label: string }
/** Notice state copy. */
export type ContinueLearningNotice = ContinueLearningFrame & { readonly message: string; readonly actionLabel: string }
/** Continue-learning state and actions. */
export type ContinueLearningProps = { readonly state: "pending" | "onboarding" | "empty" | "failed" | "ready"; readonly props: ContinueLearningFrame & Partial<ContinueLearningNotice> & { readonly items?: ReadonlyArray<ResumeItem>; readonly resumeLabel?: string }; readonly on?: { readonly resume?: (id: string) => void; readonly act?: () => void } }
/** Draw the resume section across pending, notice and ready states. */
export const ContinueLearningBase = (props: ContinueLearningProps) => {
    if (props.state === "onboarding" || props.state === "empty" || props.state === "failed") return <SurfaceCard props={{ label: props.props.label }}><EmptyNotice props={{ icon: "course", message: props.props.message ?? "", actionLabel: props.props.actionLabel }} on={{ act: props.on?.act }} /></SurfaceCard>
    const loading = props.state === "pending"
    const items = loading ? Array.from({ length: 3 }, (_, index) => ({ id: `resting-${index}`, title: "", kindLabel: "" })) : props.props.items ?? []
    return <SurfaceCard props={{ label: props.props.label, isFrameless: true }} isLoading={loading}><div className={continueLearningGridClassName}>{items.map((item) => <SurfaceCard key={item.id} props={{ ariaLabel: item.title || props.props.label }}><Text props={{ content: item.kindLabel, size: "sm", tone: "muted" }} isLoading={loading} /><Text props={{ content: item.title, size: "sm", weight: "medium" }} isLoading={loading} />{loading || props.props.resumeLabel === undefined ? null : <SeeMoreLink props={{ label: props.props.resumeLabel }} on={{ press: () => props.on?.resume?.(item.id) }} />}</SurfaceCard>)}</div></SurfaceCard>
}
