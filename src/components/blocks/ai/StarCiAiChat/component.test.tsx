import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
    _StarCiAiChat,
    STARCI_AI_CHAT_STATES,
    type StarCiAiChatData,
    type StarCiAiChatState,
} from "./component"

const stateLabels = Object.fromEntries(
    STARCI_AI_CHAT_STATES.map((state) => [state, `State ${state}`]),
) as Readonly<Record<StarCiAiChatState, string>>

const props: StarCiAiChatData = {
    labels: {
        generalMode: "General",
        codeMode: "Code coach",
        historyMode: "History",
        composer: "Ask StarCi AI",
        placeholder: "Ask a follow-up",
        send: "Send",
        stop: "Stop",
        retry: "Retry",
        clearContext: "Clear context",
        rename: "Rename",
        archive: "Archive",
        delete: "Delete",
        confirmDelete: "Delete session",
        cancel: "Cancel",
        partial: "Partial answer",
        states: stateLabels,
    },
    mode: "code",
    contextSummary: "content:lesson-1 · src/useTodos.ts · L14-21",
    turns: [{
        id: "turn-1",
        role: "user",
        body: "Why is AbortController needed?",
        quote: "const controller = new AbortController()",
        quoteLanguage: "ts",
    }],
    sessions: [{ id: "session-1", title: "Async patterns", updatedLabel: "Just now" }],
    activeSessionId: "session-1",
    selection: { kind: "code", quote: "controller.abort()", path: "src/useTodos.ts", startLine: 20, endLine: 20 },
    draft: "Explain this cleanup",
    draftKey: 0,
    quotaLabel: "0 paid credits · free route available",
}

describe("_StarCiAiChat", () => {
    it("has one named fixture for all 21 owner states", () => {
        expect(STARCI_AI_CHAT_STATES).toHaveLength(21)
        for (const state of STARCI_AI_CHAT_STATES) {
            const { unmount } = render(<_StarCiAiChat state={state} props={props} />)
            expect(document.querySelector("[data-node=starci-ai-drawer-column]")).toBeTruthy()
            unmount()
        }
    })

    it("quotes selected code inside the user turn and keeps context to one row", () => {
        const { container } = render(<_StarCiAiChat state="ready" props={props} />)
        expect(screen.getAllByText("const controller = new AbortController()").length).toBeGreaterThan(0)
        expect(container.querySelectorAll("[data-node=starci-ai-context-stack]")).toHaveLength(1)
        expect(screen.getByText("content:lesson-1 · src/useTodos.ts · L14-21")).toBeInTheDocument()
    })

    it.each(["quotaPending", "zeroPaidCredits", "quotaRejected"] as const)(
        "keeps the composer usable in %s",
        (state) => {
            const retry = vi.fn()
            const send = vi.fn()
            render(<_StarCiAiChat state={state} props={props} on={{ retry, send }} />)
            expect(screen.getByLabelText("Ask StarCi AI")).not.toBeDisabled()
            const action = screen.getByRole("button", { name: state === "quotaRejected" ? "Retry" : "Send" })
            expect(action).not.toBeDisabled()
            fireEvent.click(action)
            expect(state === "quotaRejected" ? retry : send).toHaveBeenCalledTimes(1)
        },
    )

    it("history owns the body and hides chat context, quote and composer", () => {
        const selectSession = vi.fn()
        const { container } = render(<_StarCiAiChat state="historyReady" props={{ ...props, mode: "history" }} on={{ selectSession }} />)
        const session = screen.getByRole("button", { name: "Async patterns · Just now" })
        fireEvent.click(session)
        expect(selectSession).toHaveBeenCalledWith("session-1")
        expect(container.querySelector("[data-node=starci-ai-context-stack]")).toBeNull()
        expect(container.querySelector("[data-node=starci-ai-composer]")).toBeNull()
        expect(screen.queryByText("controller.abort()")).not.toBeInTheDocument()
    })

    it("clears selected grounding from the compact context row", () => {
        const clearContext = vi.fn()
        render(<_StarCiAiChat state="ready" props={props} on={{ clearContext }} />)
        fireEvent.click(screen.getByRole("button", { name: "Clear context" }))
        expect(clearContext).toHaveBeenCalledTimes(1)
    })
})
