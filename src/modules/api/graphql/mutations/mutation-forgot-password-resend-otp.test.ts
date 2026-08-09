import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import {
    MutationForgotPasswordResendOtp,
    mutationForgotPasswordResendOtp,
    mutationForgotPasswordResendOtpMap,
} from "./mutation-forgot-password-resend-otp"

/**
 * What these tests guard: the document that goes on the wire, spelled the way the RUNNING schema
 * spells it - every name below was read out of the live server by introspection - and the client
 * it goes through. The transport is replaced wholesale, because the failures worth catching here
 * are a renamed argument and a stray auth header, both decided long before the network.
 */

const mocks = vi.hoisted(() => ({
    mutate: vi.fn(),
    createApolloClient: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({
    createApolloClient: mocks.createApolloClient,
}))

/** The document text of the only variant, as it would be printed onto the wire. */
const documentText = print(mutationForgotPasswordResendOtpMap[MutationForgotPasswordResendOtp.Mutation1])

/** The request this operation is exercised with. */
const request = { challengeId: "challenge-1" }

beforeEach(() => {
    mocks.mutate.mockReset()
    mocks.mutate.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ mutate: mocks.mutate })
})

describe("mutationForgotPasswordResendOtpMap", () => {
    it("names the operation so it is identifiable in a server log", () => {
        expect(documentText).toContain("mutation ForgotPasswordResendOtp")
    })

    it("declares the argument type the live schema declares", () => {
        expect(documentText).toContain("$request: ForgotPasswordResendOtpRequest!")
        expect(documentText).toContain("forgotPasswordResendOtp(request: $request)")
    })

    it("selects the whole envelope, not just the payload", () => {
        expect(documentText).toContain("success")
        expect(documentText).toContain("message")
        expect(documentText).toContain("error")
    })

    it("selects exactly what this step produces", () => {
        expect(documentText).toContain("challengeId")
        expect(documentText).toContain("expiresInSeconds")
    })
})

describe("mutationForgotPasswordResendOtp", () => {
    it("sends the document for the default variant with the request as its single argument", async () => {
        await mutationForgotPasswordResendOtp({ request })
        expect(mocks.mutate).toHaveBeenCalledTimes(1)
        expect(mocks.mutate.mock.calls[0][0]).toEqual({
            mutation: mutationForgotPasswordResendOtpMap[MutationForgotPasswordResendOtp.Mutation1],
            variables: { request },
        })
    })

    it("builds an anonymous client - the viewer running this has no token to attach", async () => {
        await mutationForgotPasswordResendOtp({ request })
        expect(mocks.createApolloClient.mock.calls[0][0]).not.toHaveProperty("withAuth", true)
    })

    it("passes the abort signal and extra headers through to the client", async () => {
        const controller = new AbortController()
        await mutationForgotPasswordResendOtp({ request, signal: controller.signal, headers: { "X-Locale": "en" } })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({
            signal: controller.signal,
            headers: { "X-Locale": "en" },
        })
    })

    it("returns whatever the client returned, unchanged", async () => {
        const result = { data: undefined }
        mocks.mutate.mockResolvedValue(result)
        await expect(mutationForgotPasswordResendOtp({ request })).resolves.toBe(result)
    })
})
