/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import {
    GlobalAiChatContext,
    useGlobalAiChat,
    type GlobalAiChatContextValue,
} from "./global-ai-chat-context"

const value: GlobalAiChatContextValue = {
    anchor: { scope: "content", id: "lesson-1", path: "/contents/lesson-1" },
    isOpen: false,
    tangentVersion: 0,
    open: vi.fn(),
    close: vi.fn(),
    setCodeContext: vi.fn(),
    clearCodeContext: vi.fn(),
    startTangent: vi.fn(),
}

/** A consumer that reports what the hook handed it. */
const Reader = () => {
    const chat = useGlobalAiChat()
    return <p>{`${chat.anchor.scope}:${chat.anchor.id ?? ""} v${chat.tangentVersion}`}</p>
}

describe("useGlobalAiChat", () => {
    it("hands the routed surface the owner the layout provided", () => {
        render(
            <GlobalAiChatContext.Provider value={value}>
                <Reader />
            </GlobalAiChatContext.Provider>,
        )
        expect(screen.getByText("content:lesson-1 v0")).toBeInTheDocument()
    })

    it("refuses to answer outside the layout that owns the conversation", () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {})
        expect(() => render(<Reader />)).toThrow("useGlobalAiChat must be used inside GlobalAiChatLayout")
        error.mockRestore()
    })
})
