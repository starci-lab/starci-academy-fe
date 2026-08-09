import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import {
    MutationSignInResendOtp,
    mutationSignInResendOtp,
    mutationSignInResendOtpMap,
} from "./mutation-sign-in-resend-otp"

/**
 * What these tests guard: that a resend quotes the CHALLENGE and never the credentials. The
 * temptation is to resend by running the first step again, which opens a second challenge and
 * quietly kills the id the reader is still holding a code for - so the absence of `email` and
 * `password` from this document is the assertion that matters most here.
 */

const mocks = vi.hoisted(() => ({
    mutate: vi.fn(),
    createApolloClient: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({
    createApolloClient: mocks.createApolloClient,
}))

/** The document text of the only variant, as it would be printed onto the wire. */
const documentText = print(mutationSignInResendOtpMap[MutationSignInResendOtp.Mutation1])

beforeEach(() => {
    mocks.mutate.mockReset()
    mocks.mutate.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ mutate: mocks.mutate })
})

describe("mutationSignInResendOtpMap", () => {
    it("names the operation so it is identifiable in a server log", () => {
        expect(documentText).toContain("mutation SignInResendOtp")
    })

    it("declares the argument type the schema declares", () => {
        expect(documentText).toContain("$request: SignInResendOtpRequest!")
        expect(documentText).toContain("signInResendOtp(request: $request)")
    })

    it("asks for the new expiry, because that is what a resend actually changes", () => {
        expect(documentText).toContain("challengeId")
        expect(documentText).toContain("expiresInSeconds")
    })

    it("never carries the credentials - a resend reuses the challenge, it does not reopen one", () => {
        expect(documentText).not.toContain("password")
        expect(documentText).not.toContain("email")
    })
})

describe("mutationSignInResendOtp", () => {
    it("sends the challenge as its single argument", async () => {
        await mutationSignInResendOtp({ request: { challengeId: "challenge-1" } })
        expect(mocks.mutate.mock.calls[0][0]).toEqual({
            mutation: mutationSignInResendOtpMap[MutationSignInResendOtp.Mutation1],
            variables: { request: { challengeId: "challenge-1" } },
        })
    })

    it("builds an anonymous client - the viewer still has no token", async () => {
        await mutationSignInResendOtp({ request: { challengeId: "challenge-1" } })
        expect(mocks.createApolloClient.mock.calls[0][0]).not.toHaveProperty("withAuth", true)
    })

    it("returns whatever the client returned, unchanged", async () => {
        const result = { data: { signInResendOtp: { success: true, message: "ok" } } }
        mocks.mutate.mockResolvedValue(result)
        await expect(
            mutationSignInResendOtp({ request: { challengeId: "challenge-1" } }),
        ).resolves.toBe(result)
    })
})
