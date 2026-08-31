"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryMockInterviewAttemptBySessionSwr } from "@/hooks/swr/useQueryMockInterviewAttemptBySessionSwr"
import { useQueryMyInProgressMockInterviewSessionSwr } from "@/hooks/swr/useQueryMyInProgressMockInterviewSessionSwr"
import {
    useMutateAbandonMockInterviewSessionSwr,
    useMutateRetryMockInterviewSessionGradingSwr,
} from "@/hooks/swr/useMutateMockInterviewSessionLifecycleSwr"
import { CourseMockInterviewResultBlockBase, type CourseMockInterviewResultState } from "./component"
import { mockInterviewVerdictLabel } from "./verdict"

/** Route identity required to resolve one persisted interview attempt. */
export type CourseMockInterviewResultPageProps = {
    readonly displayId: string
    readonly sessionId: string
}

const resultStateOf = (failed: boolean, gradingFailed: boolean, grading: boolean): CourseMockInterviewResultState => {
    if (failed) return "failed"
    if (gradingFailed) return "gradingFailed"
    return grading ? "grading" : "ready"
}

const COPY = {
    en: {
        title: "Interview debrief",
        description: "Your persisted result, rubric breakdown and question-by-question feedback.",
        grading: "Your interview is in the grading queue. You can safely leave and return later.",
        gradingHero: "Your answers are saved while StarCi prepares the score and feedback.",
        gradingScore: "Grading in progress",
        gradingFailed: "Grading stopped before a report was produced.",
        gradingFailedScore: "No score available",
        gradingFailureDetail: "Retry the same grading job or discard this session to start over.",
        gradingExhaustedDetail: "All grading attempts were used. Discard this session to start a new interview.",
        failed: "The interview result could not be loaded.",
        score: "Overall score",
        phases: "Score breakdown",
        strengths: "Strengths",
        gaps: "What to improve",
        reviews: "Question review",
        questionLabel: "Question",
        answerLabel: "Your answer",
        feedbackLabel: "Feedback",
        retry: "Retry grading",
        abandon: "Discard session",
        retrying: "Requeueing grading…",
        recommendation: "Recommended next practice",
        newSession: "Interview again",
        openTranscript: "View transcript",
        transcriptTitle: "Interview transcript",
        interviewer: "Interviewer",
        candidate: "Your answer",
        unanswered: "No answer recorded",
        transcriptHint: (count: number) => `${count} questions · Scroll inside this dialog to read the complete transcript.`,
        openHistory: "Interview history",
        returnToCourse: "Back to course",
        sessionSummary: "Session summary",
        sessionPrompt: "Interview",
        sessionQuestions: "Questions graded",
        backToOverview: "Back to mock interviews",
        actions: "Next steps",
        question: (index: number) => `Question ${index}`,
    },
    vi: {
        title: "Nhận xét buổi phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        description: "Kết quả đã lưu, điểm theo tiêu chí và nhận xét cho từng câu hỏi.", // vn-ok: approved Vietnamese runtime copy
        grading: "Buổi phỏng vấn đang trong hàng đợi chấm điểm. Bạn có thể rời trang và quay lại sau.", // vn-ok: approved Vietnamese runtime copy
        gradingHero: "Câu trả lời đã được lưu trong khi StarCi chuẩn bị điểm và nhận xét.", // vn-ok: approved Vietnamese runtime copy
        gradingScore: "Đang chấm điểm", // vn-ok: approved Vietnamese runtime copy
        gradingFailed: "Quá trình chấm điểm đã dừng trước khi tạo báo cáo.", // vn-ok: approved Vietnamese runtime copy
        gradingFailedScore: "Chưa có điểm", // vn-ok: approved Vietnamese runtime copy
        gradingFailureDetail: "Thử lại đúng tác vụ chấm điểm này hoặc hủy phiên để bắt đầu lại.", // vn-ok: approved Vietnamese runtime copy
        gradingExhaustedDetail: "Đã dùng hết số lần chấm. Hủy phiên này để bắt đầu một buổi phỏng vấn mới.", // vn-ok: approved Vietnamese runtime copy
        failed: "Không thể tải kết quả phỏng vấn.", // vn-ok: approved Vietnamese runtime copy
        score: "Tổng điểm", // vn-ok: approved Vietnamese runtime copy
        phases: "Chi tiết điểm", // vn-ok: approved Vietnamese runtime copy
        strengths: "Điểm mạnh", // vn-ok: approved Vietnamese runtime copy
        gaps: "Điểm cần cải thiện", // vn-ok: approved Vietnamese runtime copy
        reviews: "Nhận xét từng câu", // vn-ok: approved Vietnamese runtime copy
        questionLabel: "Câu hỏi", // vn-ok: approved Vietnamese runtime copy
        answerLabel: "Câu trả lời của bạn", // vn-ok: approved Vietnamese runtime copy
        feedbackLabel: "Nhận xét", // vn-ok: approved Vietnamese runtime copy
        retry: "Thử chấm lại", // vn-ok: approved Vietnamese runtime copy
        abandon: "Hủy phiên", // vn-ok: approved Vietnamese runtime copy
        retrying: "Đang đưa lại vào hàng đợi chấm…", // vn-ok: approved Vietnamese runtime copy
        recommendation: "Nội dung nên luyện tiếp", // vn-ok: approved Vietnamese runtime copy
        newSession: "Phỏng vấn lại", // vn-ok: approved Vietnamese runtime copy
        openTranscript: "Xem transcript", // vn-ok: approved Vietnamese runtime copy
        transcriptTitle: "Bản ghi phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        interviewer: "Người phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        candidate: "Câu trả lời của bạn", // vn-ok: approved Vietnamese runtime copy
        unanswered: "Không có câu trả lời được lưu", // vn-ok: approved Vietnamese runtime copy
        transcriptHint: (count: number) => `${count} câu · Cuộn trong hộp thoại để đọc toàn bộ bản ghi.`, // vn-ok: approved Vietnamese runtime copy
        openHistory: "Lịch sử phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        returnToCourse: "Về khóa học", // vn-ok: approved Vietnamese runtime copy
        sessionSummary: "Tóm tắt phiên", // vn-ok: approved Vietnamese runtime copy
        sessionPrompt: "Nội dung", // vn-ok: approved Vietnamese runtime copy
        sessionQuestions: "Số câu đã chấm", // vn-ok: approved Vietnamese runtime copy
        backToOverview: "Về trang phỏng vấn thử", // vn-ok: approved Vietnamese runtime copy
        actions: "Bước tiếp theo", // vn-ok: approved Vietnamese runtime copy
        question: (index: number) => `Câu ${index}`, // vn-ok: approved Vietnamese runtime copy
    },
} as const

/** Poll the durable attempt and render the result route independently of live-session state. */
/** Route identity used to load a mock interview result. */
export type CourseMockInterviewResultBlockProps = CourseMockInterviewResultPageProps
/** Load and render the durable mock-interview result route. */
export const CourseMockInterviewResultBlock = (props: CourseMockInterviewResultBlockProps) => {
    const { displayId, sessionId } = props
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const courseId = course.data?.id
    const attempt = useQueryMockInterviewAttemptBySessionSwr(courseId, sessionId, 1500)
    const inProgress = useQueryMyInProgressMockInterviewSessionSwr(courseId)
    const retryGrading = useMutateRetryMockInterviewSessionGradingSwr(courseId, sessionId)
    const abandon = useMutateAbandonMockInterviewSessionSwr(courseId, sessionId)
    const [transcriptOpen, setTranscriptOpen] = useState(false)
    const lifecycle = inProgress.data?.sessionId === sessionId ? inProgress.data : null
    const failed = course.error !== undefined || attempt.error !== undefined || inProgress.error !== undefined || course.data === null
    const gradingFailed = lifecycle?.status === "grading_failed"
    const state = resultStateOf(failed, gradingFailed, attempt.data === null || attempt.data === undefined)
    const result = attempt.data
    const setupPath = `/courses/${displayId}/learn/mock-interview`
    const gradingAttemptCount = lifecycle?.gradingAttemptCount ?? 0
    const gradingMaxAttempts = lifecycle?.gradingMaxAttempts ?? 1
    const canRetryGrading = gradingAttemptCount < gradingMaxAttempts

    useEffect(() => {
        if (lifecycle?.status !== "grading") return undefined
        const timer = window.setInterval(() => { void inProgress.mutate() }, 1500)
        return () => window.clearInterval(timer)
    }, [inProgress, lifecycle?.status])

    useEffect(() => {
        if (lifecycle?.status === "in_progress") {
            router.replace(`${setupPath}/interview/${sessionId}`)
        }
    }, [lifecycle?.status, router, sessionId, setupPath])

    const retry = async () => {
        if (courseId === undefined || lifecycle === null) return
        const response = await retryGrading.trigger({
            courseId,
            sessionId,
            expectedRevision: lifecycle.revision,
        })
        const payload = response.data?.retryMockInterviewSessionGrading
        if (payload?.success === true) await inProgress.mutate()
    }

    const abandonSession = async () => {
        if (courseId === undefined || lifecycle === null) return
        const response = await abandon.trigger({
            courseId,
            sessionId,
            expectedRevision: lifecycle.revision,
        })
        const payload = response.data?.abandonMockInterviewSession
        if (payload?.success === true) router.replace(setupPath)
        else await inProgress.mutate()
    }

    return (
        <CourseMockInterviewResultBlockBase
            state={state}
            props={{
                title: copy.title,
                description: state === "grading" ? copy.gradingHero : state === "gradingFailed" ? copy.gradingFailed : copy.description,
                gradingLabel: copy.grading,
                gradingScoreLabel: copy.gradingScore,
                gradingFailedLabel: copy.gradingFailed,
                gradingFailedScoreLabel: copy.gradingFailedScore,
                gradingFailureDetail: canRetryGrading ? copy.gradingFailureDetail : copy.gradingExhaustedDetail,
                gradingAttemptLabel: lifecycle === null ? undefined : `${lifecycle.gradingAttemptCount ?? 0}/${lifecycle.gradingMaxAttempts ?? 0}`,
                retryingLabel: copy.retrying,
                failedLabel: copy.failed,
                scoreLabel: copy.score,
                score: result?.overallScore,
                verdict: mockInterviewVerdictLabel(result?.verdict, locale),
                promptTitle: result?.promptTitle,
                phaseTitle: copy.phases,
                phases: (result?.phaseScores ?? []).map((phase, index) => ({
                    id: `${index}-${phase.phase}`,
                    label: phase.phase,
                    score: phase.score,
                    max: phase.max,
                })),
                strengthsTitle: copy.strengths,
                strengths: result?.strengths ?? [],
                gapsTitle: copy.gaps,
                gaps: result?.gaps ?? [],
                reviewsTitle: copy.reviews,
                questionLabel: copy.questionLabel,
                answerLabel: copy.answerLabel,
                feedbackLabel: copy.feedbackLabel,
                reviews: (result?.questionReviews ?? []).map((review) => ({
                    id: `${review.questionIndex}-${review.kind}`,
                    title: copy.question(review.questionIndex + 1),
                    question: review.question || copy.question(review.questionIndex + 1),
                    answer: review.candidateAnswer,
                    feedback: review.feedback,
                    scoreLabel: `${review.score}/${review.max}`,
                })),
                retryLabel: copy.retry,
                abandonLabel: copy.abandon,
                newSessionLabel: state === "ready" ? copy.newSession : copy.backToOverview,
                openTranscriptLabel: copy.openTranscript,
                transcriptOpen,
                transcriptTitle: copy.transcriptTitle,
                transcriptHint: copy.transcriptHint(result?.questionReviews.length ?? 0),
                interviewerLabel: copy.interviewer,
                candidateLabel: copy.candidate,
                unansweredLabel: copy.unanswered,
                openHistoryLabel: copy.openHistory,
                returnToCourseLabel: copy.returnToCourse,
                actionsTitle: copy.actions,
                sessionSummaryTitle: copy.sessionSummary,
                sessionSummaryPromptLabel: copy.sessionPrompt,
                sessionSummaryQuestionLabel: copy.sessionQuestions,
                recommendationTitle: copy.recommendation,
                recommendation: result?.followUpQuestion ?? result?.matchedContentIds[0],
                retrying: retryGrading.isMutating,
                canRetryGrading,
            }}
            on={{
                retry: () => { void retry() },
                abandon: () => { void abandonSession() },
                newSession: () => router.push(setupPath),
                openTranscript: () => setTranscriptOpen(true),
                closeTranscript: () => setTranscriptOpen(false),
                openHistory: () => router.push(`${setupPath}?tab=history`),
                returnToCourse: () => router.push(`/courses/${displayId}/learn`),
            }}
        />
    )
}
