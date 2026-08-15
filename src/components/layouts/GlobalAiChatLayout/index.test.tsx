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

describe("GlobalAiChatLayout", () => {
    beforeEach(() => {
        pathname = "/en/dashboard"
        setSessionToken("test-token")
    })

    it("keeps the global owner beside an authenticated product surface", () => {
        render(<GlobalAiChatLayout surface={Surface} />)
        expect(screen.getByText("Surface: global")).toBeInTheDocument()
        expect(screen.getByText("AI closed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Open AI" }))
        expect(screen.getByText("AI open")).toBeInTheDocument()
    })

    it("keeps context available without mounting AI for a signed-out viewer", () => {
        setSessionToken(undefined)
        render(<GlobalAiChatLayout surface={Surface} />)
        expect(screen.getByText("Surface: global")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Open AI" })).not.toBeInTheDocument()
    })
})
