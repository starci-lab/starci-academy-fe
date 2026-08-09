import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, renderHook, waitFor } from "@testing-library/react"
import { useSignInFlow } from "./useSignInFlow"
import { getSessionToken, setSessionToken } from "./useSessionToken"

/**
 * What these tests guard: the ORDER, which is the only thing this hook exists to own.
 *
 * Three of them are the ones a hand-wired version always gets wrong. A code submitted before
 * a challenge exists must go nowhere, because there is no question it could be an answer to.
 * A request that never reached a verdict must not be reported as a refusal, because "your
 * code was wrong" is a lie a reader cannot argue with. And a response belonging to an attempt
 * the reader has already superseded must be dropped, because the alternative is a stale
 * refusal landing on top of a challenge that is currently fine.
 */

const mocks = vi.hoisted(() => ({
    init: vi.fn(),
    verify: vi.fn(),
    resend: vi.fn(),
}))

vi.mock("@/modules/api/graphql/mutations/mutation-sign-in-init", () => ({
    mutationSignInInit: mocks.init,
}))

vi.mock("@/modules/api/graphql/mutations/mutation-sign-in-verify-otp", () => ({
    mutationSignInVerifyOtp: mocks.verify,
}))

vi.mock("@/modules/api/graphql/mutations/mutation-sign-in-resend-otp", () => ({
    mutationSignInResendOtp: mocks.resend,
}))

/** A promise plus the handles to settle it, so a test can hold a request in flight. */
interface Deferred {
    /** The promise the hook awaits. */
    promise: Promise<unknown>
    /** Settle it with a payload. */
    resolve: (value: unknown) => void
    /** Settle it as a transport failure. */
    reject: (reason: unknown) => void
}

/** Build a promise this test can settle by hand. */
const defer = (): Deferred => {
    let resolve: (value: unknown) => void = () => undefined
    let reject: (reason: unknown) => void = () => undefined
    const promise = new Promise<unknown>((onResolve, onReject) => {
        resolve = onResolve
        reject = onReject
    })
    return { promise, resolve, reject }
}

/** A successful challenge, as the server sends it. */
const challenge = (challengeId: string, expiresInSeconds: number) => ({
    data: { signInInit: { success: true, message: "ok", data: { challengeId, expiresInSeconds } } },
})

/** Credentials any test may submit. */
const credentials = { email: "learner@example.com", password: "secret" }

beforeEach(() => {
    mocks.init.mockReset()
    mocks.verify.mockReset()
    mocks.resend.mockReset()
    setSessionToken(undefined)
})

afterEach(() => {
    cleanup()
})

describe("useSignInFlow", () => {
    it("starts at the credentials step with nothing sent and nothing failed", () => {
        const { result } = renderHook(() => useSignInFlow())
        expect(result.current.step).toBe("credentials")
        expect(result.current.sentCount).toBe(0)
        expect(result.current.isPending).toBe(false)
        expect(result.current.failure).toBeUndefined()
    })

    it("reports the credentials as in flight until they settle", async () => {
        const pending = defer()
        mocks.init.mockReturnValue(pending.promise)
        const { result } = renderHook(() => useSignInFlow())

        act(() => {
            result.current.onSubmitCredentials(credentials)
        })
        expect(result.current.isPending).toBe(true)

        await act(async () => {
            pending.resolve(challenge("challenge-1", 300))
            await pending.promise
        })
        expect(result.current.isPending).toBe(false)
    })

    it("moves to the code step with the challenge the server opened", async () => {
        mocks.init.mockResolvedValue(challenge("challenge-1", 300))
        const { result } = renderHook(() => useSignInFlow())

        await act(async () => {
            result.current.onSubmitCredentials(credentials)
        })

        await waitFor(() => expect(result.current.step).toBe("code"))
        expect(result.current.challengeId).toBe("challenge-1")
        expect(result.current.expiresInSeconds).toBe(300)
        expect(result.current.email).toBe(credentials.email)
        expect(result.current.sentCount).toBe(1)
    })

    it("sends the credentials as the mutation declares them", async () => {
        mocks.init.mockResolvedValue(challenge("challenge-1", 300))
        const { result } = renderHook(() => useSignInFlow())

        await act(async () => {
            result.current.onSubmitCredentials(credentials)
        })

        expect(mocks.init).toHaveBeenCalledWith({ request: credentials })
    })

    it("keeps the reader on the credentials step when the server refuses them", async () => {
        mocks.init.mockResolvedValue({
            data: { signInInit: { success: false, message: "Wrong password", error: "INVALID_CREDENTIALS" } },
        })
        const { result } = renderHook(() => useSignInFlow())

        await act(async () => {
            result.current.onSubmitCredentials(credentials)
        })

        await waitFor(() => expect(result.current.failure).toBeDefined())
        expect(result.current.step).toBe("credentials")
        expect(result.current.failure).toEqual({
            message: "Wrong password",
            code: "INVALID_CREDENTIALS",
            isTransport: false,
        })
    })

    it("marks a request that never reached a verdict as a transport failure", async () => {
        mocks.init.mockRejectedValue(new Error("timeout"))
        const { result } = renderHook(() => useSignInFlow())

        await act(async () => {
            result.current.onSubmitCredentials(credentials)
        })

        await waitFor(() => expect(result.current.failure?.isTransport).toBe(true))
        expect(result.current.failure?.message).toBeUndefined()
    })

    it("refuses to submit a code before a challenge exists", () => {
        const { result } = renderHook(() => useSignInFlow())
        act(() => {
            result.current.onSubmitCode({ otp: "123456" })
        })
        expect(mocks.verify).not.toHaveBeenCalled()
        expect(result.current.step).toBe("credentials")
    })

    it("verifies the code against the open challenge and stores the token", async () => {
        mocks.init.mockResolvedValue(challenge("challenge-1", 300))
        mocks.verify.mockResolvedValue({
            data: { signInVerifyOtp: { success: true, message: "ok", data: { accessToken: "token-1" } } },
        })
        const onSignedIn = vi.fn()
        const { result } = renderHook(() => useSignInFlow({ onSignedIn }))

        await act(async () => {
            result.current.onSubmitCredentials(credentials)
        })
        await waitFor(() => expect(result.current.step).toBe("code"))

        await act(async () => {
            result.current.onSubmitCode({ otp: "123456" })
        })

        await waitFor(() => expect(result.current.step).toBe("done"))
        expect(mocks.verify).toHaveBeenCalledWith({ request: { challengeId: "challenge-1", otp: "123456" } })
        expect(getSessionToken()).toBe("token-1")
        expect(onSignedIn).toHaveBeenCalledTimes(1)
    })

    it("keeps the reader on the code step when the code is refused, and stores no token", async () => {
        mocks.init.mockResolvedValue(challenge("challenge-1", 300))
        mocks.verify.mockResolvedValue({
            data: { signInVerifyOtp: { success: false, message: "That code is not right", error: "INVALID_OTP" } },
        })
        const onSignedIn = vi.fn()
        const { result } = renderHook(() => useSignInFlow({ onSignedIn }))

        await act(async () => {
            result.current.onSubmitCredentials(credentials)
        })
        await waitFor(() => expect(result.current.step).toBe("code"))

        await act(async () => {
            result.current.onSubmitCode({ otp: "000000" })
        })

        await waitFor(() => expect(result.current.failure).toBeDefined())
        expect(result.current.step).toBe("code")
        expect(result.current.failure?.message).toBe("That code is not right")
        expect(getSessionToken()).toBeUndefined()
        expect(onSignedIn).not.toHaveBeenCalled()
    })

    it("counts a resend and takes the new expiry from the answer", async () => {
        mocks.init.mockResolvedValue(challenge("challenge-1", 300))
        mocks.resend.mockResolvedValue({
            data: {
                signInResendOtp: {
                    success: true,
                    message: "ok",
                    data: { challengeId: "challenge-2", expiresInSeconds: 120 },
                },
            },
        })
        const { result } = renderHook(() => useSignInFlow())

        await act(async () => {
            result.current.onSubmitCredentials(credentials)
        })
        await waitFor(() => expect(result.current.step).toBe("code"))

        await act(async () => {
            result.current.onResend()
        })

        await waitFor(() => expect(result.current.sentCount).toBe(2))
        expect(mocks.resend).toHaveBeenCalledWith({ request: { challengeId: "challenge-1" } })
        // The server may reissue the id; quoting the dead one afterwards is a refusal nobody
        // could explain, so the answer is read back rather than assumed unchanged.
        expect(result.current.challengeId).toBe("challenge-2")
        expect(result.current.expiresInSeconds).toBe(120)
    })

    it("refuses to resend before a challenge exists", () => {
        const { result } = renderHook(() => useSignInFlow())
        act(() => {
            result.current.onResend()
        })
        expect(mocks.resend).not.toHaveBeenCalled()
    })

    it("reports a resend on its own flag, so the resend control can speak for itself", async () => {
        const pending = defer()
        mocks.init.mockResolvedValue(challenge("challenge-1", 300))
        mocks.resend.mockReturnValue(pending.promise)
        const { result } = renderHook(() => useSignInFlow())

        await act(async () => {
            result.current.onSubmitCredentials(credentials)
        })
        await waitFor(() => expect(result.current.step).toBe("code"))

        act(() => {
            result.current.onResend()
        })
        expect(result.current.isResending).toBe(true)
        expect(result.current.isPending).toBe(false)

        await act(async () => {
            pending.resolve({
                data: {
                    signInResendOtp: {
                        success: true,
                        message: "ok",
                        data: { challengeId: "challenge-1", expiresInSeconds: 60 },
                    },
                },
            })
            await pending.promise
        })
        expect(result.current.isResending).toBe(false)
    })

    it("drops the answer to an attempt the reader has already superseded", async () => {
        const first = defer()
        const second = defer()
        mocks.init.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
        const { result } = renderHook(() => useSignInFlow())

        act(() => {
            result.current.onSubmitCredentials(credentials)
        })
        act(() => {
            result.current.onSubmitCredentials({ email: "second@example.com", password: "secret" })
        })

        await act(async () => {
            first.resolve({
                data: { signInInit: { success: false, message: "Wrong password", error: "INVALID_CREDENTIALS" } },
            })
            await first.promise
        })
        // The stale refusal must not land on the attempt currently in flight.
        expect(result.current.failure).toBeUndefined()
        expect(result.current.isPending).toBe(true)

        await act(async () => {
            second.resolve(challenge("challenge-9", 300))
            await second.promise
        })
        expect(result.current.step).toBe("code")
        expect(result.current.challengeId).toBe("challenge-9")
    })

    it("clears the previous failure the moment a new attempt starts", async () => {
        mocks.init.mockResolvedValueOnce({
            data: { signInInit: { success: false, message: "Wrong password", error: "INVALID_CREDENTIALS" } },
        })
        const pending = defer()
        mocks.init.mockReturnValueOnce(pending.promise)
        const { result } = renderHook(() => useSignInFlow())

        await act(async () => {
            result.current.onSubmitCredentials(credentials)
        })
        await waitFor(() => expect(result.current.failure).toBeDefined())

        act(() => {
            result.current.onSubmitCredentials(credentials)
        })
        expect(result.current.failure).toBeUndefined()
    })

    it("hands back the same three handlers on every render", () => {
        const { result, rerender } = renderHook(() => useSignInFlow())
        const first = result.current
        rerender()
        expect(result.current.onSubmitCredentials).toBe(first.onSubmitCredentials)
        expect(result.current.onSubmitCode).toBe(first.onSubmitCode)
        expect(result.current.onResend).toBe(first.onResend)
    })
})
