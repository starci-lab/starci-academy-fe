import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { StarCiAiDrawerBase } from "./component"

type DrawerBranchMockProps = {
    readonly isOpen: boolean
    readonly placement: string
    readonly title: string
    readonly onDismiss: () => void
    readonly render: { readonly kind: string; readonly project?: () => React.ReactNode }
}

vi.mock("@/components/branches/DrawerBranch", () => ({
    DrawerBranch: (input: DrawerBranchMockProps) => (
        <section data-open={input.isOpen} data-placement={input.placement} aria-label={input.title}>
            <button type="button" onClick={input.onDismiss}>Dismiss</button>
            {input.render.project?.()}
        </section>
    ),
}))

describe("StarCiAiDrawerBase", () => {
    it("mounts one chat body in the requested responsive placement", () => {
        const Chat = () => <div>Conversation</div>
        const { container } = render(
            <StarCiAiDrawerBase
                state="ready"
                props={{ isOpen: true, placement: "bottom", title: "StarCi AI", description: "Assistant" }}
                chat={Chat}
            />,
        )
        expect(screen.getByText("Conversation")).toBeInTheDocument()
        expect(container.querySelector("[data-placement=bottom]")).toBeTruthy()
    })

    it("reports the panel's way out to the owner that holds the conversation", () => {
        const dismiss = vi.fn()
        const Chat = () => <div>Conversation</div>
        render(
            <StarCiAiDrawerBase
                state="ready"
                props={{ isOpen: true, placement: "right", title: "StarCi AI", description: "Assistant" }}
                on={{ dismiss }}
                chat={Chat}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Dismiss" }))
        expect(dismiss).toHaveBeenCalledOnce()
    })

    it("keeps the panel dismissable even when no owner is listening", () => {
        const Chat = () => <div>Conversation</div>
        render(
            <StarCiAiDrawerBase
                state="closed"
                props={{ isOpen: false, placement: "right", title: "StarCi AI", description: "Assistant" }}
                chat={Chat}
            />,
        )

        expect(() => fireEvent.click(screen.getByRole("button", { name: "Dismiss" }))).not.toThrow()
        expect(screen.getByLabelText("StarCi AI")).toHaveAttribute("data-open", "false")
    })
})
