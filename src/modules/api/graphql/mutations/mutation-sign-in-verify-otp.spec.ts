import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import {
    MutationSignInVerifyOtp,
    mutationSignInVerifyOtp,
    mutationSignInVerifyOtpMap,
} from "./mutation-sign-in-verify-otp"

/**
 * What these tests guard: that this document asks for the envelope AS WELL AS the token. The
 * failures of this operation - wrong code, expired challenge, challenge already spent - all
 * arrive as a 200 with `success: false`, so a selection that took only `data` would turn every
 * one of them into a blank screen with nothing to say.
 */

const mocks = vi.hoisted(() => ({
    mutate: vi.fn(),
    createApolloClient: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({
    createApolloClient: mocks.createApolloClient,
}))

/** The document text of the only variant, as it would be printed onto the wire. */
const documentText = print(mutationSignInVerifyOtpMap[MutationSignInVerifyOtp.Mutation1])

beforeEach(() => {
    mocks.mutate.mockReset()
    mocks.mutate.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ mutate: mocks.mutate })
})

describe("mutationSignInVerifyOtpMap", () => {
    it("names the operation so it is identifiable in a server log", () => {
        expect(documentText).toContain("mutation SignInVerifyOtp")
    })

    it("declares the argument type the schema declares", () => {
        expect(documentText).toContain("$request: SignInVerifyOtpRequest!")
        expect(documentText).toContain("signInVerifyOtp(request: $request)")
    })

    it("selects the envelope beside the token, so a refusal can be read", () => {
        expect(documentText).toContain("success")
        expect(documentText).toContain("message")
        expect(documentText).toContain("error")
        expect(documentText).toContain("accessToken")
    })

    it("does not ask for a refresh token, because this payload has none", () => {
        expect(documentText).not.toContain("refreshToken")
    })
})

describe("mutationSignInVerifyOtp", () => {
    it("quotes the challenge alongside the code", async () => {
        await mutationSignInVerifyOtp({ request: { challengeId: "challenge-1", otp: "123456" } })
        expect(mocks.mutate.mock.calls[0][0]).toEqual({
            mutation: mutationSignInVerifyOtpMap[MutationSignInVerifyOtp.Mutation1],
            variables: { request: { challengeId: "challenge-1", otp: "123456" } },
        })
    })

    it("builds an anonymous client - earning a token is the point of the call", async () => {
        await mutationSignInVerifyOtp({ request: { challengeId: "challenge-1", otp: "123456" } })
        expect(mocks.createApolloClient.mock.calls[0][0]).not.toHaveProperty("withAuth", true)
    })

    it("returns whatever the client returned, unchanged", async () => {
        const result = { data: { signInVerifyOtp: { success: true, message: "ok" } } }
        mocks.mutate.mockResolvedValue(result)
        await expect(
            mutationSignInVerifyOtp({ request: { challengeId: "challenge-1", otp: "123456" } }),
        ).resolves.toBe(result)
    })
})
