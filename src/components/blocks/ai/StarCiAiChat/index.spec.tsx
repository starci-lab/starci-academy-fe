import type { ReactElement } from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
    useContentAiStream,
    useMutateCreateContentAiSessionSwr,
    useMutateDeleteContentAiSessionSwr,
    useMutateRenameContentAiSessionSwr,
    useMutateSetContentAiSessionArchivedSwr,
    useQueryContentAiHistorySwr,
    useQueryContentAiSessionsSwr,
    useQueryCourseSwr,
    useQueryMyAiQuotaSwr,
} from "@/hooks"
import { useGlobalAiChat } from "@/modules/ai/global-ai-chat-context"
import { buildContentAiQuestion } from "@/modules/ai/content-ai-selection-context"
import { StarCiAiChat } from "./index"

vi.mock("next-intl", () => ({
    useLocale: () => "en-US",
    useTranslations: () => (key: string, values?: Record<string, number>) =>
        values === undefined ? key : `${key}:${Object.values(values).join("|")}`,
}))

vi.mock("@/modules/ai/global-ai-chat-context", () => ({ useGlobalAiChat: vi.fn() }))

vi.mock("@/hooks", () => ({
    useContentAiStream: vi.fn(),
    useMutateCreateContentAiSessionSwr: vi.fn(),
    useMutateDeleteContentAiSessionSwr: vi.fn(),
    useMutateRenameContentAiSessionSwr: vi.fn(),
    useMutateSetContentAiSessionArchivedSwr: vi.fn(),
    useQueryContentAiHistorySwr: vi.fn(),
    useQueryContentAiSessionsSwr: vi.fn(),
    useQueryCourseSwr: vi.fn(),
    useQueryMyAiQuotaSwr: vi.fn(),
}))

/** The parameters the block handed the socket on the last `ask`. */
type AskParams = {
    readonly sessionId: string
    readonly question: string
    readonly history: ReadonlyArray<{ role: string, content: string }>
    readonly onDelta: (delta: string) => void
    readonly onDone: (error?: string) => void
}

const session = (over: Record<string, unknown> = {}) => ({
    id: "session-1",
    title: "Promises",
    updatedAt: "2026-03-14T00:00:00.000Z",
    messageCount: 2,
    scope: "global",
    originContentId: null,
    originContentTitle: null,
    snippet: null,
    ...over,
})

type Overrides = {
    readonly owner?: Record<string, unknown>
    readonly course?: Record<string, unknown>
    readonly sessions?: Record<string, unknown>
    readonly history?: Record<string, unknown>
    readonly quota?: Record<string, unknown>
    readonly stream?: Record<string, unknown>
    readonly create?: Record<string, unknown>
}

const spies = {
    ask: vi.fn(),
    abort: vi.fn(),
    clearCodeContext: vi.fn(),
    startTangent: vi.fn(),
    open: vi.fn(),
    close: vi.fn(),
    setCodeContext: vi.fn(),
    sessionsMutate: vi.fn(),
    historyMutate: vi.fn(),
    quotaMutate: vi.fn(),
    create: vi.fn(),
    rename: vi.fn(),
    archive: vi.fn(),
    remove: vi.fn(),
}

const setup = (over: Overrides = {}) => {
    vi.mocked(useGlobalAiChat).mockReturnValue({
        anchor: { scope: "global", path: "/" },
        codeContext: undefined,
        isOpen: true,
        tangentVersion: 0,
        open: spies.open,
        close: spies.close,
        setCodeContext: spies.setCodeContext,
        clearCodeContext: spies.clearCodeContext,
        startTangent: spies.startTangent,
        ...over.owner,
    } as never)
    vi.mocked(useQueryCourseSwr).mockReturnValue({ data: undefined, ...over.course } as never)
    vi.mocked(useQueryContentAiSessionsSwr).mockReturnValue({
        data: { sessions: [session()] },
        isLoading: false,
        error: undefined,
        mutate: spies.sessionsMutate,
        ...over.sessions,
    } as never)
    vi.mocked(useQueryContentAiHistorySwr).mockReturnValue({
        data: { messages: [] },
        mutate: spies.historyMutate,
        ...over.history,
    } as never)
    vi.mocked(useQueryMyAiQuotaSwr).mockReturnValue({
        data: { credit: { remainingWeek: 12 } },
        isLoading: false,
        mutate: spies.quotaMutate,
        ...over.quota,
    } as never)
    vi.mocked(useMutateCreateContentAiSessionSwr).mockReturnValue({ trigger: spies.create, ...over.create } as never)
    vi.mocked(useMutateRenameContentAiSessionSwr).mockReturnValue({ trigger: spies.rename } as never)
    vi.mocked(useMutateSetContentAiSessionArchivedSwr).mockReturnValue({ trigger: spies.archive } as never)
    vi.mocked(useMutateDeleteContentAiSessionSwr).mockReturnValue({ trigger: spies.remove } as never)
    vi.mocked(useContentAiStream).mockReturnValue({
        state: "connected",
        isConnected: true,
        isStreaming: false,
        ask: spies.ask,
        abort: spies.abort,
        ...over.stream,
    } as never)
}

/** Every turn the drawer currently draws, in reading order. */
const turns = () =>
    Array.from(document.querySelectorAll("[data-measure]"),
        (turn) => turn.textContent)

/** The parameters of the most recent socket ask. */
const lastAsk = (): AskParams => spies.ask.mock.calls.at(-1)?.[0] as AskParams

/** Type into the composer and press whatever the send slot currently offers. */
const compose = (text: string) => {
    fireEvent.change(screen.getByLabelText("composer.label"), { target: { value: text } })
}

/**
 * Bump the owner's tangent counter and re-render.
 *
 * The block records the counter it saw on mount, so a tangent is a CHANGE rather than a value:
 * rendering straight into a non-zero counter is the one thing that cannot open one.
 */
const startTangent = (
    rerender: (ui: ReactElement) => void,
    version: number,
    over: Record<string, unknown> = {},
) => {
    setup({ owner: { tangentVersion: version, ...over } })
    rerender(<StarCiAiChat />)
}

beforeEach(() => {
    spies.create.mockResolvedValue({ id: "session-new" })
    spies.rename.mockResolvedValue(undefined)
    spies.archive.mockResolvedValue(undefined)
    spies.remove.mockResolvedValue(undefined)
    spies.sessionsMutate.mockResolvedValue(undefined)
    spies.historyMutate.mockResolvedValue(undefined)
})

afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
})

describe("StarCiAiChat", () => {
    it("opens on the newest stored conversation and says it is ready to be asked", async () => {
        setup()
        render(<StarCiAiChat />)
        await waitFor(() => expect(screen.getByRole("button", { name: "actions.send" })).toBeDisabled())
        expect(turns()).toEqual([])
        expect(screen.getByText("quota.remaining:12")).toBeInTheDocument()
    })

    it("grounds itself in the course the reader is on, once the slug resolves to an id", () => {
        setup({
            owner: { anchor: { scope: "course", id: "backend-basics", path: "/courses/backend-basics" } },
            course: { data: { id: "course-uuid" } },
        })
        render(<StarCiAiChat />)
        expect(useQueryCourseSwr).toHaveBeenCalledWith({ displayId: "backend-basics" })
        expect(useQueryContentAiSessionsSwr).toHaveBeenLastCalledWith({ scope: "course", courseId: "course-uuid" })
        expect(document.body.textContent).toContain("course:backend-basics")
    })

    it("waits rather than asking about a course whose slug has not resolved yet", () => {
        setup({ owner: { anchor: { scope: "course", id: "backend-basics", path: "/courses/backend-basics" } } })
        render(<StarCiAiChat />)
        expect(useQueryContentAiSessionsSwr).toHaveBeenLastCalledWith(null)
        expect(turns()).toEqual(["states.sessionsPending"])
    })

    it("asks for nothing at all when the reader is not on a course page", () => {
        setup()
        render(<StarCiAiChat />)
        expect(useQueryCourseSwr).toHaveBeenCalledWith({ displayId: undefined })
    })

    it("restores the visible question and its quote from a persisted turn", () => {
        setup({
            history: { data: { messages: [
                { role: "user", content: buildContentAiQuestion("Why does this settle once?", {
                    kind: "code", quote: "await promise", path: "src/a.ts",
                }) },
                { role: "assistant", content: "Because a promise is a one-shot." },
            ] } },
        })
        render(<StarCiAiChat />)
        expect(turns()[0]).toContain("Why does this settle once?")
        expect(turns()[0]).toContain("await promise")
        expect(turns()[0]).not.toContain("Quoted selection")
        expect(turns()[1]).toBe("Because a promise is a one-shot.")
    })

    it("leaves a persisted question that carries no quote exactly as it was written", () => {
        setup({ history: { data: { messages: [{ role: "user", content: "Plain question" }] } } })
        render(<StarCiAiChat />)
        expect(turns()).toEqual(["Plain question"])
    })

    it("reads the whole stored history when the reader switches to it", () => {
        setup()
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        expect(screen.getByRole("button", { name: "Promises · Mar 14, 2026" })).toBeInTheDocument()
        expect(screen.queryByLabelText("composer.label")).toBeNull()
    })

    it("names an untitled conversation rather than drawing a nameless row", () => {
        setup({ sessions: { data: { sessions: [session({ title: null })] } } })
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        expect(screen.getByRole("button", { name: "untitled · Mar 14, 2026" })).toBeInTheDocument()
    })

    it("returns to the conversation the reader picked out of the history", () => {
        setup({ sessions: { data: { sessions: [session(), session({ id: "session-2", title: "Streams" })] } } })
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        fireEvent.click(screen.getByRole("button", { name: "Streams · Mar 14, 2026" }))
        expect(useQueryContentAiHistorySwr).toHaveBeenLastCalledWith("session-2")
        expect(screen.getByLabelText("composer.label")).toBeInTheDocument()
    })

    it("rests, reports failure and reports emptiness for the stored history in turn", () => {
        const pending = render(<StarCiAiChat />, { wrapper: undefined })
        pending.unmount()

        setup({ sessions: { isLoading: true, data: undefined } })
        const resting = render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        expect(turns()).toEqual(["states.historyPending"])
        resting.unmount()

        setup({ sessions: { error: new Error("down"), data: undefined } })
        const failed = render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        expect(turns()).toEqual(["states.historyFailed"])
        failed.unmount()

        setup({ sessions: { data: { sessions: [] } } })
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        expect(turns()).toEqual(["states.searchEmpty"])
    })

    it("says which transport state is holding the conversation up", () => {
        const cases: ReadonlyArray<readonly [Record<string, unknown>, string]> = [
            [{ sessions: { isLoading: true, data: undefined } }, "states.sessionsPending"],
            [{ sessions: { error: new Error("down"), data: undefined } }, "states.sessionsFailed"],
            [{ sessions: { data: { sessions: [] } } }, "states.noSession"],
            [{ stream: { state: "reconnecting" } }, "states.reconnecting"],
            [{ stream: { state: "connecting" } }, "states.reconnecting"],
            [{ stream: { state: "idle" } }, "states.reconnecting"],
            [{ stream: { state: "failed" } }, "states.offline"],
            [{ quota: { isLoading: true, data: undefined } }, "states.quotaPending"],
            [{ quota: { data: { credit: { remainingWeek: 0 } } } }, "states.zeroPaidCredits"],
        ]
        for (const [over, expected] of cases) {
            setup(over)
            const view = render(<StarCiAiChat />)
            expect(turns()).toEqual([expected])
            view.unmount()
        }
    })

    it("says the weekly credit is unavailable when the server has no answer about it", () => {
        setup({ quota: { data: null } })
        render(<StarCiAiChat />)
        expect(screen.getByText("quota.unavailable")).toBeInTheDocument()
    })

    it("sends the composed question with the quote and the running transcript", async () => {
        setup({
            owner: { codeContext: { kind: "code", quote: "await promise", path: "src/a.ts" } },
            history: { data: { messages: [{ role: "assistant", content: "Earlier answer" }] } },
        })
        render(<StarCiAiChat />)
        compose("Why once?")
        fireEvent.click(screen.getByRole("button", { name: "actions.send" }))

        await waitFor(() => expect(spies.ask).toHaveBeenCalledOnce())
        expect(lastAsk().sessionId).toBe("session-1")
        expect(lastAsk().question).toContain("Why once?")
        expect(lastAsk().question).toContain("await promise")
        expect(lastAsk().history).toEqual([{ role: "assistant", content: "Earlier answer" }])
        expect(turns().at(-2)).toContain("Why once?")
        expect(turns().at(-2)).toContain("await promise")
    })

    it("streams the answer in, then clears the quote and refreshes the credit", async () => {
        setup({ owner: { codeContext: { kind: "prose", quote: "a promise" } } })
        render(<StarCiAiChat />)
        compose("Why once?")
        fireEvent.click(screen.getByRole("button", { name: "actions.send" }))
        await waitFor(() => expect(spies.ask).toHaveBeenCalledOnce())

        act(() => { lastAsk().onDelta("Because ") })
        act(() => { lastAsk().onDelta("it settles once.") })
        expect(turns().at(-1)).toContain("Because it settles once.")
        expect(turns().at(-1)).toContain("partial")

        await act(async () => { lastAsk().onDone() })
        expect(spies.clearCodeContext).toHaveBeenCalledOnce()
        expect(spies.quotaMutate).toHaveBeenCalledOnce()
        expect(spies.historyMutate).toHaveBeenCalledOnce()
        await waitFor(() => expect(turns()).toEqual([]))
    })

    it("refuses to send an empty draft anywhere", () => {
        setup()
        render(<StarCiAiChat />)
        compose("   ")
        fireEvent.click(screen.getByRole("button", { name: "actions.send" }))
        expect(spies.ask).not.toHaveBeenCalled()
    })

    it("opens a conversation of its own before the first question of a new anchor", async () => {
        setup({ sessions: { data: { sessions: [] } } })
        render(<StarCiAiChat />)
        compose("First question")
        fireEvent.click(screen.getByRole("button", { name: "actions.send" }))

        await waitFor(() => expect(spies.ask).toHaveBeenCalledOnce())
        expect(spies.create).toHaveBeenCalledExactlyOnceWith({ scope: "global" })
        expect(lastAsk().sessionId).toBe("session-new")
    })

    it("reports a failure when the server opens no conversation to ask in", async () => {
        setup({ sessions: { data: { sessions: [] } } })
        spies.create.mockResolvedValue({ id: null })
        render(<StarCiAiChat />)
        compose("First question")
        fireEvent.click(screen.getByRole("button", { name: "actions.send" }))

        await waitFor(() => expect(turns()).toEqual(["states.streamFailed"]))
        expect(spies.ask).not.toHaveBeenCalled()
    })

    it("reports a failure when opening that conversation is refused outright", async () => {
        setup({ sessions: { data: { sessions: [] } } })
        spies.create.mockRejectedValue(new Error("refused"))
        render(<StarCiAiChat />)
        compose("First question")
        fireEvent.click(screen.getByRole("button", { name: "actions.send" }))

        await waitFor(() => expect(turns()).toEqual(["states.streamFailed"]))
        expect(spies.ask).not.toHaveBeenCalled()
    })

    it("separates an abort, a dropped socket, a refused credit and an unexplained failure", async () => {
        const cases: ReadonlyArray<readonly [string, string]> = [
            ["ABORTED", "states.aborted"],
            ["SOCKET_DISCONNECTED", "states.reconnecting"],
            ["Weekly QUOTA exhausted", "states.quotaRejected"],
            ["not enough credit", "states.quotaRejected"],
            ["ECONNRESET", "states.streamFailed"],
        ]
        for (const [error, expected] of cases) {
            setup()
            const view = render(<StarCiAiChat />)
            compose("Why once?")
            fireEvent.click(screen.getByRole("button", { name: "actions.send" }))
            await waitFor(() => expect(spies.ask).toHaveBeenCalled())
            await act(async () => { lastAsk().onDone(error) })
            expect(turns().at(-1)).toBe(expected)
            view.unmount()
            vi.clearAllMocks()
        }
    })

    it("takes the refused question back off the transcript when the credit is refused", async () => {
        setup()
        render(<StarCiAiChat />)
        compose("Why once?")
        fireEvent.click(screen.getByRole("button", { name: "actions.send" }))
        await waitFor(() => expect(spies.ask).toHaveBeenCalledOnce())
        await act(async () => { lastAsk().onDone("quota exhausted") })

        expect(turns()).toEqual(["states.quotaRejected"])
    })

    it("retries the failed attempt in place of the turns it discarded", async () => {
        setup()
        render(<StarCiAiChat />)
        compose("Why once?")
        fireEvent.click(screen.getByRole("button", { name: "actions.send" }))
        await waitFor(() => expect(spies.ask).toHaveBeenCalledOnce())
        await act(async () => { lastAsk().onDone("ECONNRESET") })

        fireEvent.click(screen.getByRole("button", { name: "actions.retry" }))
        await waitFor(() => expect(spies.ask).toHaveBeenCalledTimes(2))
        expect(turns().filter((turn) => turn?.includes("Why once?"))).toHaveLength(1)
        expect(lastAsk().history.filter((turn) => turn.content.includes("Why once?"))).toHaveLength(0)
    })

    it("stops a running answer through the socket that is producing it", () => {
        setup({ stream: { isStreaming: true } })
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "actions.stop" }))
        expect(spies.abort).toHaveBeenCalledOnce()
    })

    it("drops the quote on request and says so", () => {
        setup({ owner: { codeContext: { kind: "prose", quote: "a promise" } } })
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "actions.clearContext" }))
        expect(spies.clearCodeContext).toHaveBeenCalledOnce()
        expect(turns()).toEqual(["states.contextCleared"])
    })

    it("renames the open conversation and reloads the list behind it", async () => {
        vi.spyOn(window, "prompt").mockReturnValue("  Renamed  ")
        setup()
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        fireEvent.click(screen.getByRole("button", { name: "actions.rename" }))

        await waitFor(() => expect(spies.rename)
            .toHaveBeenCalledExactlyOnceWith({ sessionId: "session-1", title: "Renamed" }))
        expect(window.prompt).toHaveBeenCalledWith("actions.renamePrompt", "Promises")
        expect(spies.sessionsMutate).toHaveBeenCalledOnce()
    })

    it("offers an empty name to a conversation that never had one", () => {
        vi.spyOn(window, "prompt").mockReturnValue(null)
        setup({ sessions: { data: { sessions: [session({ title: null })] } } })
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        fireEvent.click(screen.getByRole("button", { name: "actions.rename" }))

        expect(window.prompt).toHaveBeenCalledWith("actions.renamePrompt", "")
        expect(spies.rename).not.toHaveBeenCalled()
    })

    it("reports a refused rename without losing the conversation", async () => {
        vi.spyOn(window, "prompt").mockReturnValue("Renamed")
        spies.rename.mockRejectedValue(new Error("refused"))
        setup()
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        fireEvent.click(screen.getByRole("button", { name: "actions.rename" }))

        await waitFor(() => expect(spies.rename).toHaveBeenCalledOnce())
        expect(spies.sessionsMutate).not.toHaveBeenCalled()
        expect(screen.getByRole("button", { name: "Promises · Mar 14, 2026" })).toBeInTheDocument()
    })

    it("archives the open conversation and leaves none open behind it", async () => {
        setup()
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        fireEvent.click(screen.getByRole("button", { name: "actions.archive" }))

        await waitFor(() => expect(spies.archive)
            .toHaveBeenCalledExactlyOnceWith({ sessionId: "session-1", archived: true }))
        expect(spies.sessionsMutate).toHaveBeenCalled()
    })

    it("reports a refused archive", async () => {
        spies.archive.mockRejectedValue(new Error("refused"))
        setup()
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        fireEvent.click(screen.getByRole("button", { name: "actions.archive" }))

        await waitFor(() => expect(spies.archive).toHaveBeenCalledOnce())
        expect(spies.sessionsMutate).not.toHaveBeenCalled()
        expect(useQueryContentAiHistorySwr).toHaveBeenLastCalledWith("session-1")
    })

    it("asks before deleting, and deletes only on the second press", async () => {
        setup()
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        fireEvent.click(screen.getByRole("button", { name: "actions.delete" }))
        expect(spies.remove).not.toHaveBeenCalled()
        expect(screen.queryByRole("button", { name: "actions.confirmDelete" })).toBeNull()

        // The confirmation only surfaces once the reader leaves the history list - see the
        // "asks to delete" defect noted for this block: the history branch of the state ladder
        // drops `terminalState` entirely, so the state the delete press set is invisible there.
        fireEvent.click(screen.getByRole("button", { name: "modes.general" }))
        fireEvent.click(screen.getByRole("button", { name: "actions.confirmDelete" }))
        await waitFor(() => expect(spies.remove).toHaveBeenCalledExactlyOnceWith({ sessionId: "session-1" }))
    })

    it("keeps the conversation when the reader backs out of deleting it", () => {
        setup()
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        fireEvent.click(screen.getByRole("button", { name: "actions.delete" }))
        fireEvent.click(screen.getByRole("button", { name: "modes.general" }))
        fireEvent.click(screen.getByRole("button", { name: "actions.cancel" }))

        expect(spies.remove).not.toHaveBeenCalled()
        expect(screen.getByLabelText("composer.label")).toBeInTheDocument()
        expect(useQueryContentAiHistorySwr).toHaveBeenLastCalledWith("session-1")
    })

    it("reports a refused delete", async () => {
        spies.remove.mockRejectedValue(new Error("refused"))
        setup()
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        fireEvent.click(screen.getByRole("button", { name: "actions.delete" }))
        fireEvent.click(screen.getByRole("button", { name: "modes.general" }))
        fireEvent.click(screen.getByRole("button", { name: "actions.confirmDelete" }))

        await waitFor(() => expect(spies.remove).toHaveBeenCalledOnce())
        expect(spies.sessionsMutate).not.toHaveBeenCalled()
        expect(useQueryContentAiHistorySwr).toHaveBeenLastCalledWith("session-1")
    })

    it("offers no conversation actions while no conversation is open", () => {
        setup({ sessions: { data: { sessions: [] } } })
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        expect(screen.queryByRole("button", { name: "actions.rename" })).toBeNull()
        expect(screen.queryByRole("button", { name: "actions.archive" })).toBeNull()
    })

    it("opens a fresh archived conversation for a tangent and says it is ready", async () => {
        setup()
        const view = render(<StarCiAiChat />)
        startTangent(view.rerender, 1)

        await waitFor(() => expect(spies.create)
            .toHaveBeenCalledExactlyOnceWith({ scope: "global", archived: true }))
        await waitFor(() => expect(turns()).toEqual(["states.tangentReady"]))
        expect(useQueryContentAiHistorySwr).toHaveBeenLastCalledWith("session-new")
        expect(spies.sessionsMutate).toHaveBeenCalled()
    })

    it("reports a tangent the server refused to open", async () => {
        spies.create.mockRejectedValue(new Error("refused"))
        setup()
        const view = render(<StarCiAiChat />)
        startTangent(view.rerender, 1)

        await waitFor(() => expect(turns()).toEqual(["states.streamFailed"]))
    })

    it("leaves the open conversation alone when a tangent opens no session to hold it", async () => {
        spies.create.mockResolvedValue({ id: null })
        setup()
        const view = render(<StarCiAiChat />)
        startTangent(view.rerender, 1)

        await waitFor(() => expect(spies.create).toHaveBeenCalledOnce())
        expect(useQueryContentAiHistorySwr).toHaveBeenLastCalledWith("session-1")
        expect(turns()).toEqual([])
    })

    it("does not open a tangent it cannot ground in anything", async () => {
        setup({ owner: { anchor: { scope: "course", id: "backend-basics", path: "/courses/backend-basics" } } })
        const view = render(<StarCiAiChat />)
        startTangent(view.rerender, 1, {
            anchor: { scope: "course", id: "backend-basics", path: "/courses/backend-basics" },
        })

        await waitFor(() => expect(turns()).toEqual(["states.sessionsPending"]))
        expect(spies.create).not.toHaveBeenCalled()
    })
    it("reads a conversation the server has sent no messages for as an empty one", () => {
        setup({ history: { data: undefined } })
        render(<StarCiAiChat />)
        expect(turns()).toEqual([])
        expect(screen.getByLabelText("composer.label")).toBeInTheDocument()
    })

    it("calls a history the server never answered empty rather than failed", () => {
        setup({ sessions: { data: undefined } })
        render(<StarCiAiChat />)
        fireEvent.click(screen.getByRole("button", { name: "modes.history" }))
        expect(turns()).toEqual(["states.searchEmpty"])
    })

    it("asks nothing again when the reader empties the composer before retrying", async () => {
        setup()
        render(<StarCiAiChat />)
        compose("Why once?")
        fireEvent.click(screen.getByRole("button", { name: "actions.send" }))
        await waitFor(() => expect(spies.ask).toHaveBeenCalledOnce())
        await act(async () => { lastAsk().onDone("ECONNRESET") })

        compose("   ")
        fireEvent.click(screen.getByRole("button", { name: "actions.retry" }))
        expect(spies.ask).toHaveBeenCalledOnce()
    })

    it("drops a tangent whose answer arrives after the reader has left the page", async () => {
        setup()
        const view = render(<StarCiAiChat />)
        startTangent(view.rerender, 1)
        view.unmount()

        await waitFor(() => expect(spies.create).toHaveBeenCalledOnce())
        expect(document.body.textContent).toBe("")
    })
    it("reports nothing about a refused tangent once the reader has left the page", async () => {
        spies.create.mockRejectedValue(new Error("refused"))
        setup()
        const view = render(<StarCiAiChat />)
        startTangent(view.rerender, 1)
        view.unmount()

        await waitFor(() => expect(spies.create).toHaveBeenCalledOnce())
        expect(document.body.textContent).toBe("")
        expect(spies.sessionsMutate).not.toHaveBeenCalled()
    })
})
