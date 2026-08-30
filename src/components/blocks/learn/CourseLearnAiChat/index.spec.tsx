import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type ChatInput = {
    readonly state: string
    readonly props: Record<string, unknown>
    readonly on: Record<string, ((value?: string) => void) | undefined>
}

const mocks = vi.hoisted(() => ({
    sessions: { data: { sessions: [] } as unknown, error: undefined as unknown, isLoading: false, mutate: vi.fn() },
    history: { data: { messages: [] } as unknown, mutate: vi.fn() },
    quota: { data: { credit: { remainingWeek: 3 } } as unknown, isLoading: false, mutate: vi.fn() },
    create: { trigger: vi.fn() },
    stream: { isStreaming: false, ask: vi.fn(), abort: vi.fn() },
    clear: vi.fn(),
}))

vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: () => (key: string) => key,
}))
vi.mock("@/hooks", () => ({
    useQueryContentAiSessionsSwr: () => mocks.sessions,
    useQueryContentAiHistorySwr: () => mocks.history,
    useQueryMyAiQuotaSwr: () => mocks.quota,
    useMutateCreateContentAiSessionSwr: () => mocks.create,
    useContentAiStream: () => mocks.stream,
}))
vi.mock("./component", () => ({
    CourseLearnAiChatBase: ({ state, props, on }: ChatInput) => (
        <>
            <output data-testid="state">{state}</output>
            <output data-testid="props">{JSON.stringify(props)}</output>
            <button onClick={() => on.selectMode?.("history")}>history</button>
            <button onClick={() => on.selectSession?.("session-2")}>session</button>
            <button onClick={() => on.changeDraft?.("updated question")}>draft</button>
            <button onClick={() => on.send?.()}>send</button>
            <button onClick={() => on.retry?.()}>retry</button>
            <button onClick={() => on.stop?.()}>stop</button>
            <button onClick={() => on.clearContext?.()}>clear</button>
        </>
    ),
}))

import { CourseLearnAiChat } from "./index"

const input = { displayId: "course", courseId: "course-1", challengeId: "challenge-1", challengeTitle: "Challenge" }

beforeEach(() => {
    vi.clearAllMocks()
    mocks.sessions.data = { sessions: [] }
    mocks.sessions.error = undefined
    mocks.sessions.isLoading = false
    mocks.history.data = { messages: [] }
    mocks.quota.data = { credit: { remainingWeek: 3 } }
    mocks.quota.isLoading = false
    mocks.create.trigger.mockResolvedValue({ id: "session-1" })
    mocks.stream.isStreaming = false
})

describe("CourseLearnAiChat", () => {
    it("resolves session and history states", () => {
        const view = render(<CourseLearnAiChat {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent("noSession")
        fireEvent.click(screen.getByText("history"))
        expect(screen.getByTestId("state")).toHaveTextContent("searchEmpty")
        mocks.sessions.isLoading = true
        view.rerender(<CourseLearnAiChat {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent("historyPending")
        mocks.sessions.isLoading = false
        mocks.sessions.error = new Error("offline")
        view.rerender(<CourseLearnAiChat {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent("historyFailed")
        mocks.sessions.error = undefined
        mocks.sessions.data = { sessions: [{ id: "session-1", title: null, updatedAt: "2026-08-27T00:00:00.000Z" }] }
        view.rerender(<CourseLearnAiChat {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent("historyReady")
        fireEvent.click(screen.getByText("session"))
        expect(screen.getByTestId("state")).toHaveTextContent("ready")
    })

    it("creates a session, streams a response and refreshes persisted evidence", async () => {
        render(<CourseLearnAiChat {...input} initialPrompt="Explain this" onClearSelection={mocks.clear} />)
        fireEvent.click(screen.getByText("send"))

        await waitFor(() => expect(mocks.stream.ask).toHaveBeenCalled())
        const request = mocks.stream.ask.mock.calls[0]![0]
        act(() => request.onDelta("answer"))
        expect(screen.getByTestId("props")).toHaveTextContent("answer")
        await act(async () => request.onDone(undefined))
        expect(mocks.clear).toHaveBeenCalled()
        await waitFor(() => expect(mocks.history.mutate).toHaveBeenCalled())
        expect(mocks.sessions.mutate).toHaveBeenCalled()
        expect(mocks.quota.mutate).toHaveBeenCalled()
    })

    it("never renders the machine-owned course-advisor envelope", async () => {
        const envelope = "<!--starci-course-advisor:{\"intent\":\"answer\",\"recommendations\":[]}-->"
        mocks.sessions.data = { sessions: [{ id: "session-1", title: "Thread", updatedAt: "2026-08-27T00:00:00.000Z" }] }
        mocks.history.data = { messages: [{ role: "assistant", content: `Persisted answer\n${envelope}` }] }
        render(<CourseLearnAiChat {...input} initialPrompt="Explain this" />)

        expect(screen.getByTestId("props")).toHaveTextContent("Persisted answer")
        expect(screen.getByTestId("props")).not.toHaveTextContent("starci-course-advisor")

        fireEvent.click(screen.getByText("send"))
        await waitFor(() => expect(mocks.stream.ask).toHaveBeenCalled())
        const request = mocks.stream.ask.mock.calls[0]![0]
        act(() => request.onDelta(`Streamed answer\n${envelope}`))
        expect(screen.getByTestId("props")).toHaveTextContent("starci-course-advisor")
        act(() => request.onDone(undefined))
        expect(screen.getByTestId("props")).toHaveTextContent("Streamed answer")
        expect(screen.getByTestId("props")).not.toHaveTextContent("starci-course-advisor")
    })

    it("surfaces creation, stream and quota failures and exposes controls", async () => {
        mocks.create.trigger.mockRejectedValueOnce(new Error("offline"))
        const view = render(<CourseLearnAiChat {...input} initialPrompt="Question" onClearSelection={mocks.clear} />)
        fireEvent.click(screen.getByText("send"))
        await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("streamFailed"))

        mocks.create.trigger.mockResolvedValueOnce({ id: "session-1" })
        fireEvent.click(screen.getByText("retry"))
        await waitFor(() => expect(mocks.stream.ask).toHaveBeenCalled())
        const request = mocks.stream.ask.mock.calls.at(-1)![0]
        act(() => request.onDone("quota exceeded"))
        expect(screen.getByTestId("state")).toHaveTextContent("quotaRejected")

        fireEvent.click(screen.getByText("stop"))
        fireEvent.click(screen.getByText("clear"))
        expect(mocks.stream.abort).toHaveBeenCalled()
        expect(mocks.clear).toHaveBeenCalled()
        view.unmount()
    })

    it("handles unavailable course, loading, failed, streaming and quota states", () => {
        const view = render(<CourseLearnAiChat displayId="course" challengeId="challenge" challengeTitle="Challenge" />)
        expect(screen.getByTestId("state")).toHaveTextContent("sessionsPending")
        mocks.sessions.error = new Error("offline")
        view.rerender(<CourseLearnAiChat {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent("sessionsFailed")
        mocks.sessions.error = undefined
        mocks.sessions.data = { sessions: [{ id: "session-1", title: "Thread", updatedAt: "2026-08-27T00:00:00.000Z" }] }
        mocks.stream.isStreaming = true
        view.rerender(<CourseLearnAiChat {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent("streaming")
        mocks.stream.isStreaming = false
        mocks.quota.isLoading = true
        view.rerender(<CourseLearnAiChat {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent("quotaPending")
        mocks.quota.isLoading = false
        mocks.quota.data = { credit: { remainingWeek: 0 } }
        view.rerender(<CourseLearnAiChat {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent("zeroPaidCredits")
    })
})
