"use client"

import { useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryMyInProgressMockInterviewSessionSwr } from "@/hooks/swr/useQueryMyInProgressMockInterviewSessionSwr"
import { useMutateStartMockInterviewSessionSwr } from "@/hooks/swr/useMutateStartMockInterviewSessionSwr"
import { useQueryMyMockInterviewAttemptsSwr } from "@/hooks/swr/useQueryMyMockInterviewAttemptsSwr"
import { useQueryMyMockInterviewStatsSwr } from "@/hooks/swr/useQueryMyMockInterviewStatsSwr"
import { CourseMockInterviewSetupBlockBase, type CourseMockInterviewSetupState } from "./component"

/** Route-owned input for the connected setup page. */
export type CourseMockInterviewSetupPageProps = { readonly displayId: string }
type SetupStatusCopy = { readonly resumable: string; readonly starting: string; readonly failed: string }
type HistoryData = { readonly items: ReadonlyArray<unknown> }
type StatsData = { readonly insufficientData: boolean; readonly byPhase: ReadonlyArray<unknown> }

const setupStateOf = (
    failed: boolean,
    starting: boolean,
    pending: boolean,
    hasResumableSession: boolean,
): CourseMockInterviewSetupState => {
    if (failed) return "failed"
    if (starting) return "starting"
    if (pending) return "pending"
    return hasResumableSession ? "resumable" : "ready"
}

const setupStatusOf = (state: CourseMockInterviewSetupState, copy: SetupStatusCopy) => {
    if (state === "resumable") return copy.resumable
    if (state === "starting") return copy.starting
    if (state === "failed") return copy.failed
    return undefined
}

const historyStateOf = (error: unknown, data: HistoryData | null | undefined) => {
    if (error !== undefined) return "failed" as const
    if (data === undefined) return "pending" as const
    if (data === null) return "empty" as const
    return data.items.length === 0 ? "empty" as const : "ready" as const
}

const statsStateOf = (error: unknown, data: StatsData | null | undefined) => {
    if (error !== undefined) return "failed" as const
    if (data === undefined) return "pending" as const
    return data === null || data.insufficientData || data.byPhase.length === 0 ? "empty" as const : "ready" as const
}

const COPY = {
    en: {
        title: "Mock interview",
        description: "Practise a technical interview grounded in this course, then receive detailed feedback.",
        journey: "Practice journey",
        journeyStage: "Step 1 of 3 · Setup",
        level: "Seniority",
        mode: "Interview format",
        start: "Start interview",
        starting: "Starting your interview…",
        resume: "Resume interview",
        resumable: "You have an unfinished interview. Resume it or start a fresh draw.",
        failed: "The interview setup could not be loaded.",
        retry: "Try again",
        tabsLabel: "Mock interview setup",
        tabs: { begin: "Begin", history: "History", stats: "Statistics" },
        beginTitle: "Interview room",
        briefingEyebrow: "Course-grounded interview",
        briefingTitle: "Get ready for a focused technical interview",
        setupTitle: "Session setup",
        setupDescription: "Choose two settings before entering the interview room.",
        sequenceTitle: "After you begin",
        sequenceSteps: [
            { id: "create", title: "The server creates a session", description: "Questions are drawn from this course and your current setup." },
            { id: "answer", title: "You answer in the interview room", description: "The session is persisted so your progress is not lost." },
            { id: "feedback", title: "Receive detailed feedback", description: "The result appears in History and Statistics." },
        ],
        serverNote: "Questions are generated only after you begin. These settings do not change the course content.",
        savedNote: "A new session will be saved to your interview history.",
        historyTitle: "Interview history",
        statsTitle: "Interview statistics",
        historyEmpty: "Completed interview history will appear here.",
        statsEmpty: "Interview statistics will appear after your first completed session.",
        historyFailed: "Completed interviews could not be loaded.",
        statsFailed: "Interview statistics could not be loaded.",
        returnToBegin: "Prepare an interview",
        resumeTitle: "Your latest session is still active",
        readiness: { level: "Readiness", mode: "Format", focus: "Focus" },
        levels: { junior: "Junior", middle: "Middle", senior: "Senior" },
        modes: { qna: "Technical Q&A", design: "System design" },
    },
    vi: {
        title: "Phỏng vấn thử", // vn-ok: approved Vietnamese runtime copy
        description: "Luyện phỏng vấn kỹ thuật theo nội dung khóa học và nhận phản hồi chi tiết.", // vn-ok: approved Vietnamese runtime copy
        journey: "Hành trình luyện tập", // vn-ok: approved Vietnamese runtime copy
        journeyStage: "Bước 1/3 · Thiết lập", // vn-ok: approved Vietnamese runtime copy
        level: "Cấp độ", // vn-ok: approved Vietnamese runtime copy
        mode: "Hình thức phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        start: "Bắt đầu phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        starting: "Đang tạo buổi phỏng vấn…", // vn-ok: approved Vietnamese runtime copy
        resume: "Tiếp tục phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        resumable: "Bạn có một buổi phỏng vấn chưa hoàn thành. Hãy tiếp tục hoặc bắt đầu đề mới.", // vn-ok: approved Vietnamese runtime copy
        failed: "Không tải được phần chuẩn bị phỏng vấn.", // vn-ok: approved Vietnamese runtime copy
        retry: "Thử lại", // vn-ok: approved Vietnamese runtime copy
        tabsLabel: "Thiết lập phỏng vấn thử", // vn-ok: approved Vietnamese runtime copy
        tabs: { begin: "Bắt đầu", history: "Lịch sử", stats: "Thống kê" }, // vn-ok: approved Vietnamese runtime copy
        beginTitle: "Phòng chuẩn bị", // vn-ok: approved Vietnamese runtime copy
        briefingEyebrow: "Phiên phỏng vấn theo khóa học", // vn-ok: approved Vietnamese runtime copy
        briefingTitle: "Sẵn sàng cho một phiên phỏng vấn kỹ thuật có trọng tâm", // vn-ok: approved Vietnamese runtime copy
        setupTitle: "Thiết lập phiên", // vn-ok: approved Vietnamese runtime copy
        setupDescription: "Chọn hai thông số trước khi bước vào phòng phỏng vấn.", // vn-ok: approved Vietnamese runtime copy
        sequenceTitle: "Sau khi bắt đầu", // vn-ok: approved Vietnamese runtime copy
        sequenceSteps: [
            { id: "create", title: "Máy chủ tạo phiên", description: "Câu hỏi được chọn theo khóa học và thiết lập hiện tại." }, // vn-ok: approved Vietnamese runtime copy
            { id: "answer", title: "Bạn trả lời trong phòng phỏng vấn", description: "Phiên được lưu để không mất tiến độ." }, // vn-ok: approved Vietnamese runtime copy
            { id: "feedback", title: "Nhận phản hồi chi tiết", description: "Kết quả xuất hiện trong Lịch sử và Thống kê." }, // vn-ok: approved Vietnamese runtime copy
        ],
        serverNote: "Câu hỏi chỉ được tạo sau khi bạn bắt đầu. Thiết lập này không làm thay đổi nội dung khóa học.", // vn-ok: approved Vietnamese runtime copy
        savedNote: "Phiên mới sẽ được lưu vào lịch sử của bạn.", // vn-ok: approved Vietnamese runtime copy
        historyTitle: "Lịch sử phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        statsTitle: "Thống kê phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        historyEmpty: "Lịch sử phỏng vấn đã hoàn thành sẽ xuất hiện tại đây.", // vn-ok: approved Vietnamese runtime copy
        statsEmpty: "Thống kê sẽ xuất hiện sau buổi phỏng vấn hoàn thành đầu tiên.", // vn-ok: approved Vietnamese runtime copy
        historyFailed: "Không tải được lịch sử phỏng vấn.", // vn-ok: approved Vietnamese runtime copy
        statsFailed: "Không tải được thống kê phỏng vấn.", // vn-ok: approved Vietnamese runtime copy
        returnToBegin: "Chuẩn bị phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        resumeTitle: "Buổi gần nhất vẫn còn hiệu lực", // vn-ok: approved Vietnamese runtime copy
        readiness: { level: "Độ sẵn sàng", mode: "Định dạng", focus: "Trọng tâm" }, // vn-ok: approved Vietnamese runtime copy
        levels: { junior: "Sơ cấp", middle: "Trung cấp", senior: "Cao cấp" }, // vn-ok: approved Vietnamese runtime copy
        modes: { qna: "Hỏi đáp kỹ thuật", design: "Thiết kế hệ thống" }, // vn-ok: approved Vietnamese runtime copy
    },
} as const

/** Resolve setup data, start or resume a durable mock-interview session, and navigate to its route. */
export const CourseMockInterviewSetupBlock = ({ displayId }: CourseMockInterviewSetupPageProps) => {
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const courseId = course.data?.id
    const inProgress = useQueryMyInProgressMockInterviewSessionSwr(courseId)
    const startSession = useMutateStartMockInterviewSessionSwr(courseId)
    const attempts = useQueryMyMockInterviewAttemptsSwr(courseId)
    const stats = useQueryMyMockInterviewStatsSwr(courseId)
    const [level, setLevel] = useState("middle")
    const [mode, setMode] = useState("qna")
    const [selectedTab, setSelectedTab] = useState<"begin" | "history" | "stats">("begin")
    const [startError, setStartError] = useState(false)
    const failed = course.error !== undefined || inProgress.error !== undefined || startError || course.data === null
    const pending = !failed && (course.data === undefined || inProgress.data === undefined)
    const state = setupStateOf(failed, startSession.isMutating, pending, inProgress.data !== null)

    const openSession = (sessionId: string) => {
        router.push(`/courses/${displayId}/learn/mock-interview/interview/${sessionId}`)
    }

    const start = async () => {
        if (courseId === undefined) return
        setStartError(false)
        try {
            const response = await startSession.trigger({ courseId, level, mode })
            const payload = response.data?.startMockInterviewSession
            if (payload?.success !== true || payload.data === null || payload.data === undefined) throw new Error(payload?.error ?? "START_FAILED")
            await inProgress.mutate()
            openSession(payload.data.sessionId)
        } catch {
            setStartError(true)
        }
    }

    const resumableSessionId = inProgress.data?.sessionId

    return (
        <CourseMockInterviewSetupBlockBase
            state={state}
            props={{
                title: copy.title,
                description: copy.description,
                journeyLabel: copy.journey,
                journeyStageLabel: copy.journeyStage,
                status: setupStatusOf(state, copy),
                levelLabel: copy.level,
                modeLabel: copy.mode,
                levels: Object.entries(copy.levels).map(([id, label]) => ({ id, label })),
                modes: Object.entries(copy.modes).map(([id, label]) => ({ id, label })),
                selectedLevel: level,
                selectedMode: mode,
                startLabel: copy.start,
                resumeLabel: copy.resume,
                retryLabel: copy.retry,
                selectedTab,
                tabsLabel: copy.tabsLabel,
                tabs: Object.entries(copy.tabs).map(([id, label]) => ({ id, label })),
                beginTitle: copy.beginTitle,
                briefingEyebrow: copy.briefingEyebrow,
                briefingTitle: copy.briefingTitle,
                setupTitle: copy.setupTitle,
                setupDescription: copy.setupDescription,
                sequenceTitle: copy.sequenceTitle,
                sequenceSteps: copy.sequenceSteps,
                serverNote: copy.serverNote,
                savedNote: copy.savedNote,
                historyTitle: copy.historyTitle,
                statsTitle: copy.statsTitle,
                historyEmpty: copy.historyEmpty,
                statsEmpty: copy.statsEmpty,
                historyFailed: copy.historyFailed,
                statsFailed: copy.statsFailed,
                historyState: historyStateOf(attempts.error, attempts.data),
                statsState: statsStateOf(stats.error, stats.data),
                historyRows: (attempts.data?.items ?? []).map((attempt) => ({
                    id: attempt.id,
                    title: attempt.name ?? attempt.promptTitle,
                    fact: `${attempt.overallScore}/100 · ${attempt.verdict}`,
                })),
                statsRows: (stats.data?.byPhase ?? []).map((row) => ({
                    id: row.key,
                    title: row.key,
                    percent: row.avgMax <= 0 ? 0 : Math.round((row.avgScore / row.avgMax) * 100),
                    percentText: `${Math.round(row.avgScore)}/${Math.round(row.avgMax)}`,
                })),
                returnToBegin: copy.returnToBegin,
                resumeTitle: copy.resumeTitle,
                readinessLabels: [copy.readiness.level, copy.readiness.mode, copy.readiness.focus],
                focus: course.data?.title ?? displayId,
            }}
            on={{
                selectTab: setSelectedTab,
                configure: (field, value) => {
                    if (field === "level") setLevel(value)
                    else setMode(value)
                },
                start: () => { void start() },
                resume: resumableSessionId === undefined ? undefined : () => openSession(resumableSessionId),
                retry: () => {
                    setStartError(false)
                    void Promise.all([course.mutate(), inProgress.mutate()])
                },
            }}
        />
    )
}

/** Source-level ownership marker for the connected setup twin. */
export const meta = { world: "connected", domain: "learn" } as const
