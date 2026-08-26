import { SurfaceCard as GrammarSurfaceCard } from "@starci/grammar/core"
import { Tree } from "@/components/branches/Tree"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardActions, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { ButtonStateSample } from "@/components/leaves/ButtonStateSample"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent, type LeafProps } from "@/components/contracts/props"
import type { FlashcardSessionMode } from "@/modules/api/graphql/queries/query-my-in-progress-flashcard-session"

/** Finite transport and work states of one persisted flashcard session. */
export type CourseFlashcardSessionBlockState = "pending" | "active" | "syncing" | "completing" | "expired" | "failed"

/** Resolved cloze sentence, answer terms and objective checked coverage. */
export type CourseFlashcardClozeData = {
    readonly text: string
    readonly blanks: ReadonlyArray<string>
    readonly bank: ReadonlyArray<string>
    readonly selected: ReadonlyArray<string>
    readonly checked: boolean
    readonly correctCount: number
}

/** One position in the persisted session, independently of the card currently being inspected. */
export type CourseFlashcardQuestionItem = {
    readonly position: number
    readonly state: "answered" | "current" | "future"
    readonly selected: boolean
    readonly disabled: boolean
}

/** Display data for review, cloze quiz and plain-flip fallback cards. */
export type CourseFlashcardSessionBlockData = {
    readonly mode: FlashcardSessionMode
    readonly title: string
    readonly currentCard: number
    readonly progressCard: number
    readonly totalCards: number
    readonly progressText: string
    readonly readOnly: boolean
    readonly questions: ReadonlyArray<CourseFlashcardQuestionItem>
    readonly breadcrumbLabel: string
    readonly modeBreadcrumbLabel: string
    readonly taskBreadcrumbLabel: string
    readonly courseTitle?: string
    readonly deckTitle?: string
    readonly level?: string | null
    readonly prompt?: string
    readonly answer?: string
    readonly answerAvailable: boolean
    readonly answerVisible: boolean
    readonly cloze?: CourseFlashcardClozeData
    readonly solutionVisible: boolean
    readonly revealLabel: string
    readonly promptLabel: string
    readonly answerLabel: string
    readonly answerUnavailableLabel: string
    readonly answerUnavailableText: string
    readonly sessionSummaryLabel: string
    readonly modeLabel: string
    readonly deckLabel: string
    readonly levelLabel: string
    readonly navigatorTitle: string
    readonly navigatorDescription: string
    readonly navigatorStateLabel: string
    readonly answeredLabel: string
    readonly selectedLabel: string
    readonly currentLabel: string
    readonly futureLabel: string
    readonly readOnlyLabel: string
    readonly readOnlyText: string
    readonly previousLabel: string
    readonly nextLabel: string
    readonly continueHint: string
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
export type CourseFlashcardSessionBlockActions = {
    readonly reveal: () => void
    readonly selectTerm: (term: string) => void
    readonly checkQuiz: () => void
    readonly showSolution: () => void
    readonly rate: (grade: 0 | 1 | 2 | 3) => void
    readonly selectQuestion: (position: number) => void
    readonly previous: () => void
    readonly next: () => void
    readonly openCourse: () => void
    readonly openMode: () => void
    readonly retry: () => void
    readonly leave: () => void
}

/** Pure live-session input after route transport and local phase resolve. */
export type CourseFlashcardSessionBlockProps = {
    readonly blockState: CourseFlashcardSessionBlockState
    readonly data: CourseFlashcardSessionBlockData
    readonly on: CourseFlashcardSessionBlockActions
}
/** Compatibility name for the route's pure input contract. */
export type CourseFlashcardSessionPageProps = CourseFlashcardSessionBlockProps
/** Compatibility name for the route's presentation data. */
export type CourseFlashcardSessionPageData = CourseFlashcardSessionBlockData
/** Compatibility name for the route's presentation actions. */
export type CourseFlashcardSessionPageActions = CourseFlashcardSessionBlockActions

/** Draw one focused review or quiz session with only phase-legal controls. */
export const CourseFlashcardSessionBlockBase = ({ blockState, data, on }: CourseFlashcardSessionBlockProps) => {
    const isLoading = blockState === "pending"
    const settledFailure = blockState === "failed" || blockState === "expired"
    const cloze = data.mode === "quiz" ? data.cloze : undefined
    const fallbackQuiz = data.mode === "quiz" && cloze === undefined
    const answerAvailable = data.answerAvailable && typeof data.answer === "string" && data.answer.trim().length > 0
    const mayRate = blockState === "active" && !data.readOnly && data.answerVisible && answerAvailable && (data.mode === "review" || fallbackQuiz || data.solutionVisible)
    const header = defineContractComponent("flashcard-session-header", {
        identity: defineContractComponent("page-header-stack", {
            trail: defineLeafComponent("breadcrumbs", {}, () => <Breadcrumbs
                props={{
                    label: data.breadcrumbLabel,
                    showFullTrail: true,
                    steps: [
                        { id: "course", label: data.courseTitle ?? "" },
                        { id: "mode", label: data.modeBreadcrumbLabel },
                        { id: "session", label: data.taskBreadcrumbLabel },
                    ],
                }}
                on={isLoading || data.courseTitle === undefined ? undefined : { course: on.openCourse, mode: on.openMode }}
                isLoading={isLoading}
            />),
            title: defineLeafComponent("heading", {}, () => <Heading props={{ content: data.title, level: 1 }} isLoading={isLoading} />),
        }),
        leave: defineLeafComponent("button", {}, () => <Button props={{ label: data.leaveLabel, variant: "outline", disabled: blockState === "syncing" || blockState === "completing" }} on={{ press: on.leave }} />),
    })
    const progressValue = data.totalCards === 0 ? 0 : Math.round(data.progressCard / data.totalCards * 100)
    const progress = settledFailure ? undefined : defineContractComponent("label-fact-over-progress", {
        line: defineContractComponent("label-with-muted-fact-row", {
            label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: data.progressText, size: "sm", weight: "semibold" }} isLoading={isLoading} />),
            fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: `${progressValue}%`, size: "xs", tone: "muted" }} isLoading={isLoading} />),
        }),
        progress: defineLeafComponent("progress", {}, () => <Progress props={{ label: data.progressText, value: progressValue }} isLoading={isLoading} />),
    })
    const quizFullyCorrect = cloze?.checked === true && cloze.correctCount === cloze.blanks.length
    const answerUnavailable = data.answerVisible && !answerAvailable && cloze?.checked !== true
    const feedbackContract = cloze?.checked === true
        ? quizFullyCorrect ? "flashcard-session-feedback-success" as const : "flashcard-session-feedback-warning" as const
        : answerUnavailable ? "flashcard-session-feedback-unavailable" as const : "flashcard-session-feedback-neutral" as const
    const feedback = !data.answerVisible && cloze?.checked !== true ? undefined : defineContractComponent(feedbackContract, {
        copy: defineContractComponent("flashcard-session-feedback-copy", {
            label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: cloze?.checked === true ? `${cloze.correctCount} / ${cloze.blanks.length} ${data.resultLabel}` : answerAvailable ? data.answerLabel : data.answerUnavailableLabel, size: "sm", weight: "semibold" }} />),
            answer: data.answerVisible ? defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: answerAvailable ? data.answer : data.answerUnavailableText, size: "sm" }} />) : undefined,
            context: data.readOnly && data.answerVisible ? defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: data.readOnlyText, size: "xs", tone: "muted" }} />) : undefined,
        }),
    })
    const card = settledFailure ? undefined : defineContractComponent("flashcard-session-card", {
        label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: data.promptLabel, size: "xs", tone: "muted" }} isLoading={isLoading} />),
        prompt: defineLeafComponent("text", { size: "md", weight: "medium" }, () => <Text props={{ content: data.prompt, size: "md", weight: "medium" }} isLoading={isLoading} />),
        instruction: cloze === undefined ? undefined : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: data.clozeInstructionLabel, size: "xs", tone: "muted" }} />),
        cloze: cloze === undefined ? undefined : defineLeafComponent("text", { size: "md" }, () => <Text props={{ content: cloze.text, size: "md" }} />),
        bankLabel: cloze === undefined || cloze.checked ? undefined : defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: data.wordBankLabel, size: "sm", weight: "semibold" }} />),
        term: cloze === undefined || cloze.checked ? undefined : cloze.bank.filter((term) => !cloze.selected.includes(term)).map((term) => defineLeafComponent("button", {}, () => <Button props={{ label: term, size: "sm", variant: "outline" }} on={{ press: () => on.selectTerm(term) }} />)),
        feedback,
        check: cloze === undefined || cloze.checked ? undefined : defineLeafComponent("button", {}, () => <Button props={{ label: data.checkAnswerLabel, variant: "primary", disabled: cloze.selected.length < cloze.blanks.length }} on={{ press: on.checkQuiz }} />),
        solution: cloze?.checked !== true || data.solutionVisible ? undefined : defineLeafComponent("button", {}, () => <Button props={{ label: data.showSolutionLabel, variant: "outline" }} on={{ press: on.showSolution }} />),
    })
    const status = blockState === "syncing" || blockState === "completing" ? defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: blockState === "syncing" ? data.syncingLabel : data.completingLabel, size: "sm", tone: "muted", live: "polite" }} />) : undefined
    const actions = !mayRate ? undefined : ([data.againLabel, data.hardLabel, data.goodLabel, data.easyLabel] as const).map((label, grade) => defineLeafComponent("button", {}, () => <Button props={{ label, variant: grade === 2 ? "primary" : "outline" }} on={{ press: () => on.rate(grade as 0 | 1 | 2 | 3) }} />))
    const reveal = blockState === "active" && !data.readOnly && cloze === undefined && !data.answerVisible
        ? defineContractComponent("flashcard-session-reveal-action", {
            action: defineLeafComponent("button", {}, () => <Button props={{ label: data.revealLabel, variant: "primary" }} on={{ press: on.reveal }} />),
        })
        : undefined
    const rating = actions === undefined ? undefined : defineContractProjection("flashcard-session-rating-panel", () => (
        <SurfaceCard
            props={{ label: data.ratingLabel }}
            contract="flashcard-session-rating-panel"
            render={defineContractComponent("flashcard-session-rating-panel", {
                actions: defineContractComponent("flashcard-session-rating-actions", { action: actions }),
            })}
        />
    ))
    const contextRows = [
        { label: data.modeLabel, value: data.title },
        ...(data.deckTitle === undefined ? [] : [{ label: data.deckLabel, value: data.deckTitle }]),
        ...(data.level == null ? [] : [{ label: data.levelLabel, value: data.level }]),
    ]
    const questionButtons = data.questions.map((question) => defineLeafComponent("button", {}, () => (
        <Button
            props={{
                label: String(question.position),
                size: "sm",
                variant: question.state === "current" ? "primary" : question.selected ? "secondary" : question.state === "answered" ? "outline" : "tertiary",
                disabled: question.disabled,
            }}
            on={{ press: () => on.selectQuestion(question.position) }}
        />
    )))
    const stateLegendItem = (label: string, sample: string, variant: "primary" | "secondary" | "tertiary" | "outline", disabled = false) => defineContractComponent("button-treatment-with-label", {
        mark: defineLeafComponent("button-state-sample", {}, () => <ButtonStateSample props={{ label: sample, variant, disabled }} />),
        label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: label, size: "xs", tone: "muted" }} />),
    })
    const sessionContextList = defineContractComponent("flashcard-session-context-list", (input: LeafProps<SurfaceListCardData, SurfaceListCardActions>) => {
        void input
        return <Tree
            contract="flashcard-session-context-list"
            render={defineContractComponent("flashcard-session-context-list", {
                fact: contextRows.map((row) => defineContractComponent("flashcard-session-context-row", {
                    label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: row.label, size: "xs", tone: "muted" }} />),
                    value: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => <Text props={{ content: row.value, size: "sm", weight: "medium" }} isLoading={isLoading} />),
                })),
            })}
        />
    })
    const rail = settledFailure ? undefined : defineContractComponent("flashcard-session-rail", {
        map: defineContractProjection("flashcard-session-navigation-panel", () => (
            <SurfaceCard
                props={{ label: data.navigatorTitle }}
                contract="flashcard-session-navigation-panel"
                render={defineContractComponent("flashcard-session-navigation-panel", {
                    description: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: data.navigatorDescription, size: "xs", tone: "muted" }} />),
                    questions: defineContractComponent("flashcard-session-question-grid", { question: questionButtons }),
                })}
            />
        )),
        state: defineContractProjection("flashcard-session-navigation-legend", () => (
            <SurfaceCard
                props={{ label: data.navigatorStateLabel }}
                contract="flashcard-session-navigation-legend"
                render={defineContractComponent("flashcard-session-navigation-legend", {
                    answered: stateLegendItem(data.answeredLabel, "1", "outline"),
                    selected: stateLegendItem(data.selectedLabel, "2", "secondary"),
                    current: stateLegendItem(data.currentLabel, "3", "primary"),
                    future: stateLegendItem(data.futureLabel, "4", "tertiary", true),
                })}
            />
        )),
        facts: defineContractProjection("flashcard-session-context-list", () => (
            <SurfaceListCard
                props={{ label: data.sessionSummaryLabel }}
                contract="flashcard-session-context-list"
                render={sessionContextList}
            />
        )),
    })
    const previousDisabled = !data.questions.some((question) => question.position < data.currentCard && !question.disabled)
    const nextDisabled = !data.questions.some((question) => question.position > data.currentCard && !question.disabled)
    const navigation = defineContractComponent("flashcard-session-navigation-actions", {
        previous: defineLeafComponent("button", {}, () => <Button props={{ label: data.previousLabel, variant: "outline", disabled: previousDisabled }} on={{ press: on.previous }} />),
        hint: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: data.readOnly ? data.navigatorDescription : data.continueHint, size: "xs", tone: "muted" }} />),
        next: defineLeafComponent("button", {}, () => <Button props={{ label: data.nextLabel, variant: "outline", disabled: nextDisabled }} on={{ press: on.next }} />),
    })
    const workspace = card === undefined || rail === undefined ? undefined : defineContractComponent("flashcard-session-workspace", {
        primary: defineContractComponent("flashcard-session-primary-column", {
            card: defineContractProjection("flashcard-session-card", () => (
                <SurfaceCard contract="flashcard-session-card" render={card} />
            )),
            reveal,
            rating,
            status,
            navigation,
        }),
        rail,
    })
    const notice = settledFailure ? defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ message: blockState === "expired" ? data.expiredText : data.failedText, actionLabel: data.retryLabel }} on={{ act: on.retry }} />) : undefined
    const grammarState = blockState === "failed" ? "negative" : blockState === "expired" ? "unavailable" : blockState === "active" ? "neutral" : "pending"

    return <GrammarSurfaceCard ariaLabel={data.title} frame="frameless" state={grammarState}>
        <Tree contract={"course-flashcard-session-page"} render={defineContractComponent("course-flashcard-session-page", {
            header,
            progress,
            workspace,
            notice,
        })} />
    </GrammarSurfaceCard>
}

/** Canon ownership marker for the pure live-session page. */
export const meta = { world: "pure", domain: "learn" } as const
