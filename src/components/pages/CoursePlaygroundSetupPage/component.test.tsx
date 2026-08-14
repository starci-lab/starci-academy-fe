import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CoursePlaygroundSetupPage, type CoursePlaygroundSetupPageProps } from "./component"

const input = (state: CoursePlaygroundSetupPageProps["state"]): CoursePlaygroundSetupPageProps => ({
    state,
    props: {
        playground: null,
        titleFallback: "Playground",
        preparationTitle: "Prepare",
        preparationSteps: ["Install CLI", "Create session", "Pair machine"],
        startLabel: "Create session",
        startingLabel: "Creating...",
        pairingLabel: "Pairing code",
        waitingLabel: "Waiting",
        readyLabel: "Ready",
        enterLabel: "Enter workspace",
        retryLabel: "Try again",
        failedText: "Setup failed",
        pairingCode: "PAIR-123",
    },
    on: { start: vi.fn(), enter: vi.fn(), retry: vi.fn() },
})

describe("_CoursePlaygroundSetupPage", () => {
    it("shows server pairing identity and enters only from ready state", () => {
        const props = input("ready")
        const { container } = render(<_CoursePlaygroundSetupPage {...props} />)

        fireEvent.click(screen.getByRole("button", { name: "Enter workspace" }))

        expect(container.querySelector("[data-node=\"course-playground-setup-page\"]")).not.toBeNull()
        expect(screen.getByText("PAIR-123")).toBeInTheDocument()
        expect(props.on.enter).toHaveBeenCalledOnce()
    })
})
