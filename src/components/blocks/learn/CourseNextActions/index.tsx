import { SurfaceCard } from "@starci/grammar/common"
import { SurfaceListCard } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { Icon, TextAction } from "@starci/grammar/common"

/** One prioritized course destination. */
export type CourseNextAction = { readonly id: string; readonly title: string; readonly kind: string; readonly actionLabel: string }
/** Next-action state, data and actions. */
export type CourseNextActionsProps = { readonly state: "pending" | "empty" | "failed" | "ready" | "partial"; readonly props: { readonly label: string; readonly message?: string; readonly retryLabel?: string; readonly actions?: ReadonlyArray<CourseNextAction> }; readonly on?: { readonly open?: (id: string) => void; readonly retry?: () => void } }
/** Draw prioritized next actions. */
export const CourseNextActions = (props: CourseNextActionsProps) => {
    if (props.state === "empty" || props.state === "failed") return <SurfaceCard label={props.props.label} composition="joined"><EmptyNotice message={props.props.message ?? ""} actionLabel={props.state === "failed" ? props.props.retryLabel : undefined} iconSource={iconSourceFor("course", "leading")} onAction={({ act: props.on?.retry })?.act} /></SurfaceCard>
    const loading = props.state === "pending"
    const actions = loading ? Array.from({ length: 3 }, (_, index) => ({ id: `resting-${index}`, title: "", kind: "", actionLabel: "" })) : props.props.actions ?? []
    return <SurfaceListCard label={props.props.label} isLoading={loading}>{actions.map((action) => <div key={action.id}><Text size={"md"} isSkeleton={loading}>{action.title}</Text><Text size={"xs"} tone={"muted"} isSkeleton={loading}>{action.kind}</Text>{loading ? null : <TextAction appearance="disclosure" onPress={() => props.on?.open?.(action.id)} endContent={<Icon source={iconSourceFor("next", "chip")} role="chip" />}>{action.actionLabel}</TextAction>}</div>)}</SurfaceListCard>
}
