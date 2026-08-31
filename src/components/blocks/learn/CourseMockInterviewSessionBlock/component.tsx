import { ChatWorkspace } from "@starci/grammar/core"
import { ModalBranch } from "@/components/branches/ModalBranch"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { CodeBlock } from "@/components/leaves/CodeBlock"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import { Textarea } from "@/components/leaves/Textarea"
import {
    mockInterviewComposerActionsClassName,
    mockInterviewComposerButtonsClassName,
    mockInterviewComposerClassName,
    mockInterviewConfirmationActionsClassName,
    mockInterviewConfirmationClassName,
    mockInterviewConversationClassName,
    mockInterviewHeaderActionsClassName,
    mockInterviewHeaderClassName,
    mockInterviewHeaderCopyClassName,
    mockInterviewHeaderFactsClassName,
    mockInterviewNoticeClassName,
    mockInterviewQuestionClassName,
    mockInterviewQuestionMetaClassName,
    mockInterviewRoomClassName,
    mockInterviewStateClassName,
    mockInterviewTranscriptClassName,
    mockInterviewTranscriptItemClassName,
    mockInterviewTranscriptListClassName,
} from "./classNames"

/** Data-load state for the live interview workbench. */
export type CourseMockInterviewSessionState = "connecting" | "live" | "syncing" | "expired" | "failed"
/** Active network operation shown by the session composer. */
export type CourseMockInterviewSessionOperation = "streaming" | "syncing" | "grading"
/** One transcript entry rendered in the interview rail. */
export type CourseMockInterviewVisibleTurn = { readonly id: string; readonly role: "interviewer" | "candidate"; readonly label: string; readonly content: string }
/** Learner-facing content and progress for a live interview session. */
export type CourseMockInterviewSessionData = {
    readonly sessionState?: CourseMockInterviewSessionState; readonly operation?: CourseMockInterviewSessionOperation; readonly title: string; readonly journeyLabel?: string; readonly journeyStageLabel?: string
    readonly promptTitle: string; readonly currentQuestionLabel: string; readonly currentQuestion: string; readonly stateLabel: string; readonly counterLabel: string; readonly progressLabel: string; readonly progress: number; readonly remainingLabel?: string
    readonly turns: ReadonlyArray<CourseMockInterviewVisibleTurn>; readonly turnsLabel: string; readonly turnsEmptyLabel: string; readonly transcriptOpenLabel: string; readonly transcriptCloseLabel: string; readonly isTranscriptOpen: boolean
    readonly streamingText?: string; readonly interviewerPendingLabel: string; readonly answerLabel: string; readonly answerPlaceholder: string; readonly answer: string; readonly submitLabel: string; readonly abortLabel: string; readonly leaveLabel: string; readonly finishLabel: string; readonly retryLabel: string
    readonly workspaceLabel: string; readonly workspaceEmptyLabel: string; readonly workspaceCode?: string; readonly notice?: string; readonly syncStatusLabel: string; readonly revisionLabel: string
    readonly finishConfirmationOpen: boolean; readonly finishConfirmationTitle: string; readonly finishConfirmationDescription: string; readonly abandonConfirmationOpen: boolean; readonly abandonConfirmationTitle: string; readonly abandonConfirmationDescription: string; readonly confirmLabel: string; readonly abandonLabel: string; readonly cancelLabel: string
}
/** Interaction callbacks owned by the connected live-session block. */
export type CourseMockInterviewSessionActions = {
    readonly answer?: (value: string) => void; readonly ask?: () => void; readonly abort?: () => void; readonly leave?: () => void; readonly finish?: () => void; readonly retry?: () => void
    readonly dismissConfirmation?: () => void; readonly confirmFinish?: () => void; readonly confirmAbandon?: () => void; readonly setTranscriptOpen?: (isOpen: boolean) => void
}
/** State, data and actions required to render the live interview workbench. */
export type CourseMockInterviewSessionBlockProps = { readonly state: CourseMockInterviewSessionState; readonly props: CourseMockInterviewSessionData; readonly on?: CourseMockInterviewSessionActions }

/** Draw the focused interview room through the published ChatWorkspace composition. */
export const CourseMockInterviewSessionBlockBase = (props: CourseMockInterviewSessionBlockProps) => {
    const data = props.props
    const state = data.sessionState ?? props.state
    if (state === "failed" || state === "expired") return <main className={mockInterviewStateClassName} aria-label={data.title}><SurfaceCard><EmptyNotice props={{ message: data.notice ?? data.retryLabel, actionLabel: data.retryLabel }} on={{ act: props.on?.retry }} /></SurfaceCard></main>
    const busy = state === "connecting" || state === "syncing" || data.operation !== undefined

    const header = <div className={mockInterviewHeaderClassName}>
        <div className={mockInterviewHeaderCopyClassName}>
            <Text props={{ content: data.promptTitle, size: "xs", weight: "semibold" }} />
            <Heading props={{ content: data.title, level: 1 }} />
            <Text props={{ content: data.stateLabel, size: "sm", tone: "muted", live: "polite" }} />
        </div>
        <div className={mockInterviewHeaderActionsClassName}>
            <Button props={{ label: data.finishLabel, variant: "outline", size: "sm", disabled: busy }} on={{ press: props.on?.finish }} />
            <Button props={{ label: data.leaveLabel, variant: "ghost", size: "sm", disabled: busy }} on={{ press: props.on?.leave }} />
        </div>
        <div className={mockInterviewHeaderFactsClassName}>
            <Text props={{ content: data.counterLabel, size: "sm", weight: "semibold" }} />
            <Progress props={{ label: data.progressLabel, value: Math.round(data.progress) }} />
            {data.remainingLabel === undefined ? null : <Text props={{ content: data.remainingLabel, size: "sm", tone: "muted" }} />}
        </div>
    </div>

    const conversation = <section className={mockInterviewConversationClassName} aria-labelledby="mock-interview-current-question">
        <SurfaceCard>
            <article className={mockInterviewQuestionClassName}>
                <div className={mockInterviewQuestionMetaClassName}>
                    <Text props={{ id: "mock-interview-current-question", content: data.currentQuestionLabel, size: "xs", weight: "semibold" }} />
                    <Text props={{ content: data.counterLabel, size: "xs", tone: "muted" }} />
                </div>
                <Heading props={{ content: data.currentQuestion, level: 2 }} />
                {data.streamingText === undefined ? null : <Text props={{ content: data.streamingText, size: "sm", live: "polite" }} />}
                {data.workspaceCode === undefined ? null : <CodeBlock props={{ code: data.workspaceCode, language: "text" }} />}
            </article>
        </SurfaceCard>
    </section>

    const composer = <section className={mockInterviewComposerClassName} aria-label={data.answerLabel}>
        <Textarea key={data.counterLabel} props={{ id: "interview-answer", name: "answer", label: data.answerLabel, placeholder: data.answerPlaceholder, defaultValue: data.answer, rows: 4, disabled: busy }} on={{ change: props.on?.answer }} />
        <div className={mockInterviewComposerActionsClassName}>
            {data.notice === undefined
                ? <Text props={{ content: data.syncStatusLabel, size: "xs", tone: "muted", live: "polite" }} />
                : <div className={mockInterviewNoticeClassName}><Text props={{ content: data.notice, size: "sm", weight: "semibold", live: "assertive" }} /></div>}
            <div className={mockInterviewComposerButtonsClassName}>
                {data.operation === "streaming" ? <Button props={{ label: data.abortLabel, variant: "outline" }} on={{ press: props.on?.abort }} /> : null}
                <Button props={{ label: data.submitLabel, variant: "primary", disabled: busy || data.answer.trim() === "", icon: "next", iconPlacement: "trailing" }} on={{ press: props.on?.ask }} />
            </div>
        </div>
    </section>

    const transcript = <aside className={mockInterviewTranscriptClassName} aria-label={data.turnsLabel}>
        <Heading props={{ content: data.turnsLabel, level: 2 }} />
        <ol className={mockInterviewTranscriptListClassName}>
            {data.turns.length === 0 ? <li className={mockInterviewTranscriptItemClassName}><Text props={{ content: data.turnsEmptyLabel, size: "sm", tone: "muted" }} /></li> : data.turns.map((turn) => <li className={mockInterviewTranscriptItemClassName} data-role={turn.role} key={turn.id}><Text props={{ content: turn.label, size: "xs", tone: "muted", weight: "semibold" }} /><Text props={{ content: turn.content, size: "sm" }} /></li>)}
        </ol>
    </aside>

    return <>
        <main className={mockInterviewRoomClassName} aria-label={data.title}><ChatWorkspace className={mockInterviewRoomClassName} label={data.title} header={header} conversation={conversation} conversationLabel={data.currentQuestionLabel} composer={composer} rail={transcript} railLabel={data.turnsLabel} railOpenLabel={data.transcriptOpenLabel} railCloseLabel={data.transcriptCloseLabel} railWidth="standard" isRailOpen={data.isTranscriptOpen} onRailOpenChange={(isOpen) => props.on?.setTranscriptOpen?.(isOpen)} /></main>
        <ModalBranch isOpen={data.finishConfirmationOpen || data.abandonConfirmationOpen} onDismiss={props.on?.dismissConfirmation ?? (() => undefined)}>
            <section className={mockInterviewConfirmationClassName}>
                <Heading props={{ content: data.finishConfirmationOpen ? data.finishConfirmationTitle : data.abandonConfirmationTitle, level: 2 }} />
                <Text props={{ content: data.finishConfirmationOpen ? data.finishConfirmationDescription : data.abandonConfirmationDescription }} />
                <div className={mockInterviewConfirmationActionsClassName}>
                    <Button props={{ label: data.cancelLabel, variant: "outline" }} on={{ press: props.on?.dismissConfirmation }} />
                    <Button props={{ label: data.finishConfirmationOpen ? data.confirmLabel : data.abandonLabel, variant: "primary" }} on={{ press: data.finishConfirmationOpen ? props.on?.confirmFinish : props.on?.confirmAbandon }} />
                </div>
            </section>
        </ModalBranch>
    </>
}
