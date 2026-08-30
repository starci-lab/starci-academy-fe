import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Article } from "@/components/branches/Article"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import type { FlashcardSessionMode } from "@/modules/api/graphql/queries/query-my-in-progress-flashcard-session"
import {
    sessionActionRowClassName,
    sessionAnswerClassName,
    sessionBlankClassName,
    sessionGridClassName,
    sessionHeaderActionsClassName,
    sessionHeaderClassName,
    sessionHeaderCopyClassName,
    sessionMetaClassName,
    sessionNavigationActionsClassName,
    sessionNavigatorClassName,
    sessionPromptBodyClassName,
    sessionPromptClassName,
    sessionQuestionGridClassName,
    sessionRatingClassName,
    sessionRatingHintClassName,
    sessionReadOnlyNoticeClassName,
    sessionRecoveryClassName,
    sessionTaskColumnClassName,
    sessionWordBankClassName,
    sessionWorkspaceClassName,
} from "./classNames"

/** Finite transport and work states. */
export type CourseFlashcardSessionBlockState = "pending" | "active" | "syncing" | "completing" | "expired" | "failed"
/** Server-owned cloze sentence, targets and opaque token assignments. */
export type CourseFlashcardClozeData = {
    readonly text: string
    readonly blanks: ReadonlyArray<{ readonly id: string; readonly hint?: string | null }>
    readonly bank: ReadonlyArray<{ readonly id: string; readonly label: string }>
    readonly selected: ReadonlyArray<{ readonly blankId: string; readonly tokenId: string; readonly label: string }>
    readonly isFinal: boolean
}
/** One position in the persisted session. */
export type CourseFlashcardQuestionItem = { readonly position: number; readonly state: "answered" | "current" | "future"; readonly selected: boolean; readonly disabled: boolean }
/** Display data for the session card. */
export type CourseFlashcardSessionBlockData = { readonly mode: FlashcardSessionMode; readonly title: string; readonly currentCard: number; readonly progressCard: number; readonly totalCards: number; readonly progressText: string; readonly progressLabel?: string; readonly focusModeLabel?: string; readonly readOnly: boolean; readonly questions: ReadonlyArray<CourseFlashcardQuestionItem>; readonly breadcrumbLabel: string; readonly modeBreadcrumbLabel: string; readonly taskBreadcrumbLabel: string; readonly courseTitle?: string; readonly deckTitle?: string; readonly level?: string | null; readonly prompt?: string; readonly answer?: string; readonly answerAvailable: boolean; readonly answerVisible: boolean; readonly cloze?: CourseFlashcardClozeData; readonly solutionVisible: boolean; readonly revealLabel: string; readonly promptLabel: string; readonly answerLabel: string; readonly answerUnavailableLabel: string; readonly answerUnavailableText: string; readonly sessionSummaryLabel: string; readonly modeLabel: string; readonly deckLabel: string; readonly levelLabel: string; readonly navigatorTitle: string; readonly navigatorDescription: string; readonly navigatorStateLabel: string; readonly answeredLabel: string; readonly selectedLabel: string; readonly currentLabel: string; readonly futureLabel: string; readonly readOnlyLabel: string; readonly readOnlyText: string; readonly previousLabel: string; readonly nextLabel: string; readonly continueHint: string; readonly clozeInstructionLabel: string; readonly wordBankLabel: string; readonly blankLabel: string; readonly hintLabel: string; readonly checkAnswerLabel: string; readonly showSolutionLabel: string; readonly resultLabel: string; readonly ratingLabel: string; readonly againLabel: string; readonly hardLabel: string; readonly goodLabel: string; readonly easyLabel: string; readonly pendingRating: 0 | 1 | 2 | 3 | null; readonly syncingLabel: string; readonly completingLabel: string; readonly expiredText: string; readonly failedText: string; readonly retryLabel: string; readonly leaveLabel: string }
/** User actions supported by the live session. */
export type CourseFlashcardSessionBlockActions = { readonly reveal: () => void; readonly selectTerm: (term: string) => void; readonly checkQuiz: () => void; readonly showSolution: () => void; readonly rate: (grade: 0 | 1 | 2 | 3) => void; readonly selectQuestion: (position: number) => void; readonly previous: () => void; readonly next: () => void; readonly openCourse: () => void; readonly openMode: () => void; readonly retry: () => void; readonly leave: () => void }
/** Pure session renderer input. */
export type CourseFlashcardSessionBlockProps = { readonly blockState: CourseFlashcardSessionBlockState; readonly data: CourseFlashcardSessionBlockData; readonly on: CourseFlashcardSessionBlockActions }
/** Legacy-named alias for session presentation data. */
export type CourseFlashcardSessionPageData = CourseFlashcardSessionBlockData
/** Legacy-named alias for session actions. */
export type CourseFlashcardSessionPageActions = CourseFlashcardSessionBlockActions

const stateLabelOf = (item: CourseFlashcardQuestionItem, data: CourseFlashcardSessionBlockData) => {
    if (item.selected && item.state === "answered") return data.selectedLabel
    if (item.state === "answered") return data.answeredLabel
    if (item.state === "current") return data.currentLabel
    return data.futureLabel
}

/** Keep authored comma-separated hints readable even when source content omits spaces. */
const readableHint = (hint: string) => hint.replace(/,(?=\S)/g, ", ")

/** Draw one focused review or quiz session with phase-legal controls. */
export const CourseFlashcardSessionBlockBase = (props: CourseFlashcardSessionBlockProps) => {
    const data = props.data
    const loading = props.blockState === "pending"
    const cloze = data.mode === "quiz" ? data.cloze : undefined
    const availableTokens = cloze?.bank.filter((token) => !cloze.selected.some((selection) => selection.tokenId === token.id)) ?? []
    const answerAvailable = data.answerAvailable && typeof data.answer === "string" && data.answer.trim() !== ""
    const workPending = props.blockState === "syncing" || props.blockState === "completing"
    const canRate = props.blockState === "active" && !data.readOnly && data.mode === "review" && data.answerVisible && answerAvailable
    const statusText = props.blockState === "syncing" ? data.syncingLabel : props.blockState === "completing" ? data.completingLabel : undefined

    if (props.blockState === "failed" || props.blockState === "expired") {
        return <main aria-label={data.title} className={sessionWorkspaceClassName}><SurfaceCard><section className={sessionRecoveryClassName}>
            <Heading props={{ content: data.title, level: 1 }} />
            <Text props={{ content: props.blockState === "failed" ? data.failedText : data.expiredText, size: "md" }} />
            <div className={sessionActionRowClassName}><Button props={{ label: data.retryLabel, variant: "primary" }} on={{ press: props.on.retry }} /><Button props={{ label: data.leaveLabel, variant: "outline" }} on={{ press: props.on.openMode }} /></div>
        </section></SurfaceCard></main>
    }

    return <main aria-label={data.title} className={sessionWorkspaceClassName}>
        <header className={sessionHeaderClassName}>
            <div className={sessionHeaderCopyClassName}>
                <Breadcrumbs props={{ label: data.breadcrumbLabel, showFullTrail: true, steps: [{ id: "course", label: data.courseTitle ?? "" }, { id: "mode", label: data.modeBreadcrumbLabel }, { id: "session", label: data.taskBreadcrumbLabel }] }} on={loading ? undefined : { course: props.on.openCourse, mode: props.on.openMode }} isLoading={loading} />
                <Heading props={{ content: data.title, level: 1 }} isLoading={loading} />
                <Text props={{ content: data.progressText, size: "sm", tone: "muted" }} isLoading={loading} />
            </div>
            <div className={sessionHeaderActionsClassName}>{data.focusModeLabel === undefined ? null : <Text props={{ content: data.focusModeLabel, size: "xs", weight: "semibold" }} />}{statusText === undefined ? null : <Text props={{ content: statusText, size: "sm", tone: "accent", live: "polite" }} />}<Button props={{ label: data.leaveLabel, variant: "outline", disabled: workPending }} on={{ press: props.on.leave }} isLoading={loading} /></div>
        </header>
        <Progress props={{ label: data.progressLabel ?? data.progressText, value: data.totalCards === 0 ? 0 : Math.round(data.progressCard / data.totalCards * 100) }} isLoading={loading} />
        <div className={sessionGridClassName}>
            <div className={sessionTaskColumnClassName}>
                <SurfaceCard props={{ label: data.promptLabel }} isLoading={loading}><section className={sessionPromptClassName} aria-label={data.promptLabel}>
                    <div className={sessionMetaClassName}>
                        <Text props={{ content: `${data.modeLabel}: ${data.modeBreadcrumbLabel}`, size: "xs" }} isLoading={loading} />
                        {data.deckTitle === undefined ? null : <Text props={{ content: `${data.deckLabel}: ${data.deckTitle}`, size: "xs" }} isLoading={loading} />}
                        {data.level == null ? null : <Text props={{ content: `${data.levelLabel}: ${data.level}`, size: "xs" }} isLoading={loading} />}
                    </div>
                    <div className={sessionPromptBodyClassName}>
                        {data.readOnly ? <div className={sessionReadOnlyNoticeClassName}><Text props={{ content: data.readOnlyLabel, size: "sm", weight: "semibold" }} /><Text props={{ content: data.readOnlyText, size: "sm", tone: "muted" }} /></div> : null}
                        {cloze === undefined ? <Article props={{ body: data.prompt, measure: "compact" }} isLoading={loading} /> : null}
                        {cloze === undefined ? null : <>
                            <Text props={{ content: data.clozeInstructionLabel, size: "sm", tone: "muted" }} />
                            <Article props={{ body: cloze.text, measure: "compact" }} />
                            <div className={sessionAnswerClassName}>
                                {cloze.blanks.map((blank, position) => {
                                    const selection = cloze.selected.find((item) => item.blankId === blank.id)
                                    return <div key={blank.id} className={sessionBlankClassName}><Button props={{ label: selection?.label ?? `${data.blankLabel} ${position + 1}`, size: "sm", variant: selection === undefined ? "outline" : "secondary", disabled: selection === undefined || data.readOnly || workPending }} on={{ press: selection === undefined ? undefined : () => props.on.selectTerm(selection.tokenId) }} />{blank.hint == null ? null : <Text props={{ content: `${data.hintLabel}: ${readableHint(blank.hint)}`, size: "xs", tone: "muted" }} />}</div>
                                })}
                            </div>
                            {availableTokens.length === 0 ? null : <><Text props={{ content: data.wordBankLabel, size: "xs" }} /><div className={sessionWordBankClassName}>{availableTokens.map((token) => <Button key={token.id} props={{ label: token.label, size: "sm", variant: "outline", disabled: data.readOnly || workPending }} on={{ press: () => props.on.selectTerm(token.id) }} />)}</div></>}
                        </>}
                        {data.answerVisible ? <div className={sessionAnswerClassName}><Text props={{ content: answerAvailable ? data.answerLabel : data.answerUnavailableLabel, size: "sm", weight: "semibold" }} />{answerAvailable ? <Article props={{ body: data.answer, measure: "compact" }} /> : <Text props={{ content: data.answerUnavailableText, size: "sm" }} />}</div> : null}
                    </div>
                    <div className={sessionActionRowClassName}>
                        {cloze === undefined && !data.answerVisible ? <Button props={{ label: data.revealLabel, variant: "primary", disabled: workPending }} on={{ press: props.on.reveal }} isLoading={loading} /> : null}
                        {cloze !== undefined && !data.readOnly ? <Button props={{ label: data.checkAnswerLabel, variant: "primary", disabled: cloze.selected.length < cloze.blanks.length || workPending }} on={{ press: props.on.checkQuiz }} isLoading={loading} /> : null}
                    </div>
                </section></SurfaceCard>
                {canRate ? <SurfaceCard props={{ label: data.ratingLabel }}><div className={sessionRatingClassName}>{([data.againLabel, data.hardLabel, data.goodLabel, data.easyLabel] as const).map((label, grade) => <Button key={label} props={{ label, variant: "outline", disabled: workPending, isPending: workPending && data.pendingRating === grade }} on={{ press: () => props.on.rate(grade as 0 | 1 | 2 | 3) }} />)}</div><div className={sessionRatingHintClassName}><Text props={{ content: data.continueHint, size: "xs" }} /></div></SurfaceCard> : null}
            </div>
            <SurfaceCard props={{ label: data.navigatorTitle }}><aside className={sessionNavigatorClassName} aria-label={data.navigatorTitle}>
                <Text props={{ content: data.navigatorDescription, size: "sm", tone: "muted" }} />
                <Text props={{ content: data.navigatorStateLabel, size: "xs" }} />
                <div className={sessionQuestionGridClassName}>{data.questions.map((question) => <Button key={question.position} props={{ label: String(question.position), size: "sm", variant: question.selected ? "primary" : question.state === "current" ? "secondary" : "outline", disabled: question.disabled || workPending }} on={{ press: () => props.on.selectQuestion(question.position) }} />)}</div>
                {data.questions.map((question) => question.selected ? <Text key={question.position} props={{ content: `${question.position}: ${stateLabelOf(question, data)}`, size: "xs", live: "polite" }} /> : null)}
                <div className={sessionNavigationActionsClassName}><Button props={{ label: data.previousLabel, variant: "outline", disabled: data.currentCard <= 1 || workPending }} on={{ press: props.on.previous }} /><Button props={{ label: data.nextLabel, variant: "outline", disabled: data.currentCard >= data.progressCard || workPending }} on={{ press: props.on.next }} /></div>
            </aside></SurfaceCard>
        </div>
    </main>
}
