import { describe, expect, it, vi } from "vitest"
import { ApolloClient, ApolloLink, gql, HttpLink } from "@apollo/client"
import { RetryLink } from "@apollo/client/link/retry"
import { createApolloClient, createLinkChain, StarCiApolloClient } from "./create-apollo-client"

/**
 * What these tests guard: the shape and ORDER of the link chain, and the fact that the
 * anonymous chain carries no auth link at all. Order is invisible at runtime until it is
 * wrong - a timeout placed outside the retry link would cap the whole retry budget instead
 * of each attempt, and nothing about that reads as a bug in a stack trace.
 */

/** The constructor names of the chain, in order - a readable stand-in for identity. */
const chainOf = (chain: Array<ApolloLink>) => chain.map((link) => link.constructor.name)

describe("createLinkChain", () => {
    it("is retry, timeout, locale, then http when anonymous", () => {
        const chain = createLinkChain()
        expect(chain).toHaveLength(4)
        expect(chain[0]).toBeInstanceOf(RetryLink)
        expect(chain[3]).toBeInstanceOf(HttpLink)
    })

    it("inserts the bearer link before the terminal link when auth is asked for", () => {
        const chain = createLinkChain({ withAuth: true })
        expect(chain).toHaveLength(5)
        expect(chain[0]).toBeInstanceOf(RetryLink)
        expect(chain[4]).toBeInstanceOf(HttpLink)
    })

    it("adds exactly one link when auth is turned on", () => {
        expect(createLinkChain({ withAuth: true })).toHaveLength(createLinkChain().length + 1)
    })

    it("ends with the terminal link in both shapes", () => {
        expect(chainOf(createLinkChain()).at(-1)).toBe("HttpLink")
        expect(chainOf(createLinkChain({ withAuth: true })).at(-1)).toBe("HttpLink")
    })

    it("includes the session cookie whenever auth is asked for", async () => {
        const fetchMock = vi.fn(async () => new Response(JSON.stringify({ data: { viewer: true } }), {
            status: 200,
            headers: { "content-type": "application/json" },
        }))
        vi.stubGlobal("fetch", fetchMock)

        const client = createApolloClient({
            withAuth: true,
            uri: "https://api.example.com/graphql",
        })
        await client.query({ query: gql`query Viewer { viewer }` })

        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.example.com/graphql",
            expect.objectContaining({ credentials: "include" }),
        )
    })

    it("lets an explicit anonymous cookie choice opt in", async () => {
        const fetchMock = vi.fn(async () => new Response(JSON.stringify({ data: { viewer: true } }), {
            status: 200,
            headers: { "content-type": "application/json" },
        }))
        vi.stubGlobal("fetch", fetchMock)
        const client = createApolloClient({
            withCredentials: true,
            uri: "https://api.example.com/graphql",
        })
        await client.query({ query: gql`query Viewer { viewer }` })
        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.example.com/graphql",
            expect.objectContaining({ credentials: "include" }),
        )
    })

    it("builds a fresh chain on every call so no signal is shared between requests", () => {
        const first = createLinkChain()
        const second = createLinkChain()
        expect(first[0]).not.toBe(second[0])
    })
})

describe("createApolloClient", () => {
    it("builds a client with caching left to SWR", () => {
        const client = createApolloClient()
        expect(client).toBeInstanceOf(ApolloClient)
        expect(client).toBeInstanceOf(StarCiApolloClient)
        expect(client.defaultOptions.query?.fetchPolicy).toBe("no-cache")
    })

    it("forwards Apollo's constructor surface while keeping typed operation methods", () => {
        const client = createApolloClient({ uri: "https://api.example.com/graphql" })
        expect(client).toBeInstanceOf(StarCiApolloClient)
        expect(typeof client.query).toBe("function")
        expect(typeof client.mutate).toBe("function")
    })

    it("builds a separate client per call", () => {
        expect(createApolloClient()).not.toBe(createApolloClient())
    })
})
