import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const session = vi.hoisted(() => ({
    failed: false,
    startFailed: false,
    socketState: "failed",
    isLoading: false,
    playground: { id: "playground-1" },
    isStarting: false,
    session: null,
    agentConnected: false,
    start: vi.fn(),
    retry: vi.fn(),
}))

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/components/layouts/PlaygroundSessionLayout", () => ({ usePlaygroundSession: () => session }))
vi.mock("./component", () => ({
    PlaygroundSetupBase: (input: { readonly state: string }) => <output data-testid="state">{input.state}</output>,
}))

import { PlaygroundSetup } from "."

describe("PlaygroundSetup", () => {
    it("offers recovery when the relay failed before pairing", () => {
        render(<PlaygroundSetup displayId="course" slug="docker" />)
        expect(screen.getByTestId("state")).toHaveTextContent("failed")
    })
})
