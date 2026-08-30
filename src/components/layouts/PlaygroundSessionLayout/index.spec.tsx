import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PlaygroundSessionLayout, usePlaygroundSession } from "."
import { PlaygroundSession } from "@/components/blocks/learn/PlaygroundSession"

/**
 * What these tests guard.
 *
 * This owner exists so that starting a session survives the move from the setup route to the session
 * route: the server session and the relay socket are held here, not by either surface. So what is
 * asserted is the start state - a playground that has not resolved cannot be started, a server
 * answer with no session is a failure the reader is told about rather than a silent no-op, and a
 * successful start subscribes the relay to exactly the session that was created.
 */

const mocks = vi.hoisted(() => ({
    data: undefined as unknown,
    error: undefined as unknown,
    mutate: vi.fn(),
    trigger: vi.fn(),
    isMutating: false,
    subscribe: vi.fn(),
    verify: vi.fn(),
    socketRetry: vi.fn(),
    socketState: "idle" as string,
    agentConnected: false,
    verifiedStepIndex: null as number | null,
    passedStepIndexes: [] as ReadonlyArray<number>,
    replace: vi.fn(),
    push: vi.fn(),
}))

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, push: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryPlaygroundSwr", () => ({
    useQueryPlaygroundSwr: () => ({ data: mocks.data, error: mocks.error, mutate: mocks.mutate }),
}))
vi.mock("@/hooks/swr/useMutateStartPlaygroundSessionSwr", () => ({
    useMutateStartPlaygroundSessionSwr: () => ({ trigger: mocks.trigger, isMutating: mocks.isMutating }),
}))
vi.mock("@/hooks/socketio/usePlaygroundSocketIo", () => ({
    usePlaygroundSocketIo: () => ({
        state: mocks.socketState,
        agentConnected: mocks.agentConnected,
        verifiedStepIndex: mocks.verifiedStepIndex,
        passedStepIndexes: mocks.passedStepIndexes,
        subscribe: mocks.subscribe,
        verify: mocks.verify,
        retry: mocks.socketRetry,
    }),
}))

type FrameStub = {
    readonly state: string
    readonly surface: React.ReactNode
    readonly failedLabel: string
    readonly retryLabel: string
    readonly onRetry?: () => void
}

vi.mock("./component", () => ({
    PlaygroundSessionLayoutBase: (input: FrameStub) => (
        <>
            <output data-testid="frame-state">{input.state}</output>
            <button type="button" onClick={input.onRetry}>{input.retryLabel}</button>
            {input.surface}
        </>
    ),
}))

/** The routed surface is the only thing that ever reads or drives the persistent owner. */
const Surface = () => {
    const session = usePlaygroundSession()
    return (
        <div>
            <output data-testid="session">{session.session?.id ?? "no session"}</output>
            <output data-testid="start-failed">{String(session.startFailed)}</output>
            <output data-testid="socket">{`${session.socketState}/${String(session.agentConnected)}/${String(session.verifiedStepIndex)}/${session.passedStepIndexes.join(",")}`}</output>
            <output data-testid="identity">{`${session.displayId}/${session.slug}`}</output>
            <output data-testid="starting">{String(session.isStarting)}</output>
            <output data-testid="restoring">{String(session.isRestoring)}</output>
            <output data-testid="paired">{String(session.hasPaired)}</output>
            <button type="button" onClick={() => void session.start()}>Start session</button>
            <button type="button" onClick={session.verify}>Verify step</button>
        </div>
    )
}

const mount = () => render(
    <PlaygroundSessionLayout displayId="system-design" slug="k8s-basics" surface={<Surface />} />,
)

describe("PlaygroundSessionLayout", () => {
    beforeEach(() => {
        mocks.data = { id: "playground-1" }
        mocks.error = undefined
        mocks.isMutating = false
        mocks.socketState = "idle"
        mocks.agentConnected = false
        mocks.verifiedStepIndex = null
        mocks.passedStepIndexes = []
        window.sessionStorage.clear()
        vi.clearAllMocks()
        mocks.trigger.mockResolvedValue({})
    })

    it("refuses to be read outside the layout that owns the session", () => {
        expect(() => render(<Surface />)).toThrowError("usePlaygroundSession must be used inside PlaygroundSessionLayout")
    })

    it("publishes the route identity and the live relay facts to the routed surface", () => {
        mocks.socketState = "connected"
        mocks.agentConnected = true
        mocks.verifiedStepIndex = 2
        mocks.passedStepIndexes = [0, 1]
        mount()

        expect(screen.getByTestId("identity")).toHaveTextContent("system-design/k8s-basics")
        expect(screen.getByTestId("socket")).toHaveTextContent("connected/true/2/0,1")
        expect(screen.getByTestId("frame-state")).toHaveTextContent("ready")

        fireEvent.click(screen.getByRole("button", { name: "Verify step" }))
        expect(mocks.verify).toHaveBeenCalledOnce()
    })

    it("subscribes the relay to exactly the session the server created", async () => {
        mocks.trigger.mockResolvedValueOnce({ data: { createPlaygroundSession: { data: { id: "session-7" } } } })
        mount()

        fireEvent.click(screen.getByRole("button", { name: "Start session" }))
        await waitFor(() => expect(screen.getByTestId("session")).toHaveTextContent("session-7"))
        expect(mocks.trigger).toHaveBeenCalledWith({ playgroundId: "playground-1", mode: "guided" })
        expect(mocks.subscribe).toHaveBeenCalledWith("session-7")
        expect(screen.getByTestId("start-failed")).toHaveTextContent("false")
    })

    it("restores an open session before allowing a replacement start", async () => {
        window.sessionStorage.setItem(
            "starci:playground-session:v1:system-design/k8s-basics",
            JSON.stringify({ id: "session-restored", pairingCode: "ABC123", steps: [] }),
        )
        mount()

        await waitFor(() => expect(screen.getByTestId("session")).toHaveTextContent("session-restored"))
        expect(mocks.subscribe).toHaveBeenCalledWith("session-restored")

        fireEvent.click(screen.getByRole("button", { name: "Start session" }))
        expect(mocks.trigger).not.toHaveBeenCalled()
    })

    it("remembers a successful machine pair for guarded session entry", async () => {
        mocks.agentConnected = true
        mount()

        await waitFor(() => expect(screen.getByTestId("paired")).toHaveTextContent("true"))
        expect(window.sessionStorage.getItem("starci:playground-paired:v1:system-design/k8s-basics")).toBe("true")
    })

    it("returns an unpaired live-session deep link to setup", async () => {
        render(
            <PlaygroundSessionLayout
                displayId="system-design"
                slug="k8s-basics"
                surface={<PlaygroundSession displayId="system-design" slug="k8s-basics" />}
            />,
        )

        await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/courses/system-design/learn/playground/k8s-basics"))
    })

    it("keeps a previously paired learner in the live session while the relay reconnects", async () => {
        window.sessionStorage.setItem(
            "starci:playground-session:v1:system-design/k8s-basics",
            JSON.stringify({ id: "session-restored", pairingCode: "ABC123", steps: [] }),
        )
        window.sessionStorage.setItem("starci:playground-paired:v1:system-design/k8s-basics", "true")
        mocks.socketState = "failed"
        render(
            <PlaygroundSessionLayout
                displayId="system-design"
                slug="k8s-basics"
                surface={<PlaygroundSession displayId="system-design" slug="k8s-basics" />}
            />,
        )

        await waitFor(() => expect(screen.getByText("session.reconnecting")).toBeInTheDocument())
        expect(mocks.replace).not.toHaveBeenCalled()
    })

    it("reports a server answer that carried no session as a failed start", async () => {
        mocks.trigger.mockResolvedValueOnce({ data: { createPlaygroundSession: { data: null } } })
        mount()

        fireEvent.click(screen.getByRole("button", { name: "Start session" }))
        await waitFor(() => expect(screen.getByTestId("start-failed")).toHaveTextContent("true"))
        expect(mocks.subscribe).not.toHaveBeenCalled()
        expect(screen.getByTestId("session")).toHaveTextContent("no session")
    })

    it("reports a rejected start rather than letting the failure escape", async () => {
        mocks.trigger.mockRejectedValueOnce(new Error("network"))
        mount()

        fireEvent.click(screen.getByRole("button", { name: "Start session" }))
        await waitFor(() => expect(screen.getByTestId("start-failed")).toHaveTextContent("true"))
        expect(mocks.subscribe).not.toHaveBeenCalled()
    })

    it("does not attempt a start before the playground has resolved", async () => {
        mocks.data = undefined
        mount()

        fireEvent.click(screen.getByRole("button", { name: "Start session" }))
        await waitFor(() => expect(screen.getByTestId("frame-state")).toHaveTextContent("pending"))
        expect(mocks.trigger).not.toHaveBeenCalled()
    })

    it("does not attempt a start for a playground that resolved to nothing", async () => {
        mocks.data = null
        mount()

        fireEvent.click(screen.getByRole("button", { name: "Start session" }))
        await waitFor(() => expect(screen.getByTestId("frame-state")).toHaveTextContent("ready"))
        expect(mocks.trigger).not.toHaveBeenCalled()
    })

    it("replaces the surface with a retry once the playground read failed", () => {
        mocks.error = new Error("network")
        mount()

        expect(screen.getByTestId("frame-state")).toHaveTextContent("failed")
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mocks.mutate).toHaveBeenCalledOnce()
        expect(mocks.socketRetry).toHaveBeenCalledOnce()
    })

    it("says a start is in flight while the mutation is running", () => {
        mocks.isMutating = true
        mount()
        expect(screen.getByTestId("starting")).toHaveTextContent("true")
    })
})
