import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _StarCiAiDrawer } from "./component"

type DrawerShellMockProps = React.PropsWithChildren<{
    readonly isOpen: boolean
    readonly placement: string
}>

vi.mock("@/components/shells/DrawerShell", () => ({
    DrawerShell: (input: DrawerShellMockProps) => (
        <section data-open={input.isOpen} data-placement={input.placement}>{input.children}</section>
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
