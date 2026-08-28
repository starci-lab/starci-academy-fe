import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, renderHook, waitFor } from "@testing-library/react"
import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors"
import { KeycloakIdentityProvider } from "@/modules/api/graphql/mutations/types/auth"
import { useAuthPanel } from "./useAuthPanel"
import { getSessionToken, setSessionToken } from "./useSessionToken"

/**
 * What these tests guard: the ORDER and the ROUTING, which are the two things this hook exists to
 * own and the two a hand-wired version always gets wrong.
 *
 * ORDER. A code submitted before a challenge exists must go nowhere, because there is no question
 * it could be an answer to. A request that never reached a verdict must not be reported as a
 * refusal, because "your code was wrong" is a lie a reader cannot argue with. A response belonging
 * to an attempt the reader has already superseded must be dropped, because the alternative is a
 * stale refusal landing on a challenge that is currently fine.
 *
 * ROUTING. The mode decides which pair of operations the two steps run, and getting that wrong is
 * silent: a sign-up whose second step verified against the sign-in resolver would look right on
 * screen and fail at the server. Each mode is therefore checked at the wire, by which mutation was
 * called and with which variables - including the reset flow, whose new password travels in the
 * FIRST step because that is what the schema takes.
 *
 * Nothing here touches the network: every mutation module is replaced.
 */

const mocks = vi.hoisted(() => ({
    signInInit: vi.fn(),
    signInVerify: vi.fn(),
    signInResend: vi.fn(),
    signUpInit: vi.fn(),
    signUpVerify: vi.fn(),
    signUpResend: vi.fn(),
    forgotInit: vi.fn(),
    forgotVerify: vi.fn(),
    forgotResend: vi.fn(),
    exchange: vi.fn(),
}))

vi.mock("@/modules/api/graphql/mutations/mutation-sign-in-init", () => ({
    mutationSignInInit: mocks.signInInit,
}))
vi.mock("@/modules/api/graphql/mutations/mutation-sign-in-verify-otp", () => ({
    mutationSignInVerifyOtp: mocks.signInVerify,
}))
vi.mock("@/modules/api/graphql/mutations/mutation-sign-in-resend-otp", () => ({
    mutationSignInResendOtp: mocks.signInResend,
}))
vi.mock("@/modules/api/graphql/mutations/mutation-sign-up-init", () => ({
    mutationSignUpInit: mocks.signUpInit,
}))
vi.mock("@/modules/api/graphql/mutations/mutation-sign-up-verify-otp", () => ({
    mutationSignUpVerifyOtp: mocks.signUpVerify,
}))
vi.mock("@/modules/api/graphql/mutations/mutation-sign-up-resend-otp", () => ({
    mutationSignUpResendOtp: mocks.signUpResend,
}))
vi.mock("@/modules/api/graphql/mutations/mutation-forgot-password-init", () => ({
    mutationForgotPasswordInit: mocks.forgotInit,
}))
vi.mock("@/modules/api/graphql/mutations/mutation-forgot-password-verify-otp", () => ({
    mutationForgotPasswordVerifyOtp: mocks.forgotVerify,
}))
vi.mock("@/modules/api/graphql/mutations/mutation-forgot-password-resend-otp", () => ({
    mutationForgotPasswordResendOtp: mocks.forgotResend,
}))
vi.mock("@/modules/api/graphql/mutations/mutation-exchange-code-for-token", () => ({
    mutationExchangeCodeForToken: mocks.exchange,
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

/** A successful challenge, wrapped in the top-level field the caller reads. */
const challenge = (field: string, challengeId: string, expiresInSeconds: number) => ({
    data: { [field]: { success: true, message: "ok", data: { challengeId, expiresInSeconds } } },
})

/** A refusal the server described. */
const refusal = (field: string, message: string, error: string) => ({
    data: { [field]: { success: false, message, error } },
})

/** A verified challenge: an access token and nothing else. */
const session = (field: string, accessToken: string) => ({
    data: { [field]: { success: true, message: "ok", data: { accessToken } } },
})

/** Details any test may submit. */
const details = { email: "learner@example.com", password: "secret" }

/** What the browser is standing on while a test runs. */
interface LocationParams {
    /** The query string, as the identity provider would have left it. */
    search: string
}

/** Replace `window.location` with a plain object a test can read and a spy can record. */
const stubLocation = ({ search }: LocationParams) => {
    const assign = vi.fn()
    Object.defineProperty(window, "location", {
        configurable: true,
        writable: true,
        value: {
            origin: "http://localhost:3000",
            href: `http://localhost:3000/authentication${search}`,
            search,
            assign,
        },
    })
    return assign
}

/** The real `sessionStorage`, kept so a test that replaces it can hand it back. */
const realSessionStorage = Object.getOwnPropertyDescriptor(window, "sessionStorage")

/**
 * Replace `sessionStorage` with one that refuses every operation.
 *
 * Private modes and storage disabled by policy do exactly this, and a sign-in that crashes because
 * it could not remember something optional is worse than one that simply cannot finish an
 * exchange.
 */
const stubHostileStorage = () => {
    const refuse = (): never => {
        throw new Error("storage disabled by policy")
    }
    Object.defineProperty(window, "sessionStorage", {
        configurable: true,
        value: { getItem: refuse, setItem: refuse, removeItem: refuse, clear: refuse },
    })
}

beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset()
    window.sessionStorage.clear()
    stubLocation({ search: "" })
    setSessionToken(undefined)
})

afterEach(() => {
    cleanup()
    // Some tests replace `sessionStorage` with one that refuses; put the real one back.
    if (realSessionStorage !== undefined) {
        Object.defineProperty(window, "sessionStorage", realSessionStorage)
    }
})

describe("useAuthPanel", () => {
    it("starts on the sign-in journey with nothing attempted", () => {
        const { result } = renderHook(() => useAuthPanel())
        expect(result.current.mode).toBe("signIn")
        expect(result.current.step).toBe("details")
        expect(result.current.sentCount).toBe(0)
        expect(result.current.isPending).toBe(false)
        expect(result.current.failure).toBeUndefined()
    })

    it("writes the OTP state to the URL and persists only safe challenge metadata", async () => {
        const replaceState = vi.spyOn(window.history, "replaceState")
        mocks.signInInit.mockResolvedValue(challenge("signInInit", "challenge-refresh", 600))
        const { result } = renderHook(() => useAuthPanel())

        act(() => {
            result.current.onSubmitDetails(details)
        })

        await waitFor(() => expect(result.current.step).toBe("code"))
        await waitFor(() => {
            expect(String(replaceState.mock.calls.at(-1)?.[2])).toContain("authState=sign-in-otp")
        })
        const stored = window.sessionStorage.getItem("starci.auth.flow") ?? ""
        expect(stored).toContain("challenge-refresh")
        expect(stored).toContain("learner@example.com")
        expect(stored).not.toContain(details.password)
        expect(stored).not.toContain("otp")
        expect(stored).not.toContain("token")
    })

    it("hydrates the same OTP challenge after refresh when URL state and session record agree", () => {
        window.sessionStorage.setItem("starci.auth.flow", JSON.stringify({
            mode: "signIn",
            step: "code",
            email: "learner@example.com",
            challengeId: "challenge-refresh",
            expiresAt: Date.now() + 300_000,
            sentCount: 1,
            hasAgreedToTerms: false,
            rememberMe: true,
        }))
        stubLocation({ search: "?authState=sign-in-otp" })

        const { result } = renderHook(() => useAuthPanel())

        expect(result.current.mode).toBe("signIn")
        expect(result.current.step).toBe("code")
        expect(result.current.email).toBe("learner@example.com")
        expect(result.current.challengeId).toBe("challenge-refresh")
        expect(result.current.expiresInSeconds).toBeGreaterThan(0)
        expect(result.current.rememberMe).toBe(true)
    })

    it("falls back safely when an OTP URL has no matching challenge record", () => {
        stubLocation({ search: "?authState=sign-up-otp" })

        const { result } = renderHook(() => useAuthPanel())

        expect(result.current.mode).toBe("signUp")
        expect(result.current.step).toBe("details")
        expect(result.current.challengeId).toBeUndefined()
    })

    it("holds the details step open while the request is in flight", async () => {
        const pending = defer()
        mocks.signInInit.mockReturnValue(pending.promise)
        const { result } = renderHook(() => useAuthPanel())

        act(() => {
            result.current.onSubmitDetails(details)
        })
        expect(result.current.isPending).toBe(true)
        expect(result.current.step).toBe("details")

        await act(async () => {
            pending.resolve(challenge("signInInit", "challenge-1", 300))
            await pending.promise
        })
        await waitFor(() => expect(result.current.step).toBe("code"))
        expect(result.current.isPending).toBe(false)
        expect(result.current.email).toBe(details.email)
        expect(result.current.challengeId).toBe("challenge-1")
        expect(result.current.expiresInSeconds).toBe(300)
        expect(result.current.sentCount).toBe(1)
    })

    it("ignores duplicate details submissions while the first request is pending", async () => {
        const pending = defer()
        mocks.signInInit.mockReturnValue(pending.promise)
        const { result } = renderHook(() => useAuthPanel())

        act(() => {
            result.current.onSubmitDetails(details)
            result.current.onSubmitDetails(details)
        })

        expect(mocks.signInInit).toHaveBeenCalledTimes(1)
        await act(async () => {
            pending.resolve(challenge("signInInit", "challenge-duplicate", 300))
            await pending.promise
        })
    })

    it("reports a refusal the server described, message and code intact", async () => {
        mocks.signInInit.mockResolvedValue(refusal("signInInit", "Those details do not match.", "BAD_CREDENTIALS"))
        const { result } = renderHook(() => useAuthPanel())

        await act(async () => {
            result.current.onSubmitDetails(details)
        })
        await waitFor(() => expect(result.current.failure).toBeDefined())
        expect(result.current.failure?.message).toBe("Those details do not match.")
        expect(result.current.failure?.code).toBe("BAD_CREDENTIALS")
        expect(result.current.failure?.isTransport).toBe(false)
        expect(result.current.step).toBe("details")
    })

    it("does not expose raw HTTP client text for a reached 401 refusal", async () => {
        mocks.signInInit.mockResolvedValue(refusal("signInInit", "Request failed with status code 401", "UNAUTHORIZED"))
        const { result } = renderHook(() => useAuthPanel())

        await act(async () => {
            result.current.onSubmitDetails(details)
        })

        await waitFor(() => expect(result.current.failure).toBeDefined())
        expect(result.current.failure?.isTransport).toBe(false)
        expect(result.current.failure?.message).toBeUndefined()
        expect(result.current.failure?.code).toBe("UNAUTHORIZED")
    })

    it("tells a request that never arrived apart from one the server refused", async () => {
        mocks.signInInit.mockRejectedValue(new Error("network"))
        const { result } = renderHook(() => useAuthPanel())

        await act(async () => {
            result.current.onSubmitDetails(details)
        })
        await waitFor(() => expect(result.current.failure).toBeDefined())
        expect(result.current.failure?.isTransport).toBe(true)
        expect(result.current.failure?.message).toBeUndefined()
    })

    it("preserves an HTTP 429 as a rate-limit verdict with its cooldown", async () => {
        mocks.signInInit.mockRejectedValue(new ServerError("Too Many Requests", {
            response: new Response("", {
                status: 429,
                headers: { "retry-after-short": "17" },
            }),
            bodyText: "",
        }))
        const { result } = renderHook(() => useAuthPanel())

        act(() => result.current.onSubmitDetails(details))

        await waitFor(() => expect(result.current.failure).toBeDefined())
        expect(result.current.failure).toMatchObject({
            code: "RATE_LIMITED",
            isTransport: false,
            retryAfterSeconds: 17,
        })
    })

    it("preserves a GraphQL rate-limit verdict when the transport remains successful", async () => {
        mocks.signInInit.mockRejectedValue(new CombinedGraphQLErrors({
            data: null,
            errors: [{
                message: "Too many requests.",
                extensions: {
                    code: "RATE_LIMIT_EXCEEDED_EXCEPTION",
                    retryAfterSeconds: 23,
                },
            }],
        }))
        const { result } = renderHook(() => useAuthPanel())

        act(() => result.current.onSubmitDetails(details))

        await waitFor(() => expect(result.current.failure).toBeDefined())
        expect(result.current.failure).toMatchObject({
            code: "RATE_LIMITED",
            isTransport: false,
            retryAfterSeconds: 23,
        })
    })

    it("refuses a code when no challenge is open", () => {
        const { result } = renderHook(() => useAuthPanel())
        act(() => {
            result.current.onSubmitCode({ otp: "123456" })
        })
        expect(mocks.signInVerify).not.toHaveBeenCalled()
    })

    it("stores the token and hands sign-in straight to its destination without a done screen", async () => {
        mocks.signInInit.mockResolvedValue(challenge("signInInit", "challenge-1", 300))
        mocks.signInVerify.mockResolvedValue(session("signInVerifyOtp", "token-1"))
        const onSignedIn = vi.fn()
        const { result } = renderHook(() => useAuthPanel({ onSignedIn }))

        await act(async () => {
            result.current.onSubmitDetails(details)
        })
        await waitFor(() => expect(result.current.step).toBe("code"))

        await act(async () => {
            result.current.onSubmitCode({ otp: "123456" })
        })
        await waitFor(() => expect(onSignedIn).toHaveBeenCalledTimes(1))
        expect(result.current.step).toBe("code")
        expect(result.current.isPending).toBe(true)
        expect(mocks.signInVerify).toHaveBeenCalledWith({ request: { challengeId: "challenge-1", otp: "123456" } })
        expect(getSessionToken()).toBe("token-1")
    })

    it("counts a resend, and reads the reissued challenge back rather than assuming it", async () => {
        mocks.signInInit.mockResolvedValue(challenge("signInInit", "challenge-1", 300))
        mocks.signInResend.mockResolvedValue(challenge("signInResendOtp", "challenge-2", 120))
        const { result } = renderHook(() => useAuthPanel())

        await act(async () => {
            result.current.onSubmitDetails(details)
        })
        await waitFor(() => expect(result.current.step).toBe("code"))

        await act(async () => {
            result.current.onResend()
        })
        await waitFor(() => expect(result.current.sentCount).toBe(2))
        expect(result.current.challengeId).toBe("challenge-2")
        expect(result.current.expiresInSeconds).toBe(120)
        expect(result.current.isResending).toBe(false)
    })

    it("prevents duplicate resend and verify requests while resend is pending", async () => {
        mocks.signInInit.mockResolvedValue(challenge("signInInit", "challenge-1", 300))
        const pending = defer()
        mocks.signInResend.mockReturnValue(pending.promise)
        const { result } = renderHook(() => useAuthPanel())

        await act(async () => {
            result.current.onSubmitDetails(details)
        })
        await waitFor(() => expect(result.current.step).toBe("code"))

        act(() => {
            result.current.onResend()
            result.current.onResend()
            result.current.onSubmitCode({ otp: "123456" })
        })
        expect(mocks.signInResend).toHaveBeenCalledTimes(1)
        expect(mocks.signInVerify).not.toHaveBeenCalled()

        await act(async () => {
            pending.resolve(challenge("signInResendOtp", "challenge-2", 300))
            await pending.promise
        })
    })

    it("routes the sign-up journey to its own operations", async () => {
        mocks.signUpInit.mockResolvedValue(challenge("signUpInit", "challenge-9", 300))
        mocks.signUpVerify.mockResolvedValue(session("signUpVerifyOtp", "token-9"))
        const { result } = renderHook(() => useAuthPanel())

        act(() => {
            result.current.onChangeMode("signUp")
        })
        await act(async () => {
            result.current.onSubmitDetails(details)
        })
        await waitFor(() => expect(result.current.step).toBe("code"))
        expect(mocks.signUpInit).toHaveBeenCalledWith({ request: details })
        expect(mocks.signInInit).not.toHaveBeenCalled()

        await act(async () => {
            result.current.onSubmitCode({ otp: "000111" })
        })
        await waitFor(() => expect(result.current.step).toBe("done"))
        expect(mocks.signUpVerify).toHaveBeenCalledTimes(1)
        expect(mocks.signInVerify).not.toHaveBeenCalled()
    })

    it("sends the new password in the FIRST step of a reset, because that is what the schema takes", async () => {
        mocks.forgotInit.mockResolvedValue(challenge("forgotPasswordInit", "challenge-3", 300))
        const { result } = renderHook(() => useAuthPanel())

        act(() => {
            result.current.onChangeMode("forgotPassword")
        })
        await act(async () => {
            result.current.onSubmitDetails({ email: details.email, password: "a-new-secret" })
        })
        await waitFor(() => expect(result.current.step).toBe("code"))
        expect(mocks.forgotInit).toHaveBeenCalledWith({
            request: { email: details.email, newPassword: "a-new-secret" },
        })
    })

    it("starts the journey again when the reader switches modes", async () => {
        mocks.signInInit.mockResolvedValue(challenge("signInInit", "challenge-1", 300))
        const { result } = renderHook(() => useAuthPanel())

        await act(async () => {
            result.current.onSubmitDetails(details)
        })
        await waitFor(() => expect(result.current.step).toBe("code"))

        act(() => {
            result.current.onChangeMode("signUp")
        })
        expect(result.current.mode).toBe("signUp")
        expect(result.current.step).toBe("details")
        expect(result.current.challengeId).toBeUndefined()
        expect(result.current.sentCount).toBe(0)
    })

    it("drops an answer to the journey the reader has already left", async () => {
        const pending = defer()
        mocks.signInInit.mockReturnValue(pending.promise)
        const { result } = renderHook(() => useAuthPanel())

        act(() => {
            result.current.onSubmitDetails(details)
        })
        act(() => {
            result.current.onChangeMode("signUp")
        })
        await act(async () => {
            pending.resolve(challenge("signInInit", "challenge-1", 300))
            await pending.promise
        })
        expect(result.current.mode).toBe("signUp")
        expect(result.current.step).toBe("details")
        expect(result.current.challengeId).toBeUndefined()
    })

    it("records the agreement without touching anything else", () => {
        const { result } = renderHook(() => useAuthPanel())
        expect(result.current.hasAgreedToTerms).toBe(false)
        act(() => {
            result.current.onChangeAgreedToTerms(true)
        })
        expect(result.current.hasAgreedToTerms).toBe(true)
        expect(result.current.step).toBe("details")
    })

    it("completes an explicitly enabled local test sign-in without opening the code step",
        async () => {
            mocks.signInInit.mockResolvedValue(session("signInInit", "token-local"))
            const onSignedIn = vi.fn()
            const { result } = renderHook(() => useAuthPanel({ onSignedIn }))

            await act(async () => {
                result.current.onSubmitDetails({
                    email: "test@starci.local",
                    password: "secret",
                })
            })

            await waitFor(() => expect(onSignedIn).toHaveBeenCalledTimes(1))
            expect(result.current.step).toBe("details")
            expect(result.current.isPending).toBe(true)
            expect(result.current.challengeId).toBeUndefined()
            expect(result.current.sentCount).toBe(0)
            expect(getSessionToken()).toBe("token-local")
            expect(onSignedIn).toHaveBeenCalledTimes(1)
            expect(mocks.signInVerify).not.toHaveBeenCalled()
        })

    it("keeps the remember-me choice as controlled auth state", () => {
        const { result } = renderHook(() => useAuthPanel())
        expect(result.current.rememberMe).toBe(false)
        act(() => {
            result.current.onChangeRememberMe(true)
        })
        expect(result.current.rememberMe).toBe(true)
        expect(result.current.step).toBe("details")
    })

    it("leaves for the provider, remembering which one so the callback can finish", () => {
        const assign = stubLocation({ search: "" })
        const { result } = renderHook(() => useAuthPanel())

        act(() => {
            result.current.onOauthPress(KeycloakIdentityProvider.Google)
        })
        const target = String(assign.mock.calls[0][0])
        expect(target).toContain("/api/v1/keycloak/google/redirect")
        expect(target).toContain("redirect_uri=")
        expect(window.sessionStorage.getItem("starci.auth.oauth-provider")).toBe("google")
    })

    it("trades an identity provider's code for a session of ours", async () => {
        window.sessionStorage.setItem("starci.auth.oauth-provider", "github")
        stubLocation({ search: "?code=abc&state=xyz" })
        mocks.exchange.mockResolvedValue(session("exchangeCodeForToken", "token-oauth"))
        const onSignedIn = vi.fn()
        const { result } = renderHook(() => useAuthPanel({ onSignedIn }))

        await waitFor(() => expect(onSignedIn).toHaveBeenCalledTimes(1))
        expect(result.current.step).toBe("details")
        expect(result.current.isPending).toBe(true)
        expect(mocks.exchange).toHaveBeenCalledWith({
            request: { code: "abc", provider: "github", state: "xyz" },
        })
        expect(getSessionToken()).toBe("token-oauth")
        // The hint is spent, not left behind for the next visit to this address to act on.
        expect(window.sessionStorage.getItem("starci.auth.oauth-provider")).toBeNull()
    })

    it("says so when the provider sent the reader back with a refusal instead of a code", async () => {
        window.sessionStorage.setItem("starci.auth.oauth-provider", "google")
        stubLocation({ search: "?error=access_denied" })
        const { result } = renderHook(() => useAuthPanel())

        await waitFor(() => expect(result.current.failure).toBeDefined())
        expect(result.current.failure?.code).toBe("access_denied")
        expect(mocks.exchange).not.toHaveBeenCalled()
    })

    it("does not exchange anything on an ordinary visit", () => {
        renderHook(() => useAuthPanel())
        expect(mocks.exchange).not.toHaveBeenCalled()
    })

    it("reports a refused code with the server's own message, and stays on the code step", async () => {
        mocks.signInInit.mockResolvedValue(challenge("signInInit", "challenge-1", 300))
        mocks.signInVerify.mockResolvedValue(refusal("signInVerifyOtp", "That code is wrong.", "BAD_OTP"))
        const { result } = renderHook(() => useAuthPanel())

        await act(async () => {
            result.current.onSubmitDetails(details)
        })
        await waitFor(() => expect(result.current.step).toBe("code"))

        await act(async () => {
            result.current.onSubmitCode({ otp: "000000" })
        })
        await waitFor(() => expect(result.current.failure).toBeDefined())
        expect(result.current.failure?.message).toBe("That code is wrong.")
        expect(result.current.failure?.code).toBe("BAD_OTP")
        expect(result.current.failure?.isTransport).toBe(false)
        expect(result.current.step).toBe("code")
        expect(result.current.isPending).toBe(false)
        expect(getSessionToken()).toBeUndefined()
    })

    it("returns an expired OTP challenge to details with an actionable refusal", async () => {
        const replaceState = vi.spyOn(window.history, "replaceState")
        mocks.signInInit.mockResolvedValue(challenge("signInInit", "challenge-expired", 1))
        mocks.signInVerify.mockResolvedValue(refusal(
            "signInVerifyOtp",
            "Challenge not found",
            "CHALLENGE_OTP_NOT_FOUND_EXCEPTION",
        ))
        const { result } = renderHook(() => useAuthPanel())

        act(() => result.current.onSubmitDetails(details))
        await waitFor(() => expect(result.current.step).toBe("code"))
        act(() => result.current.onSubmitCode({ otp: "000000" }))

        await waitFor(() => expect(result.current.step).toBe("details"))
        expect(result.current.challengeId).toBeUndefined()
        expect(result.current.sentCount).toBe(0)
        expect(result.current.failure?.code).toBe("CHALLENGE_OTP_NOT_FOUND_EXCEPTION")
        await waitFor(() => {
            expect(String(replaceState.mock.calls.at(-1)?.[2])).toContain("authState=sign-in")
        })
    })

    it("does not call a code wrong when the request never reached a verdict", async () => {
        mocks.signInInit.mockResolvedValue(challenge("signInInit", "challenge-1", 300))
        mocks.signInVerify.mockRejectedValue(new Error("network"))
        const { result } = renderHook(() => useAuthPanel())

        await act(async () => {
            result.current.onSubmitDetails(details)
        })
        await waitFor(() => expect(result.current.step).toBe("code"))

        await act(async () => {
            result.current.onSubmitCode({ otp: "123456" })
        })
        await waitFor(() => expect(result.current.failure).toBeDefined())
        expect(result.current.failure?.isTransport).toBe(true)
        expect(result.current.failure?.message).toBeUndefined()
        expect(result.current.step).toBe("code")
    })

    it("refuses a resend when no challenge is open", () => {
        const { result } = renderHook(() => useAuthPanel())
        act(() => {
            result.current.onResend()
        })
        expect(mocks.signInResend).not.toHaveBeenCalled()
        expect(result.current.isResending).toBe(false)
    })

    it("keeps the challenge and the count when a resend is refused", async () => {
        mocks.signInInit.mockResolvedValue(challenge("signInInit", "challenge-1", 300))
        mocks.signInResend.mockResolvedValue(refusal("signInResendOtp", "Too many codes.", "RATE_LIMITED"))
        const { result } = renderHook(() => useAuthPanel())

        await act(async () => {
            result.current.onSubmitDetails(details)
        })
        await waitFor(() => expect(result.current.step).toBe("code"))

        await act(async () => {
            result.current.onResend()
        })
        await waitFor(() => expect(result.current.failure).toBeDefined())
        expect(result.current.failure?.message).toBe("Too many codes.")
        expect(result.current.failure?.code).toBe("RATE_LIMITED")
        expect(result.current.isResending).toBe(false)
        expect(result.current.sentCount).toBe(1)
        expect(result.current.challengeId).toBe("challenge-1")
    })

    it("returns to details when resend discovers that the OTP challenge is gone", async () => {
        mocks.signInInit.mockResolvedValue(challenge("signInInit", "challenge-expired", 1))
        mocks.signInResend.mockResolvedValue(refusal(
            "signInResendOtp",
            "Challenge not found",
            "CHALLENGE_OTP_NOT_FOUND_EXCEPTION",
        ))
        const { result } = renderHook(() => useAuthPanel())

        act(() => result.current.onSubmitDetails(details))
        await waitFor(() => expect(result.current.step).toBe("code"))
        act(() => result.current.onResend())

        await waitFor(() => expect(result.current.step).toBe("details"))
        expect(result.current.challengeId).toBeUndefined()
        expect(result.current.sentCount).toBe(0)
        expect(result.current.failure?.code).toBe("CHALLENGE_OTP_NOT_FOUND_EXCEPTION")
    })

    it("keeps the challenge when a resend never reached a verdict", async () => {
        mocks.signInInit.mockResolvedValue(challenge("signInInit", "challenge-1", 300))
        mocks.signInResend.mockRejectedValue(new Error("network"))
        const { result } = renderHook(() => useAuthPanel())

        await act(async () => {
            result.current.onSubmitDetails(details)
        })
        await waitFor(() => expect(result.current.step).toBe("code"))

        await act(async () => {
            result.current.onResend()
        })
        await waitFor(() => expect(result.current.failure).toBeDefined())
        expect(result.current.failure?.isTransport).toBe(true)
        expect(result.current.isResending).toBe(false)
        expect(result.current.sentCount).toBe(1)
        expect(result.current.challengeId).toBe("challenge-1")
    })

    it("routes a sign-up resend to the sign-up operation, not the sign-in one", async () => {
        mocks.signUpInit.mockResolvedValue(challenge("signUpInit", "challenge-9", 300))
        mocks.signUpResend.mockResolvedValue(challenge("signUpResendOtp", "challenge-9", 120))
        const { result } = renderHook(() => useAuthPanel({ initialMode: "signUp" }))

        await act(async () => {
            result.current.onSubmitDetails(details)
        })
        await waitFor(() => expect(result.current.step).toBe("code"))

        await act(async () => {
            result.current.onResend()
        })
        await waitFor(() => expect(result.current.sentCount).toBe(2))
        expect(mocks.signUpResend).toHaveBeenCalledWith({ request: { challengeId: "challenge-9" } })
        expect(mocks.signInResend).not.toHaveBeenCalled()
    })

    it("routes the reset journey's second step and resend to their own operations", async () => {
        mocks.forgotInit.mockResolvedValue(challenge("forgotPasswordInit", "challenge-3", 300))
        mocks.forgotResend.mockResolvedValue(challenge("forgotPasswordResendOtp", "challenge-4", 120))
        mocks.forgotVerify.mockResolvedValue(session("forgotPasswordVerifyOtp", "token-reset"))
        const { result } = renderHook(() => useAuthPanel({ initialMode: "forgotPassword" }))

        await act(async () => {
            result.current.onSubmitDetails({ email: details.email, password: "a-new-secret" })
        })
        await waitFor(() => expect(result.current.step).toBe("code"))

        await act(async () => {
            result.current.onResend()
        })
        await waitFor(() => expect(result.current.challengeId).toBe("challenge-4"))
        expect(mocks.forgotResend).toHaveBeenCalledWith({ request: { challengeId: "challenge-3" } })

        await act(async () => {
            result.current.onSubmitCode({ otp: "222333" })
        })
        await waitFor(() => expect(result.current.step).toBe("done"))
        expect(mocks.forgotVerify).toHaveBeenCalledWith({ request: { challengeId: "challenge-4", otp: "222333" } })
        expect(mocks.signInVerify).not.toHaveBeenCalled()
        expect(getSessionToken()).toBe("token-reset")
    })

    it("surfaces the provider's own refusal when the exchange is turned down", async () => {
        window.sessionStorage.setItem("starci.auth.oauth-provider", "google")
        stubLocation({ search: "?code=abc&state=xyz" })
        mocks.exchange.mockResolvedValue(
            refusal("exchangeCodeForToken", "That sign-in could not be completed.", "INVALID_GRANT"),
        )
        const { result } = renderHook(() => useAuthPanel())

        await waitFor(() => expect(result.current.failure).toBeDefined())
        expect(result.current.failure?.message).toBe("That sign-in could not be completed.")
        expect(result.current.failure?.code).toBe("INVALID_GRANT")
        expect(result.current.failure?.isTransport).toBe(false)
        expect(result.current.isPending).toBe(false)
        expect(result.current.step).toBe("details")
        expect(getSessionToken()).toBeUndefined()
    })

    it("tells an exchange that never arrived apart from one the server turned down", async () => {
        window.sessionStorage.setItem("starci.auth.oauth-provider", "google")
        stubLocation({ search: "?code=abc&state=xyz" })
        mocks.exchange.mockRejectedValue(new Error("network"))
        const { result } = renderHook(() => useAuthPanel())

        await waitFor(() => expect(result.current.failure).toBeDefined())
        expect(result.current.failure?.isTransport).toBe(true)
        expect(result.current.failure?.message).toBeUndefined()
        expect(result.current.isPending).toBe(false)
    })

    it("cannot finish an exchange whose provider hint the browser refuses to hand back", async () => {
        stubLocation({ search: "?code=abc&state=xyz" })
        stubHostileStorage()
        const { result } = renderHook(() => useAuthPanel())

        // A browser that refuses storage still renders a working password form; only the OAuth leg
        // is lost, and it is lost quietly rather than by guessing which provider issued the code.
        expect(mocks.exchange).not.toHaveBeenCalled()
        expect(result.current.failure).toBeUndefined()
        expect(result.current.step).toBe("details")
    })

    it("still leaves for the provider when the browser refuses to remember which one", () => {
        const assign = stubLocation({ search: "" })
        stubHostileStorage()
        const { result } = renderHook(() => useAuthPanel())

        act(() => {
            result.current.onOauthPress(KeycloakIdentityProvider.Github)
        })
        expect(String(assign.mock.calls[0][0])).toContain("/api/v1/keycloak/github/redirect")
    })

    it("ignores a code that arrives with no provider hint stored", () => {
        stubLocation({ search: "?code=abc&state=xyz" })
        const { result } = renderHook(() => useAuthPanel())
        expect(mocks.exchange).not.toHaveBeenCalled()
        expect(result.current.step).toBe("details")
    })

    it("ignores a callback that carries a provider hint but no state", () => {
        window.sessionStorage.setItem("starci.auth.oauth-provider", "google")
        stubLocation({ search: "?code=abc" })
        renderHook(() => useAuthPanel())
        expect(mocks.exchange).not.toHaveBeenCalled()
        // The hint is left alone: the exchange it belongs to has not happened yet.
        expect(window.sessionStorage.getItem("starci.auth.oauth-provider")).toBe("google")
    })
})
