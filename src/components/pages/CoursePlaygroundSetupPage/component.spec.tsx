import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { Playground } from "@/modules/api/graphql/queries/query-playground"
import { PlaygroundSetupBase as CoursePlaygroundSetupPageBase, type PlaygroundSetupBaseProps as CoursePlaygroundSetupPageProps } from "@/components/blocks/learn/PlaygroundSetup/component"

/**
 * What these tests guard: one server-created session read through six states. The reader may only
 * enter once the agent itself reports ready, the pairing identity is the server's to mint and never
 * the page's to invent, and a failed setup replaces the preparation it can no longer promise.
 */

const playground = (overrides: Partial<Playground> = {}): Playground => ({
    id: "playground-1",
    slug: "docker-basics",
    title: "Docker basics",
    description: "Run your first container.",
    icon: null,
    kind: "terminal",
    steps: [],
    ...overrides,
})

const copy = {
    titleFallback: "Playground",
    preparationTitle: "Before you start",
    preparationSteps: ["Install the CLI", "Create the session", "Pair your machine"],
    startLabel: "Create session",
    startingLabel: "Creating the session",
    pairingLabel: "Pairing code",
    waitingLabel: "Waiting for the agent",
    readyLabel: "Agent ready",
    enterLabel: "Enter workspace",
    retryLabel: "Try again",
    failedText: "Setup failed",
    pairingCode: "PAIR-123",
}

const handlers = (): CoursePlaygroundSetupPageProps["on"] => ({
    start: vi.fn(),
    enter: vi.fn(),
    retry: vi.fn(),
})

const draw = (
    state: CoursePlaygroundSetupPageProps["state"],
    props: Partial<CoursePlaygroundSetupPageProps["props"]> = {},
    on: CoursePlaygroundSetupPageProps["on"] = handlers(),
) => render(
    <CoursePlaygroundSetupPageBase
        state={state}
        props={{ ...copy, playground: playground(), ...props }}
        on={on}
    />,
)

describe("CoursePlaygroundSetupPageBase", () => {
    it("names the playground the server returned and numbers the preparation it asks for", () => {
        const { container } = draw("unpaired")

        expect(container.querySelector("[data-node=\"course-playground-setup-workspace\"]")).not.toBeNull()
        expect(screen.getByRole("heading", { name: "Docker basics" })).toBeInTheDocument()
        expect(screen.getByText("Run your first container.")).toBeInTheDocument()
        expect(screen.getByText("1. Install the CLI")).toBeInTheDocument()
        expect(screen.getByText("3. Pair your machine")).toBeInTheDocument()
    })

    it("creates the session on the server rather than starting anything locally", () => {
        const on = handlers()
        draw("unpaired", {}, on)

        fireEvent.click(screen.getByRole("button", { name: "Create session" }))

        expect(on.start).toHaveBeenCalledTimes(1)
    })

    it("says nothing extra about a playground the backend gave no description for", () => {
        draw("unpaired", { playground: playground({ description: null }) })

        expect(screen.getByRole("heading", { name: "Docker basics" })).toBeInTheDocument()
        expect(screen.queryByText("Run your first container.")).not.toBeInTheDocument()
    })

    it("rests the local name and the start control until the playground has been read", () => {
        const { container } = draw("loading", { playground: null })

        const heading = container.querySelector("[data-component=Heading][data-loading=\"true\"]")
        expect(heading?.textContent).toBe("Playground")
        expect(container.querySelector("[data-component=Button][data-loading=\"true\"]")).not.toBeNull()
        expect(screen.queryByText("Pairing code")).not.toBeInTheDocument()
    })

    it("shows the creation is already running instead of inviting a second press", () => {
        draw("starting")

        const action = screen.getByRole("button", { name: "Creating the session" })
        expect(action).toHaveAttribute("data-action-pending", "true")
        expect(action).toBeDisabled()
        expect(screen.queryByRole("button", { name: "Create session" })).not.toBeInTheDocument()
    })

    it("shows the pairing identity the server minted and holds the door while the agent is absent", () => {
        draw("paired")

        expect(screen.getByText("Pairing code")).toBeInTheDocument()
        expect(screen.getByText("PAIR-123")).toBeInTheDocument()
        expect(screen.getByText("Waiting for the agent")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Enter workspace" })).toBeDisabled()
    })

    it("opens the workspace only once the agent itself reports ready", () => {
        const on = handlers()
        draw("ready", {}, on)

        expect(screen.getByText("Agent ready")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Enter workspace" }))
        expect(on.enter).toHaveBeenCalledTimes(1)
    })

    it("replaces preparation and pairing with the failure, and offers the one action that can fix it", () => {
        const on = handlers()
        draw("failed", {}, on)

        expect(screen.getByText("Setup failed")).toBeInTheDocument()
        expect(screen.queryByText("Before you start")).not.toBeInTheDocument()
        expect(screen.queryByText("1. Install the CLI")).not.toBeInTheDocument()
        expect(screen.queryByText("PAIR-123")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Create session" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Enter workspace" })).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(on.retry).toHaveBeenCalledTimes(1)
    })
})
