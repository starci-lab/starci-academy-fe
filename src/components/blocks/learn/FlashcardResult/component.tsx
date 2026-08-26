import { SurfaceCard as GrammarSurfaceCard } from "@starci/grammar/core"
import { Tree } from "@/components/branches/Tree"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"
import type { FlashcardSessionMode } from "@/modules/api/graphql/queries/query-my-in-progress-flashcard-session"

/** One resolved weak-topic row from a persisted result projection. */
export type CourseFlashcardResultWeakTopic = {
    readonly tag: string
    readonly value: string
}

/** Pure result input after its route-specific projection resolves. */
export type CourseFlashcardResultBlockState = "pending" | "ready" | "failed"
/** Resolved flashcard result data and route actions owned by the block. */
export type FlashcardResultBlockProps = {
    readonly blockState: CourseFlashcardResultBlockState
    readonly data: {
        readonly mode: FlashcardSessionMode
        readonly modeText: string
        readonly title: string
        readonly subtitle: string
        readonly scoreLabel: string
        readonly scoreText?: string
        readonly reviewedLabel: string
        readonly reviewedText?: string
        readonly xpLabel: string
        readonly xpText?: string
        readonly durationLabel: string
        readonly durationText?: string
        readonly nextDueLabel: string
        readonly nextDueText?: string
        readonly breakdownTitle: string
        readonly gradeRows: ReadonlyArray<{ readonly label: string; readonly value: number }>
        readonly weakTopicsTitle: string
        readonly weakTopics: ReadonlyArray<CourseFlashcardResultWeakTopic>
        readonly failedText: string
        readonly retryLabel: string
        readonly retrySessionLabel: string
        readonly backLabel: string
    }
    readonly on: {
        readonly retryLoad: () => void
        readonly retrySession: () => void
        readonly back: () => void
    }
}

/** Renders the stable review/quiz result URL with score, history, and onward actions. */
export const FlashcardResultBase = (input: FlashcardResultBlockProps) => {
    const { blockState, data, on } = input
    const isLoading = blockState === "pending"
    const statValues = [
        [data.scoreLabel, data.scoreText],
        [data.reviewedLabel, data.reviewedText],
        [data.xpLabel, data.xpText],
        [data.durationLabel, data.durationText],
    ] as const
    const header = defineContractComponent("centred-title-pair", {
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: data.title, level: 1 }} isLoading={isLoading} />
        )),
        description: defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: data.subtitle, size: "sm", tone: "muted" }} isLoading={isLoading} />
        )),
    })
    const stats = blockState === "failed"
        ? undefined
        : statValues.map(([label, value]) => defineContractComponent("flashcard-result-stat", {
            label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: label, size: "xs" }} isLoading={isLoading} />
            )),
            value: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: value, level: 2 }} isLoading={isLoading} />
            )),
        }))
    const nextDue = blockState === "ready" && data.nextDueText !== undefined
        ? defineContractComponent("centred-title-pair", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: data.nextDueLabel, level: 3 }} />
            )),
            description: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: data.nextDueText, size: "sm", weight: "semibold" }} />
            )),
        })
        : undefined
    const grades = blockState === "ready"
        ? data.gradeRows.map((row) => defineContractComponent("flashcard-result-fact-row", {
            label: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                <Text props={{ content: row.label, size: "sm", weight: "medium" }} />
            )),
            value: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: row.value.toString(), size: "sm", tone: "muted" }} />
            )),
        }))
        : undefined
    const weakTopics = blockState === "ready"
        ? data.weakTopics.map((topic) => defineContractComponent("flashcard-result-fact-row", {
            label: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                <Text props={{ content: topic.tag, size: "sm", weight: "medium" }} />
            )),
            value: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: topic.value, size: "sm", tone: "muted" }} />
            )),
        }))
        : undefined
    const actions = blockState === "ready"
        ? [
            defineLeafComponent("button", {}, () => (
                <Button props={{ label: data.retrySessionLabel, variant: "primary" }} on={{ press: on.retrySession }} />
            )),
            defineLeafComponent("button", {}, () => (
                <Button props={{ label: data.backLabel, variant: "outline" }} on={{ press: on.back }} />
            )),
        ]
        : undefined
    const notice = blockState === "failed"
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{ message: data.failedText, actionLabel: data.retryLabel }}
                on={{ act: on.retryLoad }}
            />
        ))
        : undefined
    const grammarState = blockState === "pending" ? "pending" : blockState === "failed" ? "negative" : "affirmative"

    const summary = blockState === "failed" ? undefined : defineContractProjection("flashcard-result-summary-card", () => (
        <SurfaceCard
            contract="flashcard-result-summary-card"
            render={defineContractComponent("flashcard-result-summary-card", {
                mode: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: data.modeText, size: "sm", tone: "muted" }} />
                )),
                header,
                stats: stats === undefined ? undefined : defineContractComponent("flashcard-result-stat-grid", { stat: stats }),
            })}
        />
    ))
    const breakdown = blockState === "ready" && grades !== undefined && grades.length > 0
        ? defineContractProjection("flashcard-result-fact-list", () => (
            <SurfaceCard
                props={{ label: data.breakdownTitle }}
                contract="flashcard-result-fact-list"
                render={defineContractComponent("flashcard-result-fact-list", { fact: grades })}
            />
        ))
        : undefined
    const weakTopicEvidence = blockState === "ready" && weakTopics !== undefined && weakTopics.length > 0
        ? defineContractProjection("flashcard-result-fact-list", () => (
            <SurfaceCard
                props={{ label: data.weakTopicsTitle }}
                contract="flashcard-result-fact-list"
                render={defineContractComponent("flashcard-result-fact-list", { fact: weakTopics })}
            />
        ))
        : undefined
    const body = blockState !== "ready" || actions === undefined ? undefined : defineContractComponent("flashcard-result-body", {
        evidence: defineContractComponent("flashcard-result-evidence-column", {
            breakdown,
            weakTopics: weakTopicEvidence,
        }),
        next: defineContractProjection("flashcard-result-next-action-panel", () => (
            <SurfaceCard
                contract="flashcard-result-next-action-panel"
                render={defineContractComponent("flashcard-result-next-action-panel", {
                    nextDue,
                    action: actions,
                })}
            />
        )),
    })

    return (
        <GrammarSurfaceCard ariaLabel={data.title} frame="frameless" state={grammarState}>
            <Tree contract="flashcard-result-workspace" render={defineContractComponent("flashcard-result-workspace", {
                summary,
                body,
                notice,
            })} />
        </GrammarSurfaceCard>
    )
}

/** Canon metadata for the pure page half. */
export const meta = { world: "pure", domain: "learn" } as const
