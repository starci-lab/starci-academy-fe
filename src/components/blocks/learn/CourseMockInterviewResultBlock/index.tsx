"use client"

import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryMockInterviewAttemptBySessionSwr } from "@/hooks/swr/useQueryMockInterviewAttemptBySessionSwr"
import { CourseMockInterviewResultBlockBase, type CourseMockInterviewResultState } from "./component"

/** Route identity required to resolve one persisted interview attempt. */
export type CourseMockInterviewResultPageProps = {
    readonly displayId: string
    readonly sessionId: string
}

const resultStateOf = (failed: boolean, grading: boolean): CourseMockInterviewResultState => {
    if (failed) return "failed"
    return grading ? "grading" : "ready"
}

const COPY = {
    en: {
        title: "Interview debrief",
        description: "Your persisted result, rubric breakdown and question-by-question feedback.",
        grading: "Your interview is still being graded",
        failed: "The interview result could not be loaded.",
        score: "Overall score",
        phases: "Score breakdown",
        strengths: "Strengths",
        gaps: "What to improve",
        reviews: "Question review",
        retry: "Check again",
        newSession: "Interview again",
        question: (index: number) => `Question ${index}`,
    },
    vi: {
        title: "Nhận xét buổi phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        description: "Kết quả đã lưu, điểm theo tiêu chí và nhận xét cho từng câu hỏi.", // vn-ok: approved Vietnamese runtime copy
        grading: "Buổi phỏng vấn vẫn đang được chấm", // vn-ok: approved Vietnamese runtime copy
        failed: "Không thể tải kết quả phỏng vấn.", // vn-ok: approved Vietnamese runtime copy
        score: "Tổng điểm", // vn-ok: approved Vietnamese runtime copy
        phases: "Chi tiết điểm", // vn-ok: approved Vietnamese runtime copy
        strengths: "Điểm mạnh", // vn-ok: approved Vietnamese runtime copy
        gaps: "Điểm cần cải thiện", // vn-ok: approved Vietnamese runtime copy
        reviews: "Nhận xét từng câu", // vn-ok: approved Vietnamese runtime copy
        retry: "Kiểm tra lại", // vn-ok: approved Vietnamese runtime copy
        newSession: "Phỏng vấn lại", // vn-ok: approved Vietnamese runtime copy
        question: (index: number) => `Câu ${index}`, // vn-ok: approved Vietnamese runtime copy
    },
} as const

/** Poll the durable attempt and render the result route independently of live-session state. */
export const CourseMockInterviewResultBlock = ({ displayId, sessionId }: CourseMockInterviewResultPageProps) => {
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const courseId = course.data?.id
    const attempt = useQueryMockInterviewAttemptBySessionSwr(courseId, sessionId, 1500)
    const failed = course.error !== undefined || attempt.error !== undefined || course.data === null
    const state = resultStateOf(failed, attempt.data === null || attempt.data === undefined)
    const result = attempt.data
    const setupPath = `/courses/${displayId}/learn/mock-interview`

    return (
        <CourseMockInterviewResultBlockBase
            state={state}
            props={{
                title: copy.title,
                description: copy.description,
                gradingLabel: copy.grading,
                failedLabel: copy.failed,
                scoreLabel: copy.score,
                score: result?.overallScore,
                verdict: result?.verdict,
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
                reviews: (result?.questionReviews ?? []).map((review) => ({
                    id: `${review.questionIndex}-${review.kind}`,
                    title: review.question || copy.question(review.questionIndex + 1),
                    answer: review.candidateAnswer,
                    feedback: review.feedback,
                    scoreLabel: `${review.score}/${review.max}`,
                })),
                retryLabel: copy.retry,
                newSessionLabel: copy.newSession,
            }}
            on={{
                retry: () => { void Promise.all([course.mutate(), attempt.mutate()]) },
                newSession: () => router.push(setupPath),
            }}
        />
    )
}

/** Source-level ownership marker for the connected result twin. */
export const meta = { world: "connected", domain: "learn" } as const
