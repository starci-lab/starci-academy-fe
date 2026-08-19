import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
} from "@/components/contracts/props"
import type { FlashcardSessionMode } from "@/modules/api/graphql/queries/query-my-in-progress-flashcard-session"

/** One resolved weak-topic row from a persisted result projection. */
export type CourseFlashcardResultWeakTopic = {
    readonly tag: string
    readonly value: string
}

/** Pure result input after its route-specific projection resolves. */
export type CourseFlashcardResultPageProps = {
    readonly state: "pending" | "ready" | "failed"
    readonly data: {
        readonly mode: FlashcardSessionMode
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
export const CourseFlashcardResultPageBase = (input: CourseFlashcardResultPageProps) => {
    const { state, data, on } = input
    const isLoading = state === "pending"
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
    const stats = state === "failed"
        ? undefined
        : statValues.map(([label, value]) => defineContractComponent("flashcard-result-stat", {
            label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: label, size: "xs" }} isLoading={isLoading} />
            )),
            value: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: value, level: 2 }} isLoading={isLoading} />
            )),
        }))
    const nextDue = state === "ready" && data.nextDueText !== undefined
        ? defineContractComponent("centred-title-pair", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: data.nextDueLabel, level: 3 }} />
            )),
            description: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: data.nextDueText, size: "sm", weight: "semibold" }} />
            )),
        })
        : undefined
    const grades = state === "ready"
        ? data.gradeRows.map((row) => defineContractComponent("flashcard-result-fact-row", {
            label: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                <Text props={{ content: row.label, size: "sm", weight: "medium" }} />
            )),
            value: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: row.value.toString(), size: "sm", tone: "muted" }} />
            )),
        }))
        : undefined
    const weakTopics = state === "ready"
        ? data.weakTopics.map((topic) => defineContractComponent("flashcard-result-fact-row", {
            label: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                <Text props={{ content: topic.tag, size: "sm", weight: "medium" }} />
            )),
            value: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: topic.value, size: "sm", tone: "muted" }} />
            )),
        }))
        : undefined
    const actions = state === "ready"
        ? [
            defineLeafComponent("button", {}, () => (
                <Button props={{ label: data.backLabel, variant: "outline" }} on={{ press: on.back }} />
            )),
            defineLeafComponent("button", {}, () => (
                <Button props={{ label: data.retrySessionLabel, variant: "primary" }} on={{ press: on.retrySession }} />
            )),
        ]
        : undefined
    const notice = state === "failed"
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{ message: data.failedText, actionLabel: data.retryLabel }}
                on={{ act: on.retryLoad }}
            />
        ))
        : undefined

    return (
        <Tree contract="course-flashcard-result-page" render={defineContractComponent("course-flashcard-result-page", {
            mode: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: data.mode === "review" ? "Review" : "Quiz", size: "sm", tone: "muted" }} />
            )),
            header,
            stat: stats,
            nextDue,
            breakdownTitle: state === "ready" && data.gradeRows.length > 0
                ? defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: data.breakdownTitle, level: 2 }} />
                ))
                : undefined,
            grade: grades,
            weakTopicsTitle: state === "ready" && data.weakTopics.length > 0
                ? defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: data.weakTopicsTitle, level: 2 }} />
                ))
                : undefined,
            weakTopic: weakTopics,
            action: actions,
            notice,
        })} />
    )
}

/** Canon metadata for the pure page half. */
export const meta = { world: "pure", domain: "learn" } as const
