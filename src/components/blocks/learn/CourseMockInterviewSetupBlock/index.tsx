"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useSessionRefresh } from "@/hooks/auth/useSessionRefresh"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryMyInProgressMockInterviewSessionSwr } from "@/hooks/swr/useQueryMyInProgressMockInterviewSessionSwr"
import { useMutateStartMockInterviewSessionSwr } from "@/hooks/swr/useMutateStartMockInterviewSessionSwr"
import { useQueryMyMockInterviewAttemptsSwr } from "@/hooks/swr/useQueryMyMockInterviewAttemptsSwr"
import { useQueryMyMockInterviewStatsSwr } from "@/hooks/swr/useQueryMyMockInterviewStatsSwr"
import { mockInterviewVerdictLabel } from "../CourseMockInterviewResultBlock/verdict"
import { CourseMockInterviewSetupBlockBase, type CourseMockInterviewSetupState } from "./component"

/** Route-owned input for the connected setup page. */
export type CourseMockInterviewSetupPageProps = { readonly displayId: string; readonly courseTitle?: string }
type SetupStatusCopy = { readonly resumable: string; readonly starting: string; readonly failed: string }
type HistoryData = { readonly items: ReadonlyArray<unknown> }
type StatsData = { readonly insufficientData: boolean; readonly byPhase: ReadonlyArray<unknown> }

const setupStateOf = (
    failed: boolean,
    locked: boolean,
    starting: boolean,
    pending: boolean,
    hasResumableSession: boolean,
): CourseMockInterviewSetupState => {
    if (failed) return "failed"
    if (locked) return "locked"
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

const formatAttemptDate = (value: string, locale: string) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)
}

const COPY = {
    en: {
        title: "Mock interview",
        description: "Practise a technical interview grounded in this course, then receive detailed feedback.",
        heroEyebrow: "Course-grounded practice",
        heroAction: "Set up your interview",
        mediaAlt: "A learner practising a technical interview with an interviewer",
        heroFacts: [
            { label: "Formats", value: "2 options" },
            { label: "Seniority", value: "3 levels" },
            { label: "Session limit", value: "Up to 60 minutes" },
        ],
        level: "Seniority",
        mode: "Interview format",
        start: "Start interview",
        starting: "Starting your interview…",
        resume: "Resume interview",
        viewGrading: "View grading status",
        resumable: "You have an unfinished interview. Resume it before starting another session.",
        failed: "The interview setup could not be loaded.",
        startFailed: "The session could not be created. Check your connection and try again.",
        retry: "Try again",
        accessMessage: "Mock interviews unlock with full course access. Enrol in this course to create and resume interview sessions.",
        accessLabel: "View course access",
        tabsLabel: "Mock interview setup",
        tabs: { begin: "Overview", history: "History", stats: "Statistics" },
        beginTitle: "Prepare your next interview",
        briefingEyebrow: "Course-grounded interview",
        briefingTitle: "Get ready for a focused technical interview",
        setupTitle: "Choose the practice you need today",
        setupDescription: "Set the interview format and depth before StarCi creates the first question.",
        serverNote: "Questions are generated only after you begin. These settings do not change the course content.",
        savedNote: "A new session will be saved to your interview history.",
        historyTitle: "Interview history",
        statsTitle: "Interview statistics",
        historyEmpty: "Completed interview history will appear here.",
        statsEmpty: "Interview statistics will appear after at least 3 comparable sessions with the same format, seniority and rubric.",
        historyFailed: "Completed interviews could not be loaded.",
        statsFailed: "Interview statistics could not be loaded.",
        recentHistoryTitle: "Recent interviews",
        progressTitle: "Practice progress",
        viewHistory: "View all history",
        viewStats: "View statistics",
        historyAction: "View result",
        completedCount: (count: number) => `${count} completed`,
        newSessionEyebrow: "New practice session",
        newSessionLabel: "Practise a new interview",
        preflightTitle: "Review before starting",
        returnToBegin: "Back to overview",
        resumeTitle: "Your latest session is still active",
        readiness: { level: "Readiness", mode: "Format", focus: "Focus" },
        levels: {
            junior: { label: "Junior", description: "Reinforce fundamentals and explain core choices clearly." },
            middle: { label: "Middle", description: "Connect concepts, diagnose trade-offs and justify decisions." },
            senior: { label: "Senior", description: "Handle ambiguity and defend complex architectural trade-offs." },
        },
        modes: {
            qna: { label: "Technical Q&A", description: "Answer focused questions and explain how you reached each decision." },
            design: { label: "System design", description: "Clarify requirements, propose an architecture and defend its trade-offs." },
        },
    },
    vi: {
        title: "Phỏng vấn thử", // vn-ok: approved Vietnamese runtime copy
        description: "Luyện phỏng vấn kỹ thuật theo nội dung khóa học và nhận phản hồi chi tiết.", // vn-ok: approved Vietnamese runtime copy
        heroEyebrow: "Luyện theo khóa học", // vn-ok: approved Vietnamese runtime copy
        heroAction: "Thiết lập phiên", // vn-ok: approved Vietnamese runtime copy
        mediaAlt: "Học viên luyện phỏng vấn kỹ thuật cùng người phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        heroFacts: [ // vn-ok: approved Vietnamese runtime copy
            { label: "Hình thức", value: "2 lựa chọn" }, // vn-ok: approved Vietnamese runtime copy
            { label: "Cấp độ", value: "3 mức" }, // vn-ok: approved Vietnamese runtime copy
            { label: "Thời hạn phiên", value: "Tối đa 60 phút" }, // vn-ok: approved Vietnamese runtime copy
        ],
        level: "Cấp độ", // vn-ok: approved Vietnamese runtime copy
        mode: "Hình thức phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        start: "Bắt đầu phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        starting: "Đang tạo buổi phỏng vấn…", // vn-ok: approved Vietnamese runtime copy
        resume: "Tiếp tục phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        viewGrading: "Xem trạng thái chấm điểm", // vn-ok: approved Vietnamese runtime copy
        resumable: "Bạn có một buổi phỏng vấn chưa hoàn thành. Hãy tiếp tục phiên này trước khi bắt đầu phiên khác.", // vn-ok: approved Vietnamese runtime copy
        failed: "Không tải được phần chuẩn bị phỏng vấn.", // vn-ok: approved Vietnamese runtime copy
        startFailed: "Không thể tạo phiên phỏng vấn. Hãy kiểm tra kết nối rồi thử lại.", // vn-ok: approved Vietnamese runtime copy
        retry: "Thử lại", // vn-ok: approved Vietnamese runtime copy
        accessMessage: "Phỏng vấn thử chỉ dành cho học viên đã mở khóa khóa học. Hãy đăng ký khóa học để tạo hoặc tiếp tục phiên phỏng vấn.", // vn-ok: approved Vietnamese runtime copy
        accessLabel: "Xem quyền truy cập", // vn-ok: approved Vietnamese runtime copy
        tabsLabel: "Thiết lập phỏng vấn thử", // vn-ok: approved Vietnamese runtime copy
        tabs: { begin: "Tổng quan", history: "Lịch sử", stats: "Thống kê" }, // vn-ok: approved Vietnamese runtime copy
        beginTitle: "Chuẩn bị phiên tiếp theo", // vn-ok: approved Vietnamese runtime copy
        briefingEyebrow: "Phiên phỏng vấn theo khóa học", // vn-ok: approved Vietnamese runtime copy
        briefingTitle: "Sẵn sàng cho một phiên phỏng vấn kỹ thuật có trọng tâm", // vn-ok: approved Vietnamese runtime copy
        setupTitle: "Chọn bài luyện phù hợp hôm nay", // vn-ok: approved Vietnamese runtime copy
        setupDescription: "Chọn hình thức và độ sâu trước khi StarCi tạo câu hỏi đầu tiên.", // vn-ok: approved Vietnamese runtime copy
        serverNote: "Câu hỏi chỉ được tạo sau khi bạn bắt đầu. Thiết lập này không làm thay đổi nội dung khóa học.", // vn-ok: approved Vietnamese runtime copy
        savedNote: "Phiên mới sẽ được lưu vào lịch sử của bạn.", // vn-ok: approved Vietnamese runtime copy
        historyTitle: "Lịch sử phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        statsTitle: "Thống kê phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        historyEmpty: "Lịch sử phỏng vấn đã hoàn thành sẽ xuất hiện tại đây.", // vn-ok: approved Vietnamese runtime copy
        statsEmpty: "Thống kê sẽ xuất hiện sau ít nhất 3 phiên có cùng hình thức, cấp độ và bộ tiêu chí.", // vn-ok: approved Vietnamese runtime copy
        historyFailed: "Không tải được lịch sử phỏng vấn.", // vn-ok: approved Vietnamese runtime copy
        statsFailed: "Không tải được thống kê phỏng vấn.", // vn-ok: approved Vietnamese runtime copy
        recentHistoryTitle: "Lịch sử gần nhất", // vn-ok: approved Vietnamese runtime copy
        progressTitle: "Tiến độ luyện tập", // vn-ok: approved Vietnamese runtime copy
        viewHistory: "Xem toàn bộ lịch sử", // vn-ok: approved Vietnamese runtime copy
        viewStats: "Xem thống kê", // vn-ok: approved Vietnamese runtime copy
        historyAction: "Xem kết quả", // vn-ok: approved Vietnamese runtime copy
        completedCount: (count: number) => `${count} phiên hoàn thành`, // vn-ok: approved Vietnamese runtime copy
        newSessionEyebrow: "Phiên luyện mới", // vn-ok: approved Vietnamese runtime copy
        newSessionLabel: "Luyện phiên mới", // vn-ok: approved Vietnamese runtime copy
        preflightTitle: "Kiểm tra trước khi bắt đầu", // vn-ok: approved Vietnamese runtime copy
        returnToBegin: "Quay lại tổng quan", // vn-ok: approved Vietnamese runtime copy
        resumeTitle: "Buổi gần nhất vẫn còn hiệu lực", // vn-ok: approved Vietnamese runtime copy
        readiness: { level: "Độ sẵn sàng", mode: "Định dạng", focus: "Trọng tâm" }, // vn-ok: approved Vietnamese runtime copy
        levels: { // vn-ok: approved Vietnamese runtime copy
            junior: { label: "Sơ cấp", description: "Củng cố nền tảng và giải thích rõ các lựa chọn cốt lõi." }, // vn-ok: approved Vietnamese runtime copy
            middle: { label: "Trung cấp", description: "Kết nối kiến thức, nhận diện đánh đổi và bảo vệ quyết định." }, // vn-ok: approved Vietnamese runtime copy
            senior: { label: "Cao cấp", description: "Xử lý yêu cầu mơ hồ và bảo vệ các đánh đổi kiến trúc phức tạp." }, // vn-ok: approved Vietnamese runtime copy
        },
        modes: { // vn-ok: approved Vietnamese runtime copy
            qna: { label: "Hỏi đáp kỹ thuật", description: "Trả lời theo lượt và giải thích cách bạn đi đến từng quyết định." }, // vn-ok: approved Vietnamese runtime copy
            design: { label: "Thiết kế hệ thống", description: "Làm rõ yêu cầu, đề xuất kiến trúc và bảo vệ các đánh đổi." }, // vn-ok: approved Vietnamese runtime copy
        },
    },
} as const

/** Resolve setup data, start or resume a durable mock-interview session, and navigate to its route. */
/** Route identity used to load mock interview setup. */
export type CourseMockInterviewSetupBlockProps = CourseMockInterviewSetupPageProps
/** Resolve setup state and start or resume a mock-interview session. */
export const CourseMockInterviewSetupBlock = (props: CourseMockInterviewSetupBlockProps) => {
    const { displayId } = props
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const searchParams = useSearchParams()
    const requestedTab = searchParams.get("tab")
    const requestedLevel = searchParams.get("level")
    const requestedMode = searchParams.get("mode")
    const session = useSessionRefresh()
    const course = useQueryCourseSwr({ displayId })
    const courseId = course.data?.isEnrolled === true ? course.data.id : undefined
    const inProgress = useQueryMyInProgressMockInterviewSessionSwr(courseId)
    const startSession = useMutateStartMockInterviewSessionSwr(courseId)
    const attempts = useQueryMyMockInterviewAttemptsSwr(courseId)
    const stats = useQueryMyMockInterviewStatsSwr(courseId)
    const [level, setLevel] = useState(
        requestedLevel === "junior" || requestedLevel === "senior" ? requestedLevel : "middle",
    )
    const [mode, setMode] = useState(requestedMode === "design" ? "design" : "qna")
    const [selectedTab, setSelectedTab] = useState<"begin" | "history" | "stats">(
        requestedTab === "history" || requestedTab === "stats" ? requestedTab : "begin",
    )
    const [startError, setStartError] = useState(false)
    useEffect(() => {
        setSelectedTab(requestedTab === "history" || requestedTab === "stats" ? requestedTab : "begin")
    }, [requestedTab])
    useEffect(() => {
        if (requestedLevel === "junior" || requestedLevel === "middle" || requestedLevel === "senior") setLevel(requestedLevel)
        if (requestedMode === "qna" || requestedMode === "design") setMode(requestedMode)
    }, [requestedLevel, requestedMode])
    const failed = course.error !== undefined || course.data === null || (courseId !== undefined && inProgress.error !== undefined)
    const pending = !failed && (session.isRestoring || course.data === undefined || (courseId !== undefined && inProgress.data === undefined))
    const locked = !pending && course.data !== null && course.data !== undefined && course.data.isEnrolled !== true
    const state = setupStateOf(failed, locked, startSession.isMutating, pending, inProgress.data !== null)

    const openSession = (sessionId: string, status = "in_progress") => {
        const roomPath = `/courses/${displayId}/learn/mock-interview/interview/${sessionId}`
        router.push(status === "in_progress" ? roomPath : `${roomPath}/result`)
    }
    const selectDestination = (destination: "begin" | "history" | "stats") => {
        setSelectedTab(destination)
        const setupPath = `/courses/${displayId}/learn/mock-interview`
        const params = new URLSearchParams()
        if (destination !== "begin") params.set("tab", destination)
        if (level !== "middle") params.set("level", level)
        if (mode !== "qna") params.set("mode", mode)
        const query = params.toString()
        router.replace(query.length === 0 ? setupPath : `${setupPath}?${query}`)
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
            const authoritative = await inProgress.mutate()
            if (authoritative !== undefined && authoritative !== null) {
                openSession(authoritative.sessionId, authoritative.status)
                return
            }
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
                heroEyebrow: copy.heroEyebrow,
                heroActionLabel: copy.heroAction,
                mediaAlt: copy.mediaAlt,
                heroFacts: copy.heroFacts,
                status: startError ? copy.startFailed : setupStatusOf(state, copy),
                levelLabel: copy.level,
                modeLabel: copy.mode,
                levels: Object.entries(copy.levels).map(([id, option]) => ({ id, ...option })),
                modes: Object.entries(copy.modes).map(([id, option]) => ({ id, ...option })),
                selectedLevel: level,
                selectedMode: mode,
                startLabel: copy.start,
                resumeLabel: inProgress.data?.status === "in_progress" ? copy.resume : copy.viewGrading,
                retryLabel: copy.retry,
                accessMessage: copy.accessMessage,
                accessLabel: copy.accessLabel,
                selectedTab,
                tabsLabel: copy.tabsLabel,
                tabs: Object.entries(copy.tabs).map(([id, label]) => ({ id, label })),
                beginTitle: copy.beginTitle,
                briefingEyebrow: copy.briefingEyebrow,
                briefingTitle: copy.briefingTitle,
                setupTitle: copy.setupTitle,
                setupDescription: copy.setupDescription,
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
                    id: attempt.sessionId,
                    title: attempt.name ?? attempt.promptTitle,
                    fact: `${formatAttemptDate(attempt.createdAt, locale)} · ${attempt.overallScore}/100 · ${mockInterviewVerdictLabel(attempt.verdict, locale) ?? attempt.verdict}`,
                })),
                statsRows: (stats.data?.byPhase ?? []).map((row) => ({
                    id: row.key,
                    title: row.key,
                    percent: row.avgMax <= 0 ? 0 : Math.round((row.avgScore / row.avgMax) * 100),
                    percentText: `${Math.round(row.avgScore)}/${Math.round(row.avgMax)}`,
                })),
                historyCountLabel: copy.completedCount(attempts.data?.totalCount ?? 0),
                recentHistoryTitle: copy.recentHistoryTitle,
                progressTitle: copy.progressTitle,
                viewHistoryLabel: copy.viewHistory,
                viewStatsLabel: copy.viewStats,
                historyActionLabel: copy.historyAction,
                newSessionEyebrow: copy.newSessionEyebrow,
                newSessionLabel: copy.newSessionLabel,
                preflightTitle: copy.preflightTitle,
                returnToBegin: copy.returnToBegin,
                resumeTitle: copy.resumeTitle,
                readinessLabels: [copy.readiness.level, copy.readiness.mode, copy.readiness.focus],
                focus: course.data?.title ?? props.courseTitle ?? displayId,
            }}
            on={{
                selectTab: selectDestination,
                configure: (field, value) => {
                    if (field === "level") setLevel(value)
                    else setMode(value)
                },
                start: () => { void start() },
                resume: resumableSessionId === undefined ? undefined : () => openSession(resumableSessionId, inProgress.data?.status),
                retry: () => {
                    setStartError(false)
                    void Promise.all([course.mutate(), inProgress.mutate()])
                },
                access: () => router.push(`/courses/${displayId}`),
                openHistory: (sessionId) => openSession(sessionId, "completed"),
                prepare: () => {
                    const target = document.getElementById("mock-interview-new-session")
                    target?.scrollIntoView({ block: "center", behavior: "smooth" })
                    target?.focus({ preventScroll: true })
                },
            }}
        />
    )
}
