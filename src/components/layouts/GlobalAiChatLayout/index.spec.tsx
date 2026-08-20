import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "@/hooks/auth/useSessionToken"
import { useGlobalAiChat } from "@/modules/ai/global-ai-chat-context"
import { GlobalAiChatLayout } from "."

type FabMockProps = { readonly on?: { readonly press?: () => void } }

let pathname = "/en/dashboard"

vi.mock("@/i18n/navigation", () => ({ usePathname: () => pathname }))
vi.mock("@/components/blocks/ai/StarCiAiFab/component", () => ({
    StarCiAiFab: (input: FabMockProps) => (
        <button type="button" onClick={input.on?.press}>Open AI</button>
    ),
}))
vi.mock("@/components/overlays/ai/StarCiAiDrawer", () => ({
    StarCiAiDrawer: () => {
        const chat = useGlobalAiChat()
        return <output>{chat.isOpen ? "AI open" : "AI closed"}</output>
    },
}))
vi.mock("@/components/blocks/ai/StarCiAiSelectionAsk", () => ({ StarCiAiSelectionAsk: () => null }))

const Surface = () => {
    const chat = useGlobalAiChat()
    return <main>Surface: {chat.anchor.scope}</main>
}

/*
 * The routed surface is where every conversation outcome is actually raised from, so the controls
 * are read from the context exactly as a real surface reads them.
 */
const ConversationSurface = () => {
    const chat = useGlobalAiChat()
    return (
        <main>
            <output data-testid="quote">{chat.codeContext?.quote ?? "no quote"}</output>
            <output data-testid="tangent">{String(chat.tangentVersion)}</output>
            <button type="button" onClick={chat.close}>Close AI</button>
            <button type="button" onClick={() => chat.setCodeContext({ kind: "code", quote: "const a = 1" })}>Quote code</button>
            <button type="button" onClick={chat.clearCodeContext}>Clear quote</button>
            <button type="button" onClick={() => chat.startTangent({ kind: "prose", quote: "Why is this slow?" })}>Ask a tangent</button>
        </main>
    )
}

describe("GlobalAiChatLayout", () => {
    beforeEach(() => {
        pathname = "/en/dashboard"
        setSessionToken("test-token")
    })

    it("keeps the global owner beside an authenticated product surface", () => {
        render(<GlobalAiChatLayout surface={<Surface />} />)
        expect(screen.getByText("Surface: global")).toBeInTheDocument()
        expect(screen.getByText("AI closed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Open AI" }))
        expect(screen.getByText("AI open")).toBeInTheDocument()
    })

    it("keeps context available without mounting AI for a signed-out viewer", () => {
        setSessionToken(undefined)
        render(<GlobalAiChatLayout surface={<Surface />} />)
        expect(screen.getByText("Surface: global")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Open AI" })).not.toBeInTheDocument()
    })

    it("keeps the surface without AI furniture on a route that hides it", () => {
        pathname = "/en/authentication"
        render(<GlobalAiChatLayout surface={<Surface />} />)
        expect(screen.getByText("Surface: global")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Open AI" })).not.toBeInTheDocument()
        expect(screen.queryByText("AI closed")).not.toBeInTheDocument()
    })

    it("closes the conversation the surface opened", () => {
        render(<GlobalAiChatLayout surface={<ConversationSurface />} />)

        fireEvent.click(screen.getByRole("button", { name: "Open AI" }))
        expect(screen.getByText("AI open")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Close AI" }))
        expect(screen.getByText("AI closed")).toBeInTheDocument()
    })

    it("holds a quoted selection until the surface clears it", () => {
        render(<GlobalAiChatLayout surface={<ConversationSurface />} />)

        expect(screen.getByTestId("quote")).toHaveTextContent("no quote")
        fireEvent.click(screen.getByRole("button", { name: "Quote code" }))
        expect(screen.getByTestId("quote")).toHaveTextContent("const a = 1")
        fireEvent.click(screen.getByRole("button", { name: "Clear quote" }))
        expect(screen.getByTestId("quote")).toHaveTextContent("no quote")
    })

    it("opens the conversation on a tangent, carrying the quote and a new turn", () => {
        render(<GlobalAiChatLayout surface={<ConversationSurface />} />)

        expect(screen.getByTestId("tangent")).toHaveTextContent("0")
        fireEvent.click(screen.getByRole("button", { name: "Ask a tangent" }))
        expect(screen.getByText("AI open")).toBeInTheDocument()
        expect(screen.getByTestId("quote")).toHaveTextContent("Why is this slow?")
        expect(screen.getByTestId("tangent")).toHaveTextContent("1")
    })

    it("drops a quote that belonged to the page the reader just left", () => {
        const { rerender } = render(<GlobalAiChatLayout surface={<ConversationSurface />} />)

        fireEvent.click(screen.getByRole("button", { name: "Quote code" }))
        expect(screen.getByTestId("quote")).toHaveTextContent("const a = 1")

        pathname = "/en/courses/system-design/learn/content"
        rerender(<GlobalAiChatLayout surface={<ConversationSurface />} />)
        expect(screen.getByTestId("quote")).toHaveTextContent("no quote")
    })
})
