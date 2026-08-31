import { act, render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestInput = { state: string; props: { status?: string; selectedTab?: string; selectedLevel?: string; selectedMode?: string }; on: { access: () => void; configure: (field: string, value: string) => void; start: () => void; resume?: () => void; retry: () => void; selectTab: (tab: string) => void } }
const mocks = vi.hoisted(() => ({
    input: undefined as TestInput | undefined,
    course: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    session: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    attempts: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    stats: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    start: { isMutating: false, trigger: vi.fn() }, push: vi.fn(), replace: vi.fn(), locale: "en",
    restoring: false,
    searchTab: null as string | null,
    searchLevel: null as string | null,
    searchMode: null as string | null,
    sessionHook: vi.fn(), startHook: vi.fn(), attemptsHook: vi.fn(), statsHook: vi.fn(),
}))

vi.mock("next-intl", () => ({ useLocale: () => mocks.locale }))
vi.mock("next/navigation", () => ({ useSearchParams: () => ({
    get: (key: string) => ({ tab: mocks.searchTab, level: mocks.searchLevel, mode: mocks.searchMode }[key] ?? null),
}) }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push, replace: mocks.replace }) }))
vi.mock("@/hooks/auth/useSessionRefresh", () => ({ useSessionRefresh: () => ({ isRestoring: mocks.restoring }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryMyInProgressMockInterviewSessionSwr", () => ({ useQueryMyInProgressMockInterviewSessionSwr: (courseId: string | undefined) => { mocks.sessionHook(courseId); return mocks.session } }))
vi.mock("@/hooks/swr/useMutateStartMockInterviewSessionSwr", () => ({ useMutateStartMockInterviewSessionSwr: (courseId: string | undefined) => { mocks.startHook(courseId); return mocks.start } }))
vi.mock("@/hooks/swr/useQueryMyMockInterviewAttemptsSwr", () => ({ useQueryMyMockInterviewAttemptsSwr: (courseId: string | undefined) => { mocks.attemptsHook(courseId); return mocks.attempts } }))
vi.mock("@/hooks/swr/useQueryMyMockInterviewStatsSwr", () => ({ useQueryMyMockInterviewStatsSwr: (courseId: string | undefined) => { mocks.statsHook(courseId); return mocks.stats } }))
vi.mock("./component", () => ({ CourseMockInterviewSetupBlockBase: (input: TestInput) => { mocks.input = input; return <output data-testid="setup" /> } }))

import { CourseMockInterviewSetupBlock } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.input = undefined
    mocks.locale = "en"
    mocks.restoring = false
    mocks.searchTab = null
    mocks.searchLevel = null
    mocks.searchMode = null
    mocks.start.isMutating = false
    for (const item of [mocks.course, mocks.session, mocks.attempts, mocks.stats]) { item.data = undefined; item.error = undefined }
})

describe("CourseMockInterviewSetupBlock", () => {
    it("renders the guided setup workspace directly in the overview", () => {
        mocks.course.data = { id: "c1", title: "Course", isEnrolled: true }
        mocks.session.data = null
        mocks.attempts.data = { items: [] }
        mocks.stats.data = { insufficientData: true, byPhase: [] }

        render(<CourseMockInterviewSetupBlock displayId="course" />)
        expect(mocks.input?.props).toMatchObject({
            selectedTab: "begin",
            selectedMode: "qna",
            selectedLevel: "middle",
        })
    })

    it("opens a report-linked history destination", () => {
        mocks.searchTab = "history"
        render(<CourseMockInterviewSetupBlock displayId="course" />)
        expect(mocks.input?.props).toMatchObject({ selectedTab: "history" })
    })

    it("synchronizes the visible destination when route search changes", async () => {
        mocks.searchTab = "stats"
        const view = render(<CourseMockInterviewSetupBlock displayId="course" />)
        expect(mocks.input?.props).toMatchObject({ selectedTab: "stats" })

        mocks.searchTab = null
        view.rerender(<CourseMockInterviewSetupBlock displayId="course" />)
        await waitFor(() => expect(mocks.input?.props).toMatchObject({ selectedTab: "begin" }))
    })

    it("restores selected interview choices from route state and sends them to start", async () => {
        mocks.searchLevel = "senior"
        mocks.searchMode = "design"
        mocks.course.data = { id: "c1", title: "Course", isEnrolled: true }
        mocks.session.data = null
        mocks.attempts.data = { items: [] }
        mocks.stats.data = { insufficientData: true, byPhase: [] }
        mocks.start.trigger.mockResolvedValue({ data: { startMockInterviewSession: { success: true, data: { sessionId: "new" } } } })

        render(<CourseMockInterviewSetupBlock displayId="course" />)
        expect(mocks.input?.props).toMatchObject({ selectedLevel: "senior", selectedMode: "design" })

        act(() => { mocks.input?.on.start() })

        await waitFor(() => expect(mocks.start.trigger).toHaveBeenCalledWith({ courseId: "c1", level: "senior", mode: "design" }))
    })

    it("handles pending, failed, resumable and successful start states", async () => {
        const view = render(<CourseMockInterviewSetupBlock displayId="course" />)
        expect(mocks.input?.state).toBe("pending")
        mocks.course.error = new Error("offline")
        view.rerender(<CourseMockInterviewSetupBlock displayId="course" />)
        expect(mocks.input?.state).toBe("failed")

        mocks.course.error = undefined
        mocks.course.data = { id: "c1", title: "Course", isEnrolled: true }
        mocks.session.data = { sessionId: "resume" }
        mocks.attempts.data = { items: [] }
        mocks.stats.data = { insufficientData: true, byPhase: [] }
        view.rerender(<CourseMockInterviewSetupBlock displayId="course" />)
        expect(mocks.input?.state).toBe("resumable")
        act(() => { mocks.input?.on.resume?.() })
        expect(mocks.push).toHaveBeenCalledWith("/courses/course/learn/mock-interview/interview/resume")

        mocks.session.data = null
        mocks.start.trigger.mockResolvedValue({ data: { startMockInterviewSession: { success: true, data: { sessionId: "new" } } } })
        view.rerender(<CourseMockInterviewSetupBlock displayId="course" />)
        act(() => { mocks.input?.on.configure("level", "senior"); mocks.input?.on.configure("mode", "design"); mocks.input?.on.selectTab("history") })
        expect(mocks.replace).toHaveBeenCalledWith("/courses/course/learn/mock-interview?tab=history")
        act(() => { mocks.input?.on.start() })
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/courses/course/learn/mock-interview/interview/new"))
        act(() => { mocks.input?.on.retry() })
        expect(mocks.course.mutate).toHaveBeenCalled()
    })

    it("shows an access gate instead of waiting forever when the course is locked", () => {
        mocks.course.data = { id: "c1", title: "Course", isEnrolled: false }

        render(<CourseMockInterviewSetupBlock displayId="course" />)

        expect(mocks.input?.state).toBe("locked")
        expect(mocks.sessionHook).toHaveBeenLastCalledWith(undefined)
        expect(mocks.startHook).toHaveBeenLastCalledWith(undefined)
        act(() => { mocks.input?.on.access() })
        expect(mocks.push).toHaveBeenCalledWith("/courses/course")
    })

    it("keeps the room usable when creating a session fails", async () => {
        mocks.course.data = { id: "c1", title: "Course", isEnrolled: true }
        mocks.session.data = null
        mocks.attempts.data = { items: [] }
        mocks.stats.data = { insufficientData: true, byPhase: [] }
        mocks.start.trigger.mockRejectedValue(new Error("offline"))

        render(<CourseMockInterviewSetupBlock displayId="course" />)
        act(() => { mocks.input?.on.start() })

        await waitFor(() => expect(mocks.input?.props.status).toBe("The session could not be created. Check your connection and try again."))
        expect(mocks.input?.state).toBe("ready")
    })
})
