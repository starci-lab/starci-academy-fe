import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import { Text } from "@/components/leaves/Text"
/** One prioritized course destination. */
export type CourseNextAction = { readonly id: string; readonly title: string; readonly kind: string; readonly actionLabel: string }
/** Next-action state, data and actions. */
export type CourseNextActionsProps = { readonly state: "pending" | "empty" | "failed" | "ready" | "partial"; readonly props: { readonly label: string; readonly message?: string; readonly retryLabel?: string; readonly actions?: ReadonlyArray<CourseNextAction> }; readonly on?: { readonly open?: (id: string) => void; readonly retry?: () => void } }
/** Draw prioritized next actions. */
export const CourseNextActions = (props: CourseNextActionsProps) => {
    if (props.state === "empty" || props.state === "failed") return <SurfaceCard props={{ label: props.props.label }}><EmptyNotice props={{ icon: "course", message: props.props.message ?? "", actionLabel: props.state === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.on?.retry }} /></SurfaceCard>
    const loading = props.state === "pending"
    const actions = loading ? Array.from({ length: 3 }, (_, index) => ({ id: `resting-${index}`, title: "", kind: "", actionLabel: "" })) : props.props.actions ?? []
    return <SurfaceListCard props={{ label: props.props.label }} isLoading={loading}>{actions.map((action) => <div key={action.id}><Text props={{ content: action.title, size: "md" }} isLoading={loading} /><Text props={{ content: action.kind, size: "xs", tone: "muted" }} isLoading={loading} />{loading ? null : <SeeMoreLink props={{ label: action.actionLabel }} on={{ press: () => props.on?.open?.(action.id) }} />}</div>)}</SurfaceListCard>
}
