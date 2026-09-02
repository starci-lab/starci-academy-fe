import { WorkspaceShell, SectionHeader, Button } from "@starci/grammar/common"
import { ModalBranch } from "@/components/branches/ModalBranch"
import { SurfaceCard } from "@starci/grammar/common"
import { EmptyNotice } from "@starci/grammar/common"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { TitleDescriptionAccordion } from "@/components/composites/TitleDescriptionAccordion"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"

import { Heading } from "@starci/grammar/common"
import { Progress } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
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
            {data.promptTitle === undefined ? null : <Text size={"sm"} weight={"semibold"}>{data.promptTitle}</Text>}
        </div>
        <div className={mockInterviewResultHeroScoreClassName}>
            <Text size={"sm"} tone={"muted"}>{data.scoreLabel}</Text>
            {hasScore
                ? <><div className={mockInterviewResultScoreClassName} aria-label={`${data.scoreLabel}: ${score}/100`}>{score}/100</div><Heading level={2}>{data.verdict ?? data.scoreLabel}</Heading></>
                : <Heading level={2}>{loading ? data.gradingScoreLabel ?? data.gradingLabel : data.gradingFailedScoreLabel ?? data.gradingFailedLabel}</Heading>}
        </div>
    </section>

    const retryActions = <div className={mockInterviewResultActionsClassName}>
        {data.canRetryGrading ? <Button variant="primary" isPending={data.retrying} onPress={props.on?.retry}>{data.retrying ? data.retryingLabel : data.retryLabel}</Button> : null}
        <Button variant="outline" isDisabled={data.retrying} onPress={props.on?.abandon}>{data.abandonLabel}</Button>
    </div>

    const readyActions = <div className={mockInterviewResultReadyActionsClassName}>
        <Button variant={"primary"} onPress={({ press: props.on?.newSession })?.press} endContent={<Icon source={iconSourceFor("next", "chip")} usage="chip" />}>{data.newSessionLabel}</Button>
        <Button variant="outline" onPress={props.on?.openHistory}>{data.openHistoryLabel}</Button>
        <Button variant="outline" onPress={props.on?.returnToCourse}>{data.returnToCourseLabel}</Button>
        <Button variant="outline" onPress={props.on?.openTranscript}>{data.openTranscriptLabel}</Button>
    </div>

    if (state === "failed") return <main className={mockInterviewResultStateClassName} aria-label={data.title}><SurfaceCard composition="joined"><EmptyNotice message={data.failedLabel} actionLabel={data.retryLabel} onAction={({ act: props.on?.retry })?.act} /></SurfaceCard></main>

    if (state === "grading" || state === "gradingFailed") {
        const statePanel = <main className={mockInterviewResultStateClassName} aria-label={data.title}>
            <SurfaceCard label={state === "grading" ? data.title : data.gradingFailedLabel} composition="joined">
                <div className={mockInterviewResultSummaryClassName}>
                    <EmptyNotice message={state === "grading" ? data.gradingLabel : data.gradingFailureDetail} />
                    {state === "grading" ? <Progress label={data.gradingLabel} isSkeleton /> : null}
                    {state === "gradingFailed" && data.gradingAttemptLabel !== undefined ? <Text size={"xs"} tone={"muted"}>{data.gradingAttemptLabel}</Text> : null}
                    {state === "gradingFailed" ? retryActions : null}
                </div>
            </SurfaceCard>
        </main>
        return <WorkspaceShell align="start" header={hero} mainLandmark="caller" primary={statePanel} />
    }

    const primary = <main className={mockInterviewResultPrimaryClassName} aria-label={data.title}>
        <SurfaceCard label={data.phaseTitle} composition="joined">
            <div className={mockInterviewResultListClassName}>{data.phases.map((item) => <LabelledProgressRow key={item.id} props={{ id: item.id, title: item.label, percent: item.max === 0 ? 0 : (item.score / item.max) * 100, percentText: `${item.score}/${item.max}` }} />)}</div>
        </SurfaceCard>
        <div className={mockInterviewResultEvidenceClassName}>
            <SurfaceCard label={data.strengthsTitle} composition="joined"><div className={mockInterviewResultListClassName}>{data.strengths.map((item) => <Text key={item} size={"sm"} startContent={<Icon source={iconSourceFor("complete", "chip")} usage="chip" />}>{item}</Text>)}</div></SurfaceCard>
            <SurfaceCard label={data.gapsTitle} composition="joined"><div className={mockInterviewResultListClassName}>{data.gaps.map((item) => <Text key={item} size={"sm"} startContent={<Icon source={iconSourceFor("next", "chip")} usage="chip" />}>{item}</Text>)}</div></SurfaceCard>
        </div>
        {data.reviews.length === 0 ? null : <div className={mockInterviewResultReviewsClassName}><TitleDescriptionAccordion props={{ label: data.reviewsTitle, items: data.reviews.map((item) => ({ id: item.id, title: `${item.title} · ${item.scoreLabel}`, description: `${data.questionLabel ?? "Question"}\n${item.question}\n\n${data.answerLabel ?? "Answer"}\n${item.answer.trim().length === 0 ? data.unansweredLabel ?? "No answer recorded" : item.answer}\n\n${data.feedbackLabel ?? "Feedback"}\n${item.feedback}` })) }} /></div>}
    </main>

    const rail = <aside className={mockInterviewResultRailClassName} aria-label={data.sessionSummaryTitle}>
        {data.recommendation === undefined ? null : <SurfaceCard label={data.recommendationTitle} composition="joined"><div className={mockInterviewResultSummaryClassName}><Text size={"sm"}>{data.recommendation}</Text></div></SurfaceCard>}
        <SurfaceCard label={data.sessionSummaryTitle} composition="joined"><div className={mockInterviewResultSummaryClassName}><Text size={"sm"}>{`${data.sessionSummaryPromptLabel}: ${data.promptTitle ?? "—"}`}</Text><Text size={"sm"} tone={"muted"}>{`${data.sessionSummaryQuestionLabel}: ${data.reviews.length}`}</Text></div></SurfaceCard>
        <SurfaceCard label={data.actionsTitle ?? data.newSessionLabel} composition="joined"><div className={mockInterviewResultSummaryClassName}>{readyActions}</div></SurfaceCard>
    </aside>

    return <>
        <WorkspaceShell align="start" header={hero} mainLandmark="caller" primary={primary} rail={rail} railLabel={`${data.title} — ${data.sessionSummaryTitle}`} railMode="flow" railWidth="standard" railInset="content" />
        {data.transcriptOpen === true ? <ModalBranch isOpen size="cover" onDismiss={props.on?.closeTranscript ?? (() => undefined)}>
            <section className={mockInterviewResultTranscriptClassName} aria-label={data.transcriptTitle ?? data.openTranscriptLabel}>
                <Heading level={2}>{data.transcriptTitle ?? data.openTranscriptLabel}</Heading>
                {data.transcriptHint === undefined ? null : <Text size={"xs"} tone={"muted"}>{data.transcriptHint}</Text>}
                <div className={mockInterviewResultTranscriptListClassName}>
                    {data.reviews.map((item) => <SurfaceCard key={item.id} label={item.title} composition="joined">
                        <div className={mockInterviewResultTranscriptItemClassName}>
                            <Text size={"xs"} tone={"muted"} weight={"semibold"}>{data.interviewerLabel ?? "Interviewer"}</Text>
                            <Text size={"sm"}>{item.question}</Text>
                            <Text size={"xs"} tone={"muted"} weight={"semibold"}>{data.candidateLabel ?? "Your answer"}</Text>
                            <Text size={"sm"}>{item.answer.trim().length === 0 ? data.unansweredLabel ?? "No answer recorded" : item.answer}</Text>
                        </div>
                    </SurfaceCard>)}
                </div>
            </section>
        </ModalBranch> : null}
    </>
}
