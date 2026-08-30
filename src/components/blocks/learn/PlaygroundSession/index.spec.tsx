import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    session: {
        session: { steps: [{ id: "step-1", title: "Step one", sortIndex: 0, body: "Run it" }] },
        playground: null,
        passedStepIndexes: [] as ReadonlyArray<number>,
        isRestoring: false,
        hasPaired: true,
        failed: false,
        startFailed: false,
        socketState: "connected",
        agentConnected: true,
        verifiedStepIndex: null as number | null,
        verify: vi.fn(),
        retry: vi.fn(),
    },
}))

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }))
vi.mock("@/components/layouts/PlaygroundSessionLayout", () => ({ usePlaygroundSession: () => mocks.session }))
vi.mock("./component", () => ({
    PlaygroundSessionBase: (input: { readonly props: { readonly submitLabel: string; readonly verifyingLabel: string; readonly isVerifying: boolean }; readonly on: { readonly submit: () => void } }) => (
        <button type="button" disabled={input.props.isVerifying} onClick={input.on.submit}>
            {input.props.isVerifying ? input.props.verifyingLabel : input.props.submitLabel}
        </button>
    ),
}))

import { PlaygroundSession } from "."

describe("PlaygroundSession", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        mocks.session.agentConnected = true
        mocks.session.socketState = "connected"
        mocks.session.verifiedStepIndex = null
        mocks.session.verify.mockClear()
    })

    afterEach(() => vi.useRealTimers())

    it("releases a verification request that received no matching server event", () => {
        render(<PlaygroundSession displayId="course" slug="docker" />)
        fireEvent.click(screen.getByRole("button", { name: "session.verify" }))
        expect(screen.getByRole("button", { name: "session.verifying" })).toBeDisabled()

        act(() => vi.advanceTimersByTime(15_000))

        expect(screen.getByRole("button", { name: "session.verify" })).toBeEnabled()
        expect(mocks.session.verify).toHaveBeenCalledOnce()
    })

    it("releases the pending request when the paired agent disconnects", () => {
        const view = render(<PlaygroundSession displayId="course" slug="docker" />)
        fireEvent.click(screen.getByRole("button", { name: "session.verify" }))
        mocks.session.agentConnected = false

        view.rerender(<PlaygroundSession displayId="course" slug="docker" />)

        expect(screen.getByRole("button", { name: "session.verify" })).toBeEnabled()
    })
})
