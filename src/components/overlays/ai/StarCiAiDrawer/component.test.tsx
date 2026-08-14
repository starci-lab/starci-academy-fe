import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _StarCiAiDrawer } from "./component"

vi.mock("@/components/shells/DrawerShell", () => ({
    DrawerShell: ({ children, isOpen, placement }: { readonly children?: React.ReactNode; readonly isOpen: boolean; readonly placement: string }) => (
        <section data-open={isOpen} data-placement={placement}>{children}</section>
    ),
}))

describe("_StarCiAiDrawer", () => {
    it("mounts one chat body in the requested responsive placement", () => {
        const Chat = () => <div>Conversation</div>
        const { container } = render(
            <_StarCiAiDrawer
                state="ready"
                props={{ isOpen: true, placement: "bottom", title: "StarCi AI", description: "Assistant" }}
                chat={Chat}
            />,
        )
        expect(screen.getByText("Conversation")).toBeInTheDocument()
        expect(container.querySelector("[data-placement=bottom]")).toBeTruthy()
    })
})
