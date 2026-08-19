import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardActions, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { CONTRACTS } from "@/components/contracts"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
    type LeafProps,
} from "@/components/contracts/props"

/** One prioritized course destination. */
export type CourseNextAction = {
    readonly id: string
    readonly title: string
    readonly kind: string
    readonly actionLabel: string
}

/** Props for the accepted ranked next-action list. */
export type CourseNextActionsProps =
    | { readonly state: "pending"; readonly props: { readonly label: string } }
    | { readonly state: "empty"; readonly props: { readonly label: string; readonly message: string } }
    | { readonly state: "failed"; readonly props: { readonly label: string; readonly message: string; readonly retryLabel: string } }
    | { readonly state: "ready" | "partial"; readonly props: { readonly label: string; readonly actions: ReadonlyArray<CourseNextAction> } }

/** Actions reported by the ranked destination list. */
export type CourseNextActionsActions = {
    readonly open?: (id: string) => void
    readonly retry?: () => void
}

type CourseNextActionsInput = CourseNextActionsProps & { readonly on?: CourseNextActionsActions }

type CourseNextActionListData = SurfaceListCardData & {
    readonly actions: ReadonlyArray<CourseNextAction>
}

type CourseNextActionListProps = LeafProps<CourseNextActionListData, SurfaceListCardActions>

const RESTING_COUNT = CONTRACTS["next-action-list"].children.step.restingCount

const CourseNextActionListView = ({ props, on, isLoading = false }: CourseNextActionListProps) => {
    const rows = isLoading
        ? Array.from({ length: RESTING_COUNT }, (_, index) => ({ id: `resting-${index}`, title: "", kind: "", actionLabel: "" }))
        : props.actions
    return (
        <Tree
            contract="next-action-list"
            render={defineContractComponent("next-action-list", {
                step: rows.map((row) => defineContractComponent("next-action-row", {
                    label: defineLeafComponent("text", { size: "md" }, () => (
                        <Text props={{ content: row.title, size: "md" }} isLoading={isLoading} />
                    )),
                    kind: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: row.kind, size: "xs", tone: "muted" }} isLoading={isLoading} />
                    )),
                    action: isLoading ? undefined : defineLeafComponent("see-more-link", {}, () => (
                        <SeeMoreLink props={{ label: row.actionLabel }} on={{ press: on?.[`open:${row.id}`] }} />
                    )),
                })),
            })}
        />
    )
}

const CourseNextActionList = defineContractComponent("next-action-list", CourseNextActionListView)

/** Draw the learner's next destinations in one priority-ordered joined list. */
export const CourseNextActions = (input: CourseNextActionsInput) => {
    if (input.state === "failed" || input.state === "empty") {
        return (
            <SurfaceCard
                props={{ label: input.props.label }}
                contract="empty-notice-card"
                render={defineContractComponent("empty-notice-card", {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{
                                icon: "course",
                                message: input.props.message,
                                ...(input.state === "failed" ? { actionLabel: input.props.retryLabel } : {}),
                            }}
                            on={{ act: input.on?.retry }}
                        />
                    )),
                })}
            />
        )
    }

    const isLoading = input.state === "pending"
    const actions = input.state === "pending" ? [] : input.props.actions
    const on = actions.reduce<SurfaceListCardActions>((all, action) => ({
        ...all,
        [`open:${action.id}`]: () => input.on?.open?.(action.id),
    }), {})
    return (
        <SurfaceListCard
            props={{ label: input.props.label, actions }}
            on={on}
            contract="next-action-list"
            render={CourseNextActionList}
            isLoading={isLoading}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
