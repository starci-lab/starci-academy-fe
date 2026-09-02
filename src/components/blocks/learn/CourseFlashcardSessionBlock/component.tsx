import { SurfaceCard } from "@starci/grammar/common"
import { Article } from "@/components/branches/Article"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Button } from "@starci/grammar/common"

import { Heading } from "@starci/grammar/common"
import { Progress } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
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
        return <main aria-label={data.title} className={sessionWorkspaceClassName}><SurfaceCard composition="joined"><section className={sessionRecoveryClassName}>
            <Heading level={1}>{data.title}</Heading>
            <Text size={"md"}>{props.blockState === "failed" ? data.failedText : data.expiredText}</Text>
            <div className={sessionActionRowClassName}><Button variant="primary" onPress={props.on.retry}>{data.retryLabel}</Button><Button variant="outline" onPress={props.on.openMode}>{data.leaveLabel}</Button></div>
        </section></SurfaceCard></main>
    }

    return <main aria-label={data.title} className={sessionWorkspaceClassName}>
        <header className={sessionHeaderClassName}>
            <div className={sessionHeaderCopyClassName}>
                <Breadcrumbs props={{ label: data.breadcrumbLabel, showFullTrail: true, steps: [{ id: "course", label: data.courseTitle ?? "" }, { id: "mode", label: data.modeBreadcrumbLabel }, { id: "session", label: data.taskBreadcrumbLabel }] }} on={loading ? undefined : { course: props.on.openCourse, mode: props.on.openMode }} isLoading={loading} />
                <Heading level={1} isSkeleton={loading}>{data.title}</Heading>
                <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{data.progressText}</Text>
            </div>
            <div className={sessionHeaderActionsClassName}>{data.focusModeLabel === undefined ? null : <Text size={"xs"} weight={"semibold"}>{data.focusModeLabel}</Text>}{statusText === undefined ? null : <Text size={"sm"} tone={"accent"} live={"polite"}>{statusText}</Text>}<Button variant={"outline"} isDisabled={workPending} isSkeleton={loading} onPress={({ press: props.on.leave })?.press}>{data.leaveLabel}</Button></div>
        </header>
        <Progress label={data.progressLabel ?? data.progressText} value={data.totalCards === 0 ? 0 : Math.round(data.progressCard / data.totalCards * 100)} isSkeleton={loading} />
        <div className={sessionGridClassName}>
            <div className={sessionTaskColumnClassName}>
                <SurfaceCard label={data.promptLabel} composition="joined" state={loading ? "pending" : "neutral"}><section className={sessionPromptClassName} aria-label={data.promptLabel}>
                    <div className={sessionMetaClassName}>
                        <Text size={"xs"} isSkeleton={loading}>{`${data.modeLabel}: ${data.modeBreadcrumbLabel}`}</Text>
                        {data.deckTitle === undefined ? null : <Text size={"xs"} isSkeleton={loading}>{`${data.deckLabel}: ${data.deckTitle}`}</Text>}
                        {data.level == null ? null : <Text size={"xs"} isSkeleton={loading}>{`${data.levelLabel}: ${data.level}`}</Text>}
                    </div>
                    <div className={sessionPromptBodyClassName}>
                        {data.readOnly ? <div className={sessionReadOnlyNoticeClassName}><Text size={"sm"} weight={"semibold"}>{data.readOnlyLabel}</Text><Text size={"sm"} tone={"muted"}>{data.readOnlyText}</Text></div> : null}
                        {cloze === undefined ? <Article props={{ body: data.prompt, measure: "compact" }} isLoading={loading} /> : null}
                        {cloze === undefined ? null : <>
                            <Text size={"sm"} tone={"muted"}>{data.clozeInstructionLabel}</Text>
                            <Article props={{ body: cloze.text, measure: "compact" }} />
                            <div className={sessionAnswerClassName}>
                                {cloze.blanks.map((blank, position) => {
                                    const selection = cloze.selected.find((item) => item.blankId === blank.id)
                                    return <div key={blank.id} className={sessionBlankClassName}><Button variant={selection === undefined ? "outline" : "secondary"} size="sm" isDisabled={selection === undefined || data.readOnly || workPending} onPress={selection === undefined ? undefined : () => props.on.selectTerm(selection.tokenId)}>{selection?.label ?? `${data.blankLabel} ${position + 1}`}</Button>{blank.hint == null ? null : <Text size={"xs"} tone={"muted"}>{`${data.hintLabel}: ${readableHint(blank.hint)}`}</Text>}</div>
                                })}
                            </div>
                            {availableTokens.length === 0 ? null : <><Text size={"xs"}>{data.wordBankLabel}</Text><div className={sessionWordBankClassName}>{availableTokens.map((token) => <Button key={token.id} variant="outline" size="sm" isDisabled={data.readOnly || workPending} onPress={() => props.on.selectTerm(token.id)}>{token.label}</Button>)}</div></>}
                        </>}
                        {data.answerVisible ? <div className={sessionAnswerClassName}><Text size={"sm"} weight={"semibold"}>{answerAvailable ? data.answerLabel : data.answerUnavailableLabel}</Text>{answerAvailable ? <Article props={{ body: data.answer, measure: "compact" }} /> : <Text size={"sm"}>{data.answerUnavailableText}</Text>}</div> : null}
                    </div>
                    <div className={sessionActionRowClassName}>
                        {cloze === undefined && !data.answerVisible ? <Button variant={"primary"} isDisabled={workPending} isSkeleton={loading} onPress={({ press: props.on.reveal })?.press}>{data.revealLabel}</Button> : null}
                        {cloze !== undefined && !data.readOnly ? <Button variant={"primary"} isDisabled={cloze.selected.length < cloze.blanks.length || workPending} isSkeleton={loading} onPress={({ press: props.on.checkQuiz })?.press}>{data.checkAnswerLabel}</Button> : null}
                    </div>
                </section></SurfaceCard>
                {canRate ? <SurfaceCard label={data.ratingLabel} composition="joined"><div className={sessionRatingClassName}>{([data.againLabel, data.hardLabel, data.goodLabel, data.easyLabel] as const).map((label, grade) => <Button key={label} variant="outline" isDisabled={workPending} isPending={workPending && data.pendingRating === grade} onPress={() => props.on.rate(grade as 0 | 1 | 2 | 3)}>{label}</Button>)}</div><div className={sessionRatingHintClassName}><Text size={"xs"}>{data.continueHint}</Text></div></SurfaceCard> : null}
            </div>
            <SurfaceCard label={data.navigatorTitle} composition="joined"><aside className={sessionNavigatorClassName} aria-label={data.navigatorTitle}>
                <Text size={"sm"} tone={"muted"}>{data.navigatorDescription}</Text>
                <Text size={"xs"}>{data.navigatorStateLabel}</Text>
                <div className={sessionQuestionGridClassName}>{data.questions.map((question) => <Button key={question.position} variant={question.selected ? "primary" : question.state === "current" ? "secondary" : "outline"} size="sm" isDisabled={question.disabled || workPending} onPress={() => props.on.selectQuestion(question.position)}>{String(question.position)}</Button>)}</div>
                {data.questions.map((question) => question.selected ? <Text key={question.position} size={"xs"} live={"polite"}>{`${question.position}: ${stateLabelOf(question, data)}`}</Text> : null)}
                <div className={sessionNavigationActionsClassName}><Button variant="outline" isDisabled={data.currentCard <= 1 || workPending} onPress={props.on.previous}>{data.previousLabel}</Button><Button variant="outline" isDisabled={data.currentCard >= data.progressCard || workPending} onPress={props.on.next}>{data.nextLabel}</Button></div>
            </aside></SurfaceCard>
        </div>
    </main>
}
