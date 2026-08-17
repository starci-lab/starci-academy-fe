import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _StarCiAiDrawer } from "./component"

type DrawerBranchMockProps = {
    readonly isOpen: boolean
    readonly placement: string
    readonly render: { readonly kind: string; readonly project?: () => React.ReactNode }
}

vi.mock("@/components/branches/DrawerBranch", () => ({
    DrawerBranch: (input: DrawerBranchMockProps) => (
        <section data-open={input.isOpen} data-placement={input.placement}>{input.render.project?.()}</section>
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
