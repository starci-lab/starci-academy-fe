import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestBlockInput = { state: string; props: Record<string, unknown>; on: Record<string, (...args: ReadonlyArray<unknown>) => unknown> }

const mocks = vi.hoisted(() => ({
    course: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    session: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    attempt: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    sync: { isMutating: false, trigger: vi.fn().mockResolvedValue({ data: { syncMockInterviewSessionTurns: { success: true } } }) },
    complete: { isMutating: false, trigger: vi.fn() },
    abandon: { isMutating: false, trigger: vi.fn() },
    router: { push: vi.fn(), replace: vi.fn() },
    socket: { isConnected: true, isStreaming: false, state: "connected", ask: vi.fn(), abort: vi.fn() },
    restoring: false,
}))

vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => mocks.router }))
vi.mock("@/hooks/auth/useSessionRefresh", () => ({ useSessionRefresh: () => ({ isRestoring: mocks.restoring }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryMyInProgressMockInterviewSessionSwr", () => ({ useQueryMyInProgressMockInterviewSessionSwr: () => mocks.session }))
vi.mock("@/hooks/swr/useQueryMockInterviewAttemptBySessionSwr", () => ({ useQueryMockInterviewAttemptBySessionSwr: () => mocks.attempt }))
vi.mock("@/hooks/swr/useMutateSyncMockInterviewSessionTurnsSwr", () => ({ useMutateSyncMockInterviewSessionTurnsSwr: () => mocks.sync }))
vi.mock("@/hooks/swr/useMutateMockInterviewSessionLifecycleSwr", () => ({
    useMutateCompleteMockInterviewSessionSwr: () => mocks.complete,
    useMutateAbandonMockInterviewSessionSwr: () => mocks.abandon,
}))
vi.mock("@/hooks/socketio/useMockInterviewSocketIo", () => ({ useMockInterviewSocketIo: () => mocks.socket }))
vi.mock("./component", () => ({
    CourseMockInterviewSessionBlockBase: ({ state, props, on }: TestBlockInput) => (
        <>
            <output data-testid="state">{state}</output>
            <output data-testid="props">{JSON.stringify(props)}</output>
            <button onClick={on.retry}>retry</button>
            <button onClick={on.leave}>leave</button>
            <button onClick={on.abort}>abort</button>
        </>
    ),
}))

import { CourseMockInterviewSessionBlock } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.restoring = false
    mocks.course.data = undefined
    mocks.course.error = undefined
    mocks.session.data = undefined
    mocks.session.error = undefined
    mocks.attempt.data = undefined
    mocks.attempt.error = undefined
})

describe("CourseMockInterviewSessionBlock", () => {
    it("reports connecting and failed restoration states", () => {
        const view = render(<CourseMockInterviewSessionBlock displayId="course" sessionId="s1" />)
        expect(screen.getByTestId("state")).toHaveTextContent("connecting")
        mocks.course.error = new Error("offline")
        view.rerender(<CourseMockInterviewSessionBlock displayId="course" sessionId="s1" />)
        expect(screen.getByTestId("state")).toHaveTextContent("failed")
    })

    it("retries and aborts immediately but confirms before abandoning", () => {
        render(<CourseMockInterviewSessionBlock displayId="course" sessionId="s1" />)
        fireEvent.click(screen.getByText("retry"))
        fireEvent.click(screen.getByText("abort"))
        fireEvent.click(screen.getByText("leave"))
        expect(mocks.course.mutate).toHaveBeenCalled()
        expect(mocks.socket.abort).toHaveBeenCalled()
        expect(screen.getByTestId("props")).toHaveTextContent("\"abandonConfirmationOpen\":true")
        expect(mocks.router.push).not.toHaveBeenCalled()
    })

    it("returns a locked direct session URL to the access explanation", () => {
        mocks.course.data = { id: "c1", isEnrolled: false }

        render(<CourseMockInterviewSessionBlock displayId="course" sessionId="s1" />)

        expect(screen.getByTestId("state")).toHaveTextContent("failed")
        expect(mocks.router.replace).toHaveBeenCalledWith("/courses/course/learn/mock-interview")
    })
})
