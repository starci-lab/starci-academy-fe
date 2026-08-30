import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
    StarCiAiChatBase,
    STARCI_AI_CHAT_STATES,
    type StarCiAiChatData,
    type StarCiAiChatState,
} from "./component"

const stateLabels = Object.fromEntries(
    STARCI_AI_CHAT_STATES.map((state) => [state, `State ${state}`]),
) as Readonly<Record<StarCiAiChatState, string>>

const props: StarCiAiChatData = {
    labels: {
        eyebrow: "Course advisor",
        subtitle: "Answers before recommending",
        emptyTitle: "What is your goal?",
        emptyDescription: "Share your goal and current experience.",
        quickPrompts: ["Suggest a path", "Compare courses"],
        recommendationList: "Recommended courses",
        generalMode: "General",
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
    mode: "general",
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

describe("StarCiAiChatBase", () => {
    it("has one named fixture for all 21 owner states", () => {
        expect(STARCI_AI_CHAT_STATES).toHaveLength(21)
        for (const state of STARCI_AI_CHAT_STATES) {
            const { unmount } = render(<StarCiAiChatBase state={state} props={props} />)
            expect(document.body.firstElementChild).toBeTruthy()
            unmount()
        }
    })

    it("quotes selected code inside the user turn and keeps context to one row", () => {
        render(<StarCiAiChatBase state="ready" props={props} />)
        expect(screen.queryByRole("button", { name: "Code coach" })).not.toBeInTheDocument()
        expect(screen.getAllByText("const controller = new AbortController()").length).toBeGreaterThan(0)
        expect(screen.getByText(props.contextSummary!)).toBeInTheDocument()
        expect(screen.getByText("content:lesson-1 · src/useTodos.ts · L14-21")).toBeInTheDocument()
    })

    it.each(["quotaPending", "zeroPaidCredits", "quotaRejected"] as const)(
        "keeps the composer usable in %s",
        (state) => {
            const retry = vi.fn()
            const send = vi.fn()
            render(<StarCiAiChatBase state={state} props={props} on={{ retry, send }} />)
            expect(screen.getByLabelText("Ask StarCi AI")).not.toBeDisabled()
            const action = screen.getByRole("button", { name: state === "quotaRejected" ? "Retry" : "Send" })
            expect(action).not.toBeDisabled()
            fireEvent.click(action)
            expect(state === "quotaRejected" ? retry : send).toHaveBeenCalledTimes(1)
        },
    )

    it("history owns the body and hides chat context, quote and composer", () => {
        const selectSession = vi.fn()
        const { container } = render(<StarCiAiChatBase state="historyReady" props={{ ...props, mode: "history" }} on={{ selectSession }} />)
        const session = screen.getByRole("button", { name: "Async patterns · Just now" })
        fireEvent.click(session)
        expect(selectSession).toHaveBeenCalledWith("session-1")
        expect(screen.queryByText(props.contextSummary!)).toBeNull()
        expect(container.querySelector("textarea")).toBeNull()
        expect(screen.queryByText("controller.abort()")).not.toBeInTheDocument()
    })

    it("clears selected grounding from the compact context row", () => {
        const clearContext = vi.fn()
        render(<StarCiAiChatBase state="ready" props={props} on={{ clearContext }} />)
        fireEvent.click(screen.getByRole("button", { name: "Clear context" }))
        expect(clearContext).toHaveBeenCalledTimes(1)
    })

    it("draws a plain answer with no fence and no partial marker", () => {
        const { container } = render(<StarCiAiChatBase state="ready" props={{
            ...props,
            turns: [{ id: "turn-1", role: "assistant", body: "Because the request outlives the render." }],
        }} />)
        expect(screen.getByText("Because the request outlives the render.")).toBeInTheDocument()
        expect(screen.queryByText("Partial answer")).not.toBeInTheDocument()
        const assistant = container.querySelector("[data-chat-role=\"assistant\"]")
        expect(assistant?.querySelector("[data-slot=\"starci-ai-teacher\"]")).toHaveClass("rounded-full")
        expect(assistant).toHaveClass("items-start")
    })

    it("fences an unlabelled quote as code and marks an interrupted answer", () => {
        render(<StarCiAiChatBase state="streaming" props={{
            ...props,
            turns: [{ id: "turn-1", role: "assistant", body: "Here", quote: "abort()", isPartial: true }],
        }} />)
        expect(screen.getByText("abort()")).toBeInTheDocument()
        expect(screen.getByText("Partial answer")).toBeInTheDocument()
    })

    it("speaks the pending state rather than resting, and withholds the composer", () => {
        const { container } = render(<StarCiAiChatBase state="sessionsPending" props={{ ...props, turns: [] }} />)
        expect(screen.getByText("State sessionsPending")).toBeInTheDocument()
        expect(container.querySelector("textarea")).toBeNull()
    })

    it("withholds the composer while sessions are unavailable", () => {
        const { container } = render(<StarCiAiChatBase state="sessionsFailed" props={props} />)
        expect(container.querySelector("textarea")).toBeNull()
        expect(screen.getByText("State sessionsFailed")).toBeInTheDocument()
    })

    it("shows the transcript rather than an empty list when history has no sessions", () => {
        render(<StarCiAiChatBase state="searchEmpty" props={{ ...props, mode: "history", sessions: [] }} />)
        expect(screen.getByText("State searchEmpty")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Async patterns · Just now" })).not.toBeInTheDocument()
    })

    it("offers no session controls until one session is actually chosen", () => {
        render(<StarCiAiChatBase
            state="historyReady"
            props={{ ...props, mode: "history", activeSessionId: undefined }}
        />)
        expect(screen.queryByRole("button", { name: "Rename" })).toBeNull()
    })

    it("reports rename, archive and delete from the chosen session", () => {
        const rename = vi.fn()
        const archive = vi.fn()
        const remove = vi.fn()
        render(<StarCiAiChatBase
            state="historyReady"
            props={{ ...props, mode: "history" }}
            on={{ rename, archive, delete: remove }}
        />)
        fireEvent.click(screen.getByRole("button", { name: "Rename" }))
        fireEvent.click(screen.getByRole("button", { name: "Archive" }))
        fireEvent.click(screen.getByRole("button", { name: "Delete" }))
        expect(rename).toHaveBeenCalledTimes(1)
        expect(archive).toHaveBeenCalledTimes(1)
        expect(remove).toHaveBeenCalledTimes(1)
    })

    it.each(["renaming", "archiving"] as const)("marks the %s control as the one working", (state) => {
        render(<StarCiAiChatBase state={state} props={{ ...props, mode: "history" }} />)
        const label = state === "renaming" ? "Rename" : "Archive"
        expect(screen.getByRole("button", { name: label })).toHaveAttribute("data-action-pending", "true")
        expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute("data-action-pending", "false")
    })

    it("replaces the session controls with a confirmation the reader has to mean", () => {
        const confirmDelete = vi.fn()
        const cancelDelete = vi.fn()
        render(<StarCiAiChatBase
            state="deleteConfirm"
            props={{ ...props, mode: "history" }}
            on={{ confirmDelete, cancelDelete }}
        />)
        expect(screen.queryByRole("button", { name: "Rename" })).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Delete session" }))
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
        expect(confirmDelete).toHaveBeenCalledTimes(1)
        expect(cancelDelete).toHaveBeenCalledTimes(1)
    })

    it.each(["offline", "reconnecting"] as const)("stops the reader composing while %s", (state) => {
        render(<StarCiAiChatBase state={state} props={props} />)
        expect(screen.getByLabelText("Ask StarCi AI")).toBeDisabled()
        expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
    })

    it("offers a stop rather than a send while the answer is still streaming", () => {
        const stop = vi.fn()
        render(<StarCiAiChatBase state="streaming" props={props} on={{ stop }} />)
        expect(screen.queryByRole("button", { name: "Send" })).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Stop" }))
        expect(stop).toHaveBeenCalledTimes(1)
    })

    it("offers a retry once the stream itself failed", () => {
        const retry = vi.fn()
        render(<StarCiAiChatBase state="streamFailed" props={props} on={{ retry }} />)
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("refuses to send an empty draft and reports every keystroke of a real one", () => {
        const changeDraft = vi.fn()
        render(<StarCiAiChatBase state="ready" props={{ ...props, draft: "   " }} on={{ changeDraft }} />)
        expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
        fireEvent.change(screen.getByLabelText("Ask StarCi AI"), { target: { value: "Explain this" } })
        expect(changeDraft).toHaveBeenCalledWith("Explain this")
    })

    it("switches between the two bodies by name", () => {
        const selectMode = vi.fn()
        render(<StarCiAiChatBase state="ready" props={props} on={{ selectMode }} />)
        fireEvent.click(screen.getByRole("button", { name: "History" }))
        fireEvent.click(screen.getByRole("button", { name: "General" }))
        expect(selectMode).toHaveBeenNthCalledWith(1, "history")
        expect(selectMode).toHaveBeenNthCalledWith(2, "general")
    })

    it("drops the whole context row when nothing grounds the conversation", () => {
        render(<StarCiAiChatBase
            state="ready"
            props={{ ...props, contextSummary: undefined, selection: undefined }}
        />)
        expect(screen.queryByText(props.contextSummary!)).toBeNull()
        expect(screen.queryByRole("button", { name: "Clear context" })).not.toBeInTheDocument()
    })

    it("keeps a route summary without a clear control when no excerpt was picked", () => {
        render(<StarCiAiChatBase state="ready" props={{ ...props, selection: undefined }} />)
        expect(screen.getByText(props.contextSummary!)).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Clear context" })).not.toBeInTheDocument()
    })

    it("quotes a prose excerpt with no language claim of its own", () => {
        render(<StarCiAiChatBase state="ready" props={{
            ...props,
            selection: { kind: "prose", quote: "The reducer owns the transition." },
        }} />)
        expect(screen.getAllByText("The reducer owns the transition.").length).toBeGreaterThan(0)
    })

    it("quotes a pathless code excerpt without inventing an extension", () => {
        render(<StarCiAiChatBase state="ready" props={{
            ...props,
            selection: { kind: "code", quote: "controller.abort()" },
        }} />)
        expect(screen.getAllByText("controller.abort()").length).toBeGreaterThan(0)
    })

    it("says nothing about quota when there is no figure and nothing pending", () => {
        render(<StarCiAiChatBase state="ready" props={{ ...props, quotaLabel: undefined }} />)
        expect(screen.queryByText("0 paid credits · free route available")).not.toBeInTheDocument()
    })

    it("rests the quota line while the allowance is still being counted", () => {
        render(<StarCiAiChatBase state="quotaPending" props={{ ...props, quotaLabel: undefined }} />)
        expect(screen.getByLabelText("Ask StarCi AI")).not.toBeDisabled()
    })

    it("stays inert rather than throwing when the owner registered no intents", () => {
        render(<StarCiAiChatBase state="deleteConfirm" props={{ ...props, mode: "history" }} />)
        expect(() => {
            fireEvent.click(screen.getByRole("button", { name: "Delete session" }))
            fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
            fireEvent.click(screen.getByRole("button", { name: "History" }))
            fireEvent.click(screen.getByRole("button", { name: "Async patterns · Just now" }))
        }).not.toThrow()
    })
})
