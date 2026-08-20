"use client"

import { useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryMyInProgressMockInterviewSessionSwr } from "@/hooks/swr/useQueryMyInProgressMockInterviewSessionSwr"
import { useMutateStartMockInterviewSessionSwr } from "@/hooks/swr/useMutateStartMockInterviewSessionSwr"
import { CourseMockInterviewSetupPageBase } from "./component"

/** Route-owned input for the connected setup page. */
export type CourseMockInterviewSetupPageProps = { readonly displayId: string }

const COPY = {
    en: {
        title: "Mock interview",
        description: "Practise a technical interview grounded in this course, then receive detailed feedback.",
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
        historyEmpty: "Completed interview history will appear here.",
        statsEmpty: "Interview statistics will appear after your first completed session.",
        returnToBegin: "Prepare an interview",
        resumeTitle: "Your latest session is still active",
        readiness: { level: "Readiness", mode: "Format", focus: "Focus" },
        levels: { junior: "Junior", middle: "Middle", senior: "Senior" },
        modes: { qna: "Technical Q&A", design: "System design" },
    },
    vi: {
        title: "Phỏng vấn thử", // vn-ok: approved Vietnamese runtime copy
        description: "Luyện phỏng vấn kỹ thuật theo nội dung khóa học và nhận phản hồi chi tiết.", // vn-ok: approved Vietnamese runtime copy
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
        historyEmpty: "Lịch sử phỏng vấn đã hoàn thành sẽ xuất hiện tại đây.", // vn-ok: approved Vietnamese runtime copy
        statsEmpty: "Thống kê sẽ xuất hiện sau buổi phỏng vấn hoàn thành đầu tiên.", // vn-ok: approved Vietnamese runtime copy
        returnToBegin: "Chuẩn bị phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        resumeTitle: "Buổi gần nhất vẫn còn hiệu lực", // vn-ok: approved Vietnamese runtime copy
        readiness: { level: "Độ sẵn sàng", mode: "Định dạng", focus: "Trọng tâm" }, // vn-ok: approved Vietnamese runtime copy
        levels: { junior: "Sơ cấp", middle: "Trung cấp", senior: "Cao cấp" }, // vn-ok: approved Vietnamese runtime copy
        modes: { qna: "Hỏi đáp kỹ thuật", design: "Thiết kế hệ thống" }, // vn-ok: approved Vietnamese runtime copy
    },
} as const

/** Resolve setup data, start or resume a durable mock-interview session, and navigate to its route. */
export const CourseMockInterviewSetupPage = ({ displayId }: CourseMockInterviewSetupPageProps) => {
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const courseId = course.data?.id
    const inProgress = useQueryMyInProgressMockInterviewSessionSwr(courseId)
    const startSession = useMutateStartMockInterviewSessionSwr(courseId)
    const [level, setLevel] = useState("middle")
    const [mode, setMode] = useState("qna")
    const [selectedTab, setSelectedTab] = useState<"begin" | "history" | "stats">("begin")
    const [startError, setStartError] = useState(false)
    const failed = course.error !== undefined || inProgress.error !== undefined || startError || course.data === null
    const pending = !failed && (course.data === undefined || inProgress.data === undefined)
    const state = failed
        ? "failed"
        : startSession.isMutating
            ? "starting"
            : pending
                ? "pending"
                : inProgress.data === null
                    ? "ready"
                    : "resumable"

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
        <CourseMockInterviewSetupPageBase
            state={state}
            props={{
                title: copy.title,
                description: copy.description,
                status: state === "resumable" ? copy.resumable : state === "starting" ? copy.starting : state === "failed" ? copy.failed : undefined,
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
                historyEmpty: copy.historyEmpty,
                statsEmpty: copy.statsEmpty,
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
