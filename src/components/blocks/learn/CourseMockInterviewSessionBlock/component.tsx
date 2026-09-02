import { ChatWorkspace, Button } from "@starci/grammar/common"
import { ModalBranch } from "@/components/branches/ModalBranch"
import { SurfaceCard } from "@starci/grammar/common"
import { EmptyNotice } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Icon } from "@starci/grammar/common"

import { CodeBlock } from "@/components/leaves/CodeBlock"
import { Heading } from "@starci/grammar/common"
import { Progress } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
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
    if (state === "failed" || state === "expired") return <main className={mockInterviewStateClassName} aria-label={data.title}><SurfaceCard composition="joined"><EmptyNotice message={data.notice ?? data.retryLabel} actionLabel={data.retryLabel} onAction={({ act: props.on?.retry })?.act} /></SurfaceCard></main>
    const busy = state === "connecting" || state === "syncing" || data.operation !== undefined

    const header = <div className={mockInterviewHeaderClassName}>
        <div className={mockInterviewHeaderCopyClassName}>
            <Text size={"xs"} weight={"semibold"}>{data.promptTitle}</Text>
            <Heading level={1}>{data.title}</Heading>
            <Text size={"sm"} tone={"muted"} live={"polite"}>{data.stateLabel}</Text>
        </div>
        <div className={mockInterviewHeaderActionsClassName}>
            <Button variant="outline" size="sm" isDisabled={busy} onPress={props.on?.finish}>{data.finishLabel}</Button>
            <Button variant="ghost" size="sm" isDisabled={busy} onPress={props.on?.leave}>{data.leaveLabel}</Button>
        </div>
        <div className={mockInterviewHeaderFactsClassName}>
            <Text size={"sm"} weight={"semibold"}>{data.counterLabel}</Text>
            <Progress label={data.progressLabel} value={Math.round(data.progress)} />
            {data.remainingLabel === undefined ? null : <Text size={"sm"} tone={"muted"}>{data.remainingLabel}</Text>}
        </div>
    </div>

    const conversation = <section className={mockInterviewConversationClassName} aria-labelledby="mock-interview-current-question">
        <SurfaceCard composition="joined">
            <article className={mockInterviewQuestionClassName}>
                <div className={mockInterviewQuestionMetaClassName}>
                    <Text id={"mock-interview-current-question"} size={"xs"} weight={"semibold"}>{data.currentQuestionLabel}</Text>
                    <Text size={"xs"} tone={"muted"}>{data.counterLabel}</Text>
                </div>
                <Heading level={2}>{data.currentQuestion}</Heading>
                {data.streamingText === undefined ? null : <Text size={"sm"} live={"polite"}>{data.streamingText}</Text>}
                {data.workspaceCode === undefined ? null : <CodeBlock props={{ code: data.workspaceCode, language: "text" }} />}
            </article>
        </SurfaceCard>
    </section>

    const composer = <section className={mockInterviewComposerClassName} aria-label={data.answerLabel}>
        <Textarea key={data.counterLabel} props={{ id: "interview-answer", name: "answer", label: data.answerLabel, placeholder: data.answerPlaceholder, defaultValue: data.answer, rows: 4, disabled: busy }} on={{ change: props.on?.answer }} />
        <div className={mockInterviewComposerActionsClassName}>
            {data.notice === undefined
                ? <Text size={"xs"} tone={"muted"} live={"polite"}>{data.syncStatusLabel}</Text>
                : <div className={mockInterviewNoticeClassName}><Text size={"sm"} weight={"semibold"} live={"assertive"}>{data.notice}</Text></div>}
            <div className={mockInterviewComposerButtonsClassName}>
                {data.operation === "streaming" ? <Button variant="outline" onPress={props.on?.abort}>{data.abortLabel}</Button> : null}
                <Button variant={"primary"} isDisabled={busy || data.answer.trim() === ""} onPress={({ press: props.on?.ask })?.press} endContent={"next" === "next" && "trailing" === "trailing" ? <Icon source={iconSourceFor("next", "chip")} role="chip" /> : undefined}>{data.submitLabel}</Button>
            </div>
        </div>
    </section>

    const transcript = <aside className={mockInterviewTranscriptClassName} aria-label={data.turnsLabel}>
        <Heading level={2}>{data.turnsLabel}</Heading>
        <ol className={mockInterviewTranscriptListClassName}>
            {data.turns.length === 0 ? <li className={mockInterviewTranscriptItemClassName}><Text size={"sm"} tone={"muted"}>{data.turnsEmptyLabel}</Text></li> : data.turns.map((turn) => <li className={mockInterviewTranscriptItemClassName} data-role={turn.role} key={turn.id}><Text size={"xs"} tone={"muted"} weight={"semibold"}>{turn.label}</Text><Text size={"sm"}>{turn.content}</Text></li>)}
        </ol>
    </aside>

    return <>
        <main className={mockInterviewRoomClassName} aria-label={data.title}><ChatWorkspace className={mockInterviewRoomClassName} label={data.title} header={header} conversation={conversation} conversationLabel={data.currentQuestionLabel} composer={composer} rail={transcript} railLabel={data.turnsLabel} railOpenLabel={data.transcriptOpenLabel} railCloseLabel={data.transcriptCloseLabel} railWidth="standard" isRailOpen={data.isTranscriptOpen} onRailOpenChange={(isOpen) => props.on?.setTranscriptOpen?.(isOpen)} /></main>
        <ModalBranch isOpen={data.finishConfirmationOpen || data.abandonConfirmationOpen} onDismiss={props.on?.dismissConfirmation ?? (() => undefined)}>
            <section className={mockInterviewConfirmationClassName}>
                <Heading level={2}>{data.finishConfirmationOpen ? data.finishConfirmationTitle : data.abandonConfirmationTitle}</Heading>
                <Text>{data.finishConfirmationOpen ? data.finishConfirmationDescription : data.abandonConfirmationDescription}</Text>
                <div className={mockInterviewConfirmationActionsClassName}>
                    <Button variant="outline" onPress={props.on?.dismissConfirmation}>{data.cancelLabel}</Button>
                    <Button variant="primary" onPress={data.finishConfirmationOpen ? props.on?.confirmFinish : props.on?.confirmAbandon}>{data.finishConfirmationOpen ? data.confirmLabel : data.abandonLabel}</Button>
                </div>
            </section>
        </ModalBranch>
    </>
}
