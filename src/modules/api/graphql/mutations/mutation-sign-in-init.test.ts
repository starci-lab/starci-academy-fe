import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import {
    MutationSignInInit,
    mutationSignInInit,
    mutationSignInInitMap,
} from "./mutation-sign-in-init"

/**
 * What these tests guard: the document that goes on the wire, spelled the way the running
 * schema spells it, and the client it goes through. The transport is replaced wholesale - no
 * request is ever made - because the failures worth catching here are a renamed argument and
 * a stray auth header, both decided long before the network is involved.
 */

const mocks = vi.hoisted(() => ({
    mutate: vi.fn(),
    createApolloClient: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({
    createApolloClient: mocks.createApolloClient,
}))

/** The document text of the only variant, as it would be printed onto the wire. */
const documentText = print(mutationSignInInitMap[MutationSignInInit.Mutation1])

beforeEach(() => {
    mocks.mutate.mockReset()
    mocks.mutate.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ mutate: mocks.mutate })
})

describe("mutationSignInInitMap", () => {
    it("names the operation so it is identifiable in a server log", () => {
        expect(documentText).toContain("mutation SignInInit")
    })

    it("declares the argument type the schema declares", () => {
        expect(documentText).toContain("$request: SignInInitRequest!")
        expect(documentText).toContain("signInInit(request: $request)")
    })

    it("selects the whole envelope, not just the payload", () => {
        expect(documentText).toContain("success")
        expect(documentText).toContain("message")
        expect(documentText).toContain("error")
    })

    it("selects the challenge the second step needs", () => {
        expect(documentText).toContain("challengeId")
        expect(documentText).toContain("expiresInSeconds")
    })

    it("never asks for a token here - this step does not produce one", () => {
        expect(documentText).not.toContain("accessToken")
    })
})

describe("mutationSignInInit", () => {
    it("sends the document for the default variant with the request as its single argument", async () => {
        await mutationSignInInit({ request: { email: "learner@example.com", password: "secret" } })
        expect(mocks.mutate).toHaveBeenCalledTimes(1)
        expect(mocks.mutate.mock.calls[0][0]).toEqual({
            mutation: mutationSignInInitMap[MutationSignInInit.Mutation1],
            variables: { request: { email: "learner@example.com", password: "secret" } },
        })
    })

    it("builds an anonymous client - the viewer signing in has no token to attach", async () => {
        await mutationSignInInit({ request: { email: "learner@example.com", password: "secret" } })
        expect(mocks.createApolloClient.mock.calls[0][0]).not.toHaveProperty("withAuth", true)
    })

    it("passes the abort signal and extra headers through to the client", async () => {
        const controller = new AbortController()
        await mutationSignInInit({
            request: { email: "learner@example.com", password: "secret" },
            signal: controller.signal,
            headers: { "X-Locale": "en" },
        })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({
            signal: controller.signal,
            headers: { "X-Locale": "en" },
        })
    })

    it("returns whatever the client returned, unchanged", async () => {
        const result = { data: { signInInit: { success: true, message: "ok" } } }
        mocks.mutate.mockResolvedValue(result)
        await expect(
            mutationSignInInit({ request: { email: "learner@example.com", password: "secret" } }),
        ).resolves.toBe(result)
    })
})
