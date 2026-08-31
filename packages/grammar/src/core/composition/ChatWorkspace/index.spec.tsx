// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react"
import type { ComponentProps, PropsWithChildren } from "react"
import { createContext, useContext } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const drawerContext = createContext<{ isOpen: boolean; onOpenChange: (open: boolean) => void } | null>(null)

vi.mock("@heroui/react", async (importOriginal) => {
    const original = await importOriginal<typeof import("@heroui/react")>()
    const Root = ({ children, isOpen, onOpenChange }: PropsWithChildren<{ isOpen: boolean; onOpenChange: (open: boolean) => void }>) => (
        <drawerContext.Provider value={{ isOpen, onOpenChange }}>{children}</drawerContext.Provider>
    )
    const Trigger = ({ children, ...props }: ComponentProps<"button">) => {
        const drawer = useContext(drawerContext)
        return <button {...props} onClick={() => drawer?.onOpenChange(true)}>{children}</button>
    }
    const Backdrop = ({ children }: PropsWithChildren) => useContext(drawerContext)?.isOpen ? <>{children}</> : null
    const Content = ({ children }: PropsWithChildren<{ placement?: string }>) => <div>{children}</div>
    const Dialog = ({ children, ...props }: ComponentProps<"div">) => <div {...props} role="dialog">{children}</div>
    const Header = ({ children }: PropsWithChildren) => <header>{children}</header>
    const Heading = ({ children }: PropsWithChildren) => <h2>{children}</h2>
    const CloseTrigger = (props: ComponentProps<"button">) => {
        const drawer = useContext(drawerContext)
        return <button {...props} onClick={() => drawer?.onOpenChange(false)} />
    }
    const Body = ({ children, ...props }: ComponentProps<"div">) => <div {...props}>{children}</div>
    const ScrollShadow = ({ children, ...props }: PropsWithChildren<ComponentProps<"div"> & { orientation?: string }>) => {
        const { orientation, ...regionProps } = props
        void orientation
        return <div {...regionProps} data-grammar-scroll="contained">{children}</div>
    }
    return {
        ...original,
        Drawer: Object.assign(Root, { Trigger, Backdrop, Content, Dialog, Header, Heading, CloseTrigger, Body }),
        ScrollShadow,
    }
})

import { ChatWorkspace } from "./index.js"

const mediaListeners = new Set<() => void>()
let compact = false

const installMatchMedia = () => {
    Object.defineProperty(window, "matchMedia", {
        configurable: true,
        value: vi.fn(() => ({
            matches: compact,
            media: "(max-width: 47.999rem)",
            onchange: null,
            addEventListener: (_type: string, listener: () => void) => mediaListeners.add(listener),
            removeEventListener: (_type: string, listener: () => void) => mediaListeners.delete(listener),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    })
}

const setCompact = (value: boolean) => {
    compact = value
    act(() => mediaListeners.forEach((listener) => listener()))
}

describe("ChatWorkspace", () => {
    beforeEach(() => {
        compact = false
        mediaListeners.clear()
        installMatchMedia()
    })

    afterEach(() => vi.restoreAllMocks())

    it("owns named slots and keeps the composer outside the conversation scroll owner", () => {
        render(
            <ChatWorkspace
                composer={<form aria-label="Prompt"><input aria-label="Message" /></form>}
                conversation={<p>Conversation content</p>}
                conversationLabel="Conversation"
                header={<h1>Assistant</h1>}
                label="Assistant workspace"
            />,
        )

        const workspace = screen.getByRole("region", { name: "Assistant workspace" })
        const conversation = screen.getByRole("region", { name: "Conversation" })
        const composer = workspace.querySelector("[data-grammar-chat-workspace-slot=\"composer\"]")

        expect(workspace.getAttribute("data-grammar-chat-workspace-rail")).toBe("absent")
        expect(conversation.getAttribute("data-grammar-chat-workspace-scroll-owner")).toBe("conversation")
        expect(conversation.getAttribute("data-grammar-scroll")).toBe("contained")
        expect(conversation.contains(composer)).toBe(false)
        expect(composer?.contains(screen.getByRole("form", { name: "Prompt" }))).toBe(true)
    })

    it("renders one labelled persistent complementary rail outside the compact viewport", () => {
        const onRailOpenChange = vi.fn()
        render(
            <ChatWorkspace
                composer={<div>Composer</div>}
                conversation={<div>Conversation</div>}
                conversationLabel="Conversation"
                isRailOpen={false}
                label="Workspace"
                onRailOpenChange={onRailOpenChange}
                rail={<nav aria-label="Sources">Sources</nav>}
                railCloseLabel="Close sources"
                railLabel="Supporting sources"
                railOpenLabel="Open sources"
                railWidth="wide"
            />,
        )

        const rail = screen.getByRole("complementary", { name: "Supporting sources" })
        expect(rail.getAttribute("data-grammar-rail-height")).toBe("fill")
        expect(rail.getAttribute("data-grammar-rail-width")).toBe("wide")
        expect(screen.getByRole("region", { name: "Supporting sources" }).getAttribute(
            "data-grammar-chat-workspace-rail-presentation",
        )).toBe("inline")
        expect(screen.queryByRole("button", { name: "Open sources" })).toBeNull()
    })

    it("transforms the rail into a controlled compact drawer with named open and close controls", () => {
        const onRailOpenChange = vi.fn()
        setCompact(true)
        const { rerender } = render(
            <ChatWorkspace
                composer={<div>Composer</div>}
                conversation={<div>Conversation</div>}
                conversationLabel="Conversation"
                isRailOpen={false}
                label="Workspace"
                onRailOpenChange={onRailOpenChange}
                rail={<div>Supporting content</div>}
                railCloseLabel="Close context"
                railLabel="Context"
                railOpenLabel="Open context"
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Open context" }))
        expect(onRailOpenChange).toHaveBeenCalledWith(true)

        rerender(
            <ChatWorkspace
                composer={<div>Composer</div>}
                conversation={<div>Conversation</div>}
                conversationLabel="Conversation"
                isRailOpen
                label="Workspace"
                onRailOpenChange={onRailOpenChange}
                rail={<div>Supporting content</div>}
                railCloseLabel="Close context"
                railLabel="Context"
                railOpenLabel="Open context"
            />,
        )

        expect(screen.getByRole("dialog")).not.toBeNull()
        expect(screen.getByRole("region", { name: "Context" }).getAttribute(
            "data-grammar-chat-workspace-rail-presentation",
        )).toBe("overlay")
        fireEvent.click(screen.getByRole("button", { name: "Close context" }))
        expect(onRailOpenChange).toHaveBeenCalledWith(false)
    })

    it("closes an open compact rail when the persistent rail breakpoint takes over", () => {
        const onRailOpenChange = vi.fn()
        setCompact(true)
        render(
            <ChatWorkspace
                composer={<div>Composer</div>}
                conversation={<div>Conversation</div>}
                conversationLabel="Conversation"
                isRailOpen
                label="Workspace"
                onRailOpenChange={onRailOpenChange}
                rail={<div>Supporting content</div>}
                railCloseLabel="Close context"
                railLabel="Context"
                railOpenLabel="Open context"
            />,
        )

        setCompact(false)
        expect(onRailOpenChange).toHaveBeenCalledWith(false)
        expect(screen.getByRole("complementary", { name: "Context" })).not.toBeNull()
    })
})
