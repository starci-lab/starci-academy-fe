import { describe, expect, it } from "vitest"
import {
    isSignInSessionData,
    type MutationSignInInitResponse,
    type MutationSignInResendOtpResponse,
    type MutationSignInVerifyOtpResponse,
    type SignInChallengeData,
    type SignInInitRequest,
    type SignInResendOtpRequest,
    type SignInSessionData,
    type SignInVerifyOtpRequest,
} from "./auth"

/**
 * What these tests guard: the field names. Every one of them was read out of the running
 * schema by introspection, and the whole flow fails silently if one drifts - a renamed
 * `challengeId` does not break the build, it breaks the second step at runtime with a
 * message about a challenge that does not exist.
 *
 * They also pin the two facts that are easy to assume and wrong: the payload lives UNDER the
 * envelope, and a verified challenge is worth an access token and nothing else.
 */

describe("SignInInitRequest", () => {
    it("takes the credentials and only the credentials", () => {
        const request: SignInInitRequest = { email: "learner@example.com", password: "secret" }
        expect(Object.keys(request)).toEqual(["email", "password"])
    })
})

describe("MutationSignInInitResponse", () => {
    it("nests the challenge under the standard envelope", () => {
        const response: MutationSignInInitResponse = {
            signInInit: {
                success: true,
                message: "ok",
                data: { challengeId: "challenge-1", expiresInSeconds: 300 },
            },
        }
        const data = response.signInInit.data
        expect(data && "challengeId" in data && data.challengeId).toBe("challenge-1")
        expect(data && "expiresInSeconds" in data && data.expiresInSeconds).toBe(300)
    })

    it("nests a completed local test session under the same envelope",
        () => {
            const response: MutationSignInInitResponse = {
                signInInit: {
                    success: true,
                    message: "ok",
                    data: { accessToken: "token-local" },
                },
            }
            const data = response.signInInit.data
            expect(data && isSignInSessionData(data)).toBe(true)
            if (data && isSignInSessionData(data)) {
                expect(data.accessToken).toBe("token-local")
            }
        })

    it("does not mistake nullable GraphQL union fields for a completed session", () => {
        const challengeWithSelectedNullableField = {
            challengeId: "challenge-1",
            expiresInSeconds: 300,
            accessToken: null,
        } as unknown as SignInChallengeData

        expect(isSignInSessionData(challengeWithSelectedNullableField)).toBe(false)
    })

    it("describes a refusal with no challenge at all", () => {
        const response: MutationSignInInitResponse = {
            signInInit: { success: false, message: "Wrong password", error: "INVALID_CREDENTIALS" },
        }
        expect(response.signInInit.data).toBeUndefined()
        expect(response.signInInit.error).toBe("INVALID_CREDENTIALS")
    })
})

describe("SignInChallengeData", () => {
    it("holds the id and the validity window, and nothing else", () => {
        const data: SignInChallengeData = { challengeId: "challenge-1", expiresInSeconds: 300 }
        expect(Object.keys(data)).toEqual(["challengeId", "expiresInSeconds"])
    })
})

describe("SignInVerifyOtpRequest", () => {
    it("quotes the challenge alongside the code", () => {
        const request: SignInVerifyOtpRequest = { challengeId: "challenge-1", otp: "123456" }
        expect(Object.keys(request)).toEqual(["challengeId", "otp"])
    })
})

describe("MutationSignInVerifyOtpResponse", () => {
    it("returns an access token and nothing else in the payload", () => {
        const response: MutationSignInVerifyOtpResponse = {
            signInVerifyOtp: {
                success: true,
                message: "ok",
                data: { accessToken: "token-1" },
            },
        }
        const data: SignInSessionData | undefined = response.signInVerifyOtp.data
        expect(data && Object.keys(data)).toEqual(["accessToken"])
    })

    it("describes a wrong code as a refusal inside the envelope, not as a missing response", () => {
        const response: MutationSignInVerifyOtpResponse = {
            signInVerifyOtp: { success: false, message: "That code is not right", error: "INVALID_OTP" },
        }
        expect(response.signInVerifyOtp.success).toBe(false)
        expect(response.signInVerifyOtp.data).toBeUndefined()
        expect(response.signInVerifyOtp.message).toBe("That code is not right")
    })
})

describe("SignInResendOtpRequest", () => {
    it("quotes the challenge and never the credentials", () => {
        const request: SignInResendOtpRequest = { challengeId: "challenge-1" }
        expect(Object.keys(request)).toEqual(["challengeId"])
    })
})

describe("MutationSignInResendOtpResponse", () => {
    it("answers a resend with a challenge, because the new code has a new expiry", () => {
        const response: MutationSignInResendOtpResponse = {
            signInResendOtp: {
                success: true,
                message: "ok",
                data: { challengeId: "challenge-1", expiresInSeconds: 120 },
            },
        }
        expect(response.signInResendOtp.data?.expiresInSeconds).toBe(120)
    })
})
