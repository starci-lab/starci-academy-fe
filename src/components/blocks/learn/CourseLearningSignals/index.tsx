import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardActions, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { CONTRACTS } from "@/components/contracts"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
    type LeafProps,
} from "@/components/contracts/props"

/** One supporting fact in the course dashboard rail. */
export type CourseLearningSignal = {
    readonly id: string
    readonly label: string
    readonly fact: string
    readonly actionLabel: string
    readonly isSelected: boolean
}

/** Props for the accepted supporting-signal list. */
export type CourseLearningSignalsProps =
    | { readonly state: "pending"; readonly props: { readonly label: string } }
    | { readonly state: "empty"; readonly props: { readonly label: string; readonly message: string } }
    | { readonly state: "failed"; readonly props: { readonly label: string; readonly message: string; readonly retryLabel: string } }
    | { readonly state: "ready" | "partial"; readonly props: { readonly label: string; readonly signals: ReadonlyArray<CourseLearningSignal> } }

/** Actions reported by the supporting-signal list. */
export type CourseLearningSignalsActions = {
    readonly select?: (id: string) => void
    readonly retry?: () => void
}

type CourseLearningSignalsInput = CourseLearningSignalsProps & { readonly on?: CourseLearningSignalsActions }

type CourseLearningSignalListData = SurfaceListCardData & {
    readonly signals: ReadonlyArray<CourseLearningSignal>
}

type CourseLearningSignalListProps = LeafProps<CourseLearningSignalListData, SurfaceListCardActions>

const RESTING_COUNT = CONTRACTS["course-learning-signal-list"].children.signal.restingCount

const CourseLearningSignalListView = ({ props, on, isLoading = false }: CourseLearningSignalListProps) => {
    const rows = isLoading
        ? Array.from({ length: RESTING_COUNT }, (_, index) => ({ id: `resting-${index}`, label: "", fact: "", actionLabel: "", isSelected: false }))
        : props.signals
    return (
        <Tree
            contract="course-learning-signal-list"
            render={defineContractComponent("course-learning-signal-list", {
                signal: rows.map((row) => defineContractComponent("course-learning-signal-row", {
                    label: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                        <Text props={{ content: row.label, size: "sm", weight: "medium" }} isLoading={isLoading} />
                    )),
                    fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: row.fact, size: "xs", tone: "muted" }} isLoading={isLoading} />
                    )),
                    action: isLoading ? undefined : defineLeafComponent("button", {}, () => (
                        <Button
                            props={{ label: row.actionLabel, size: "sm", variant: row.isSelected ? "primary" : "tertiary" }}
                            on={{ press: on?.[`select:${row.id}`] }}
                        />
                    )),
                })),
            })}
        />
    )
}

const CourseLearningSignalList = defineContractComponent("course-learning-signal-list", CourseLearningSignalListView)

/** Draw due review, continuity and standing as continuously visible supporting signals. */
export const CourseLearningSignals = (input: CourseLearningSignalsInput) => {
    if (input.state === "failed" || input.state === "empty") {
        return (
            <SurfaceCard
                props={{ label: input.props.label }}
                contract="empty-notice-card"
                render={defineContractComponent("empty-notice-card", {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{
                                icon: "league",
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
    const signals = input.state === "pending" ? [] : input.props.signals
    const on = signals.reduce<SurfaceListCardActions>((all, signal) => ({
        ...all,
        [`select:${signal.id}`]: () => input.on?.select?.(signal.id),
    }), {})
    return (
        <SurfaceListCard
            props={{ label: input.props.label, signals }}
            on={on}
            contract="course-learning-signal-list"
            render={CourseLearningSignalList}
            isLoading={isLoading}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
