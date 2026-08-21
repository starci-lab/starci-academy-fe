import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import type { FlashcardSessionMode } from "@/modules/api/graphql/queries/query-my-in-progress-flashcard-session"

/** Finite transport and work states of one persisted flashcard session. */
export type CourseFlashcardSessionState = "pending" | "active" | "syncing" | "completing" | "expired" | "failed"

/** Resolved cloze sentence, answer terms and objective checked coverage. */
export type CourseFlashcardClozeData = {
    readonly text: string
    readonly blanks: ReadonlyArray<string>
    readonly bank: ReadonlyArray<string>
    readonly selected: ReadonlyArray<string>
    readonly checked: boolean
    readonly correctCount: number
}

/** Display data for review, cloze quiz and plain-flip fallback cards. */
export type CourseFlashcardSessionPageData = {
    readonly mode: FlashcardSessionMode
    readonly title: string
    readonly progressText: string
    readonly deckTitle?: string
    readonly level?: string | null
    readonly prompt?: string
    readonly answer?: string
    readonly answerVisible: boolean
    readonly cloze?: CourseFlashcardClozeData
    readonly solutionVisible: boolean
    readonly revealLabel: string
    readonly clozeInstructionLabel: string
    readonly wordBankLabel: string
    readonly checkAnswerLabel: string
    readonly showSolutionLabel: string
    readonly resultLabel: string
    readonly ratingLabel: string
    readonly againLabel: string
    readonly hardLabel: string
    readonly goodLabel: string
    readonly easyLabel: string
    readonly syncingLabel: string
    readonly completingLabel: string
    readonly expiredText: string
    readonly failedText: string
    readonly retryLabel: string
    readonly leaveLabel: string
}

/** User actions supported by the live session's current phase. */
export type CourseFlashcardSessionPageActions = {
    readonly reveal: () => void
    readonly selectTerm: (term: string) => void
    readonly checkQuiz: () => void
    readonly showSolution: () => void
    readonly rate: (grade: 0 | 1 | 2 | 3) => void
    readonly retry: () => void
    readonly leave: () => void
}

/** Pure live-session input after route transport and local phase resolve. */
export type CourseFlashcardSessionPageProps = {
    readonly state: CourseFlashcardSessionState
    readonly data: CourseFlashcardSessionPageData
    readonly on: CourseFlashcardSessionPageActions
}

/** Draw one focused review or quiz session with only phase-legal controls. */
export const CourseFlashcardSessionPageBase = ({ state, data, on }: CourseFlashcardSessionPageProps) => {
    const isLoading = state === "pending"
    const settledFailure = state === "failed" || state === "expired"
    const cloze = data.mode === "quiz" ? data.cloze : undefined
    const fallbackQuiz = data.mode === "quiz" && cloze === undefined
    const mayRate = state === "active" && data.answerVisible && (data.mode === "review" || fallbackQuiz || data.solutionVisible)
    const header = defineContractComponent("flashcard-session-header", {
        deck: data.deckTitle === undefined ? undefined : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: data.deckTitle, size: "sm", tone: "muted" }} isLoading={isLoading} />),
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: data.title, level: 1 }} isLoading={isLoading} />),
        leave: defineLeafComponent("button", {}, () => <Button props={{ label: data.leaveLabel, variant: "outline" }} on={{ press: on.leave }} />),
    })
    const progress = settledFailure ? undefined : defineContractComponent("label-with-muted-fact-row", {
        label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: data.progressText, size: "sm", weight: "semibold" }} isLoading={isLoading} />),
        fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: data.level ?? undefined, size: "xs", tone: "muted" }} isLoading={isLoading} />),
    })
    const card = settledFailure ? undefined : defineContractComponent("flashcard-session-card", {
        prompt: defineLeafComponent("text", { size: "md", weight: "medium" }, () => <Text props={{ content: data.prompt, size: "md", weight: "medium" }} isLoading={isLoading} />),
        instruction: cloze === undefined ? undefined : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: data.clozeInstructionLabel, size: "xs", tone: "muted" }} />),
        cloze: cloze === undefined ? undefined : defineLeafComponent("text", { size: "md" }, () => <Text props={{ content: cloze.text, size: "md" }} />),
        bankLabel: cloze === undefined || cloze.checked ? undefined : defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: data.wordBankLabel, size: "sm", weight: "semibold" }} />),
        term: cloze === undefined || cloze.checked ? undefined : cloze.bank.filter((term) => !cloze.selected.includes(term)).map((term) => defineLeafComponent("button", {}, () => <Button props={{ label: term, size: "sm", variant: "outline" }} on={{ press: () => on.selectTerm(term) }} />)),
        result: cloze?.checked !== true ? undefined : defineLeafComponent("text", { size: "sm", weight: "medium" }, () => <Text props={{ content: `${cloze.correctCount} / ${cloze.blanks.length} ${data.resultLabel}`, size: "sm", weight: "medium" }} />),
        answer: data.answerVisible ? defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: data.answer, size: "sm", tone: "muted" }} />) : undefined,
        check: cloze === undefined || cloze.checked ? undefined : defineLeafComponent("button", {}, () => <Button props={{ label: data.checkAnswerLabel, variant: "primary", disabled: cloze.selected.length < cloze.blanks.length }} on={{ press: on.checkQuiz }} />),
        solution: cloze?.checked !== true || data.solutionVisible ? undefined : defineLeafComponent("button", {}, () => <Button props={{ label: data.showSolutionLabel, variant: "outline" }} on={{ press: on.showSolution }} />),
    })
    const status = state === "syncing" || state === "completing" ? defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: state === "syncing" ? data.syncingLabel : data.completingLabel, size: "sm", tone: "muted", live: "polite" }} />) : undefined
    const actions = state !== "active" ? undefined
        : cloze !== undefined ? mayRate ? ([data.againLabel, data.hardLabel, data.goodLabel, data.easyLabel] as const).map((label, grade) => defineLeafComponent("button", {}, () => <Button props={{ label, variant: grade === 2 ? "primary" : "outline" }} on={{ press: () => on.rate(grade as 0 | 1 | 2 | 3) }} />)) : undefined
            : !data.answerVisible ? [defineLeafComponent("button", {}, () => <Button props={{ label: data.revealLabel, variant: "primary" }} on={{ press: on.reveal }} />)]
                : ([data.againLabel, data.hardLabel, data.goodLabel, data.easyLabel] as const).map((label, grade) => defineLeafComponent("button", {}, () => <Button props={{ label, variant: grade === 2 ? "primary" : "outline" }} on={{ press: () => on.rate(grade as 0 | 1 | 2 | 3) }} />))
    const notice = settledFailure ? defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ message: state === "expired" ? data.expiredText : data.failedText, actionLabel: data.retryLabel }} on={{ act: on.retry }} />) : undefined

    return <Tree contract="course-flashcard-session-page" render={defineContractComponent("course-flashcard-session-page", { header, progress, card, status, action: actions, notice })} />
}

/** Canon ownership marker for the pure live-session page. */
export const meta = { world: "pure", domain: "learn" } as const
