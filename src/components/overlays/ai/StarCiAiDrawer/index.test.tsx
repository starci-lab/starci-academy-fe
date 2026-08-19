import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { StarCiAiDrawer } from "."

/**
 * What these tests guard.
 *
 * The connected half resolves two things and no more: whether the global owner says the panel is
 * open, and which edge the panel belongs on at this viewport. A phone gets the bottom sheet and
 * anything wider gets the side panel, because a side panel on a phone is the whole screen with a
 * seam down one edge.
 */

const mocks = vi.hoisted(() => ({ isOpen: false, close: vi.fn(), matches: false }))

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/modules/ai/global-ai-chat-context", () => ({
    useGlobalAiChat: () => ({ isOpen: mocks.isOpen, close: mocks.close }),
}))
vi.mock("@/components/blocks/ai/StarCiAiChat", () => ({
    StarCiAiChat: () => <div data-testid="chat">Conversation</div>,
}))

type DrawerStub = {
    readonly state: string
    readonly props: { readonly isOpen: boolean, readonly placement: string, readonly title: string, readonly description: string }
    readonly on?: { readonly dismiss?: () => void }
    readonly chat: React.ComponentType
}

vi.mock("./component", () => ({
    StarCiAiDrawerBase: (input: DrawerStub) => {
        const Chat = input.chat
        return (
            <>
                <output data-testid="state">{input.state}</output>
                <output data-testid="placement">{input.props.placement}</output>
                <output data-testid="copy">{`${input.props.title}/${input.props.description}`}</output>
                <output data-testid="open">{String(input.props.isOpen)}</output>
                <button type="button" onClick={input.on?.dismiss}>Dismiss</button>
                <Chat />
            </>
        )
    },
}))

beforeEach(() => {
    mocks.isOpen = false
    mocks.matches = false
    vi.clearAllMocks()
    window.matchMedia = (query: string) => ({
        matches: mocks.matches,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
    }) as MediaQueryList
})

describe("StarCiAiDrawer", () => {
    it("keeps the panel closed and its copy resolved until the owner opens it", () => {
        render(<StarCiAiDrawer />)

        expect(screen.getByTestId("state")).toHaveTextContent("closed")
        expect(screen.getByTestId("open")).toHaveTextContent("false")
        expect(screen.getByTestId("copy")).toHaveTextContent("title/description")
    })

    it("follows the owner into the open conversation", () => {
        mocks.isOpen = true
        render(<StarCiAiDrawer />)

        expect(screen.getByTestId("state")).toHaveTextContent("ready")
        expect(screen.getByTestId("open")).toHaveTextContent("true")
        expect(screen.getByTestId("chat")).toBeInTheDocument()
    })

    it("anchors the panel to the side on anything wider than a phone", () => {
        render(<StarCiAiDrawer />)
        expect(screen.getByTestId("placement")).toHaveTextContent("right")
    })

    it("turns the panel into a bottom sheet on a phone", () => {
        mocks.matches = true
        render(<StarCiAiDrawer />)
        expect(screen.getByTestId("placement")).toHaveTextContent("bottom")
    })

    it("closes the conversation through the owner rather than locally", () => {
        mocks.isOpen = true
        render(<StarCiAiDrawer />)

        fireEvent.click(screen.getByRole("button", { name: "Dismiss" }))
        expect(mocks.close).toHaveBeenCalledOnce()
    })
})
