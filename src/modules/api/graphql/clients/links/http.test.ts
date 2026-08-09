import { afterEach, describe, expect, it, vi } from "vitest"
import { HttpLink } from "@apollo/client"
import { createHttpLink, resolveHttpLinkOptions } from "./http"

/**
 * What these tests guard: the link is CONFIGURED correctly. Nothing here performs a request -
 * the point is that the endpoint, the credentials mode and the header set are decided from
 * the environment and the arguments, which is the part that silently goes wrong.
 */

afterEach(() => {
    vi.unstubAllEnvs()
})

describe("resolveHttpLinkOptions", () => {
    it("targets the endpoint from the environment", () => {
        vi.stubEnv("NEXT_PUBLIC_API_GRAPHQL_BASE_URL", "https://api.example.com/graphql")
        expect(resolveHttpLinkOptions().uri).toBe("https://api.example.com/graphql")
    })

    it("lets an explicit uri win over the environment", () => {
        vi.stubEnv("NEXT_PUBLIC_API_GRAPHQL_BASE_URL", "https://api.example.com/graphql")
        expect(resolveHttpLinkOptions({ uri: "https://other.example.com/graphql" }).uri)
            .toBe("https://other.example.com/graphql")
    })

    it("sends no cookies by default", () => {
        expect(resolveHttpLinkOptions().credentials).toBe("same-origin")
    })

    it("includes cookies only when asked", () => {
        expect(resolveHttpLinkOptions({ withCredentials: true }).credentials).toBe("include")
    })

    it("drops headers whose value is undefined", () => {
        const options = resolveHttpLinkOptions({
            headers: { "X-Locale": "en", "X-Course-Id": undefined },
        })
        expect(options.headers).toEqual({ "X-Locale": "en" })
    })

    it("forwards the abort signal to fetch options", () => {
        const controller = new AbortController()
        const options = resolveHttpLinkOptions({ signal: controller.signal })
        expect(options.fetchOptions?.signal).toBe(controller.signal)
    })
})

describe("createHttpLink", () => {
    it("builds a terminal HttpLink", () => {
        expect(createHttpLink()).toBeInstanceOf(HttpLink)
    })
})
