import { DashboardShell, SectionHeader } from "@starci/grammar/core"
import { ModalBranch } from "@/components/branches/ModalBranch"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { TitleDescriptionAccordion } from "@/components/composites/TitleDescriptionAccordion"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import {
    mockInterviewResultActionsClassName,
    mockInterviewResultEvidenceClassName,
    mockInterviewResultHeroClassName,
    mockInterviewResultHeroCopyClassName,
    mockInterviewResultHeroScoreClassName,
    mockInterviewResultListClassName,
    mockInterviewResultPrimaryClassName,
    mockInterviewResultRailClassName,
    mockInterviewResultReadyActionsClassName,
    mockInterviewResultReviewsClassName,
    mockInterviewResultScoreClassName,
    mockInterviewResultStateClassName,
    mockInterviewResultSummaryClassName,
    mockInterviewResultTranscriptClassName,
    mockInterviewResultTranscriptItemClassName,
    mockInterviewResultTranscriptListClassName,
} from "./classNames"

/** Rendering state for the result journey. */
export type CourseMockInterviewResultState = "grading" | "gradingFailed" | "ready" | "failed"
/** One scored rubric phase. */
export type CourseMockInterviewScoreRow = { readonly id: string; readonly label: string; readonly score: number; readonly max: number }
/** One reviewed interview question. */
export type CourseMockInterviewQuestionReview = { readonly id: string; readonly title: string; readonly question: string; readonly answer: string; readonly feedback: string; readonly scoreLabel: string }
/** Localized content and result data for the debrief. */
export type CourseMockInterviewResultData = { readonly resultState?: CourseMockInterviewResultState; readonly title: string; readonly description: string; readonly gradingLabel: string; readonly gradingScoreLabel?: string; readonly gradingFailedLabel: string; readonly gradingFailedScoreLabel?: string; readonly gradingFailureDetail: string; readonly gradingAttemptLabel?: string; readonly retryingLabel: string; readonly failedLabel: string; readonly scoreLabel: string; readonly score?: number; readonly verdict?: string; readonly promptTitle?: string; readonly phaseTitle: string; readonly phases: ReadonlyArray<CourseMockInterviewScoreRow>; readonly strengthsTitle: string; readonly strengths: ReadonlyArray<string>; readonly gapsTitle: string; readonly gaps: ReadonlyArray<string>; readonly reviewsTitle: string; readonly questionLabel?: string; readonly answerLabel?: string; readonly feedbackLabel?: string; readonly reviews: ReadonlyArray<CourseMockInterviewQuestionReview>; readonly retryLabel: string; readonly abandonLabel: string; readonly newSessionLabel: string; readonly openTranscriptLabel: string; readonly transcriptOpen?: boolean; readonly transcriptTitle?: string; readonly transcriptHint?: string; readonly interviewerLabel?: string; readonly candidateLabel?: string; readonly unansweredLabel?: string; readonly openHistoryLabel: string; readonly returnToCourseLabel: string; readonly actionsTitle?: string; readonly sessionSummaryTitle: string; readonly sessionSummaryPromptLabel: string; readonly sessionSummaryQuestionLabel: string; readonly recommendationTitle: string; readonly recommendation?: string; readonly retrying: boolean; readonly canRetryGrading: boolean }
/** User actions emitted by the debrief. */
export type CourseMockInterviewResultActions = { readonly retry?: () => void; readonly abandon?: () => void; readonly newSession?: () => void; readonly openTranscript?: () => void; readonly closeTranscript?: () => void; readonly openHistory?: () => void; readonly returnToCourse?: () => void }
/** State, data and actions passed to the presentational result block. */
export type CourseMockInterviewResultBlockProps = { readonly state: CourseMockInterviewResultState; readonly props: CourseMockInterviewResultData; readonly on?: CourseMockInterviewResultActions }

/** Presentational debrief for a graded interview attempt. */
export const CourseMockInterviewResultBlockBase = (props: CourseMockInterviewResultBlockProps) => {
    const data = props.props
    const state = data.resultState ?? props.state
    const loading = state === "grading"
    const hasScore = state === "ready"
    const score = Math.round(data.score ?? 0)

    const hero = <section className={mockInterviewResultHeroClassName} aria-labelledby="mock-interview-result-heading">
        <div className={mockInterviewResultHeroCopyClassName}>
            <SectionHeader eyebrow={data.scoreLabel} title={data.title} description={data.description} level={1} id="mock-interview-result-heading" composition="context-intro" />
            {data.promptTitle === undefined ? null : <Text props={{ content: data.promptTitle, size: "sm", weight: "semibold" }} />}
        </div>
        <div className={mockInterviewResultHeroScoreClassName}>
            <Text props={{ content: data.scoreLabel, size: "sm", tone: "muted" }} />
            {hasScore
                ? <><div className={mockInterviewResultScoreClassName} aria-label={`${data.scoreLabel}: ${score}/100`}>{score}/100</div><Heading props={{ content: data.verdict ?? data.scoreLabel, level: 2 }} /></>
                : <Heading props={{ content: loading ? data.gradingScoreLabel ?? data.gradingLabel : data.gradingFailedScoreLabel ?? data.gradingFailedLabel, level: 2 }} />}
        </div>
    </section>

    const retryActions = <div className={mockInterviewResultActionsClassName}>
        {data.canRetryGrading ? <Button props={{ label: data.retrying ? data.retryingLabel : data.retryLabel, variant: "primary", isPending: data.retrying }} on={{ press: props.on?.retry }} /> : null}
        <Button props={{ label: data.abandonLabel, variant: "outline", disabled: data.retrying }} on={{ press: props.on?.abandon }} />
    </div>

    const readyActions = <div className={mockInterviewResultReadyActionsClassName}>
        <Button props={{ label: data.newSessionLabel, variant: "primary", icon: "next", iconPlacement: "trailing" }} on={{ press: props.on?.newSession }} />
        <Button props={{ label: data.openHistoryLabel, variant: "outline" }} on={{ press: props.on?.openHistory }} />
        <Button props={{ label: data.returnToCourseLabel, variant: "outline" }} on={{ press: props.on?.returnToCourse }} />
        <Button props={{ label: data.openTranscriptLabel, variant: "outline" }} on={{ press: props.on?.openTranscript }} />
    </div>

    if (state === "failed") return <main className={mockInterviewResultStateClassName} aria-label={data.title}><SurfaceCard><EmptyNotice props={{ message: data.failedLabel, actionLabel: data.retryLabel }} on={{ act: props.on?.retry }} /></SurfaceCard></main>

    if (state === "grading" || state === "gradingFailed") {
        const statePanel = <main className={mockInterviewResultStateClassName} aria-label={data.title}>
            <SurfaceCard props={{ label: state === "grading" ? data.title : data.gradingFailedLabel }}>
                <div className={mockInterviewResultSummaryClassName}>
                    <EmptyNotice props={{ message: state === "grading" ? data.gradingLabel : data.gradingFailureDetail }} />
                    {state === "grading" ? <Progress props={{ label: data.gradingLabel }} isLoading /> : null}
                    {state === "gradingFailed" && data.gradingAttemptLabel !== undefined ? <Text props={{ content: data.gradingAttemptLabel, size: "xs", tone: "muted" }} /> : null}
                    {state === "gradingFailed" ? retryActions : null}
                </div>
            </SurfaceCard>
        </main>
        return <DashboardShell align="start" header={hero} mainLandmark="caller" primary={statePanel} />
    }

    const primary = <main className={mockInterviewResultPrimaryClassName} aria-label={data.title}>
        <SurfaceCard props={{ label: data.phaseTitle }}>
            <div className={mockInterviewResultListClassName}>{data.phases.map((item) => <LabelledProgressRow key={item.id} props={{ id: item.id, title: item.label, percent: item.max === 0 ? 0 : (item.score / item.max) * 100, percentText: `${item.score}/${item.max}` }} />)}</div>
        </SurfaceCard>
        <div className={mockInterviewResultEvidenceClassName}>
            <SurfaceCard props={{ label: data.strengthsTitle }}><div className={mockInterviewResultListClassName}>{data.strengths.map((item) => <Text key={item} props={{ content: item, size: "sm", icon: "complete" }} />)}</div></SurfaceCard>
            <SurfaceCard props={{ label: data.gapsTitle }}><div className={mockInterviewResultListClassName}>{data.gaps.map((item) => <Text key={item} props={{ content: item, size: "sm", icon: "next" }} />)}</div></SurfaceCard>
        </div>
        {data.reviews.length === 0 ? null : <div className={mockInterviewResultReviewsClassName}><TitleDescriptionAccordion props={{ label: data.reviewsTitle, items: data.reviews.map((item) => ({ id: item.id, title: `${item.title} · ${item.scoreLabel}`, description: `${data.questionLabel ?? "Question"}\n${item.question}\n\n${data.answerLabel ?? "Answer"}\n${item.answer.trim().length === 0 ? data.unansweredLabel ?? "No answer recorded" : item.answer}\n\n${data.feedbackLabel ?? "Feedback"}\n${item.feedback}` })) }} /></div>}
    </main>

    const rail = <aside className={mockInterviewResultRailClassName} aria-label={data.sessionSummaryTitle}>
        {data.recommendation === undefined ? null : <SurfaceCard props={{ label: data.recommendationTitle }}><div className={mockInterviewResultSummaryClassName}><Text props={{ content: data.recommendation, size: "sm" }} /></div></SurfaceCard>}
        <SurfaceCard props={{ label: data.sessionSummaryTitle }}><div className={mockInterviewResultSummaryClassName}><Text props={{ content: `${data.sessionSummaryPromptLabel}: ${data.promptTitle ?? "—"}`, size: "sm" }} /><Text props={{ content: `${data.sessionSummaryQuestionLabel}: ${data.reviews.length}`, size: "sm", tone: "muted" }} /></div></SurfaceCard>
        <SurfaceCard props={{ label: data.actionsTitle ?? data.newSessionLabel }}><div className={mockInterviewResultSummaryClassName}>{readyActions}</div></SurfaceCard>
    </aside>

    return <>
        <DashboardShell align="start" header={hero} mainLandmark="caller" primary={primary} rail={rail} railLabel={`${data.title} — ${data.sessionSummaryTitle}`} railMode="flow" railWidth="standard" railInset="content" />
        {data.transcriptOpen === true ? <ModalBranch isOpen size="cover" onDismiss={props.on?.closeTranscript ?? (() => undefined)}>
            <section className={mockInterviewResultTranscriptClassName} aria-label={data.transcriptTitle ?? data.openTranscriptLabel}>
                <Heading props={{ content: data.transcriptTitle ?? data.openTranscriptLabel, level: 2 }} />
                {data.transcriptHint === undefined ? null : <Text props={{ content: data.transcriptHint, size: "xs", tone: "muted" }} />}
                <div className={mockInterviewResultTranscriptListClassName}>
                    {data.reviews.map((item) => <SurfaceCard key={item.id} props={{ label: item.title }}>
                        <div className={mockInterviewResultTranscriptItemClassName}>
                            <Text props={{ content: data.interviewerLabel ?? "Interviewer", size: "xs", tone: "muted", weight: "semibold" }} />
                            <Text props={{ content: item.question, size: "sm" }} />
                            <Text props={{ content: data.candidateLabel ?? "Your answer", size: "xs", tone: "muted", weight: "semibold" }} />
                            <Text props={{ content: item.answer.trim().length === 0 ? data.unansweredLabel ?? "No answer recorded" : item.answer, size: "sm" }} />
                        </div>
                    </SurfaceCard>)}
                </div>
            </section>
        </ModalBranch> : null}
    </>
}
