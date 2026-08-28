import { afterEach, describe, expect, it, vi } from "vitest"
import { apiEnv } from "./env"

/**
 * What these tests guard: the environment is read at CALL time and each variable is spelled
 * exactly as the deployment spells it. A typo in a variable name is invisible at runtime -
 * the default silently takes over and the app quietly talks to localhost in production.
 */

afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
})

describe("apiEnv", () => {
    it("falls back to the local endpoint when the URL is unset", () => {
        vi.stubEnv("NEXT_PUBLIC_API_GRAPHQL_BASE_URL", "")
        expect(apiEnv().graphql.url).toBe("http://localhost:3001/graphql")
    })

    it("reads the endpoint from NEXT_PUBLIC_API_GRAPHQL_BASE_URL", () => {
        vi.stubEnv("NEXT_PUBLIC_API_GRAPHQL_BASE_URL", "https://api.example.com/graphql")
        expect(apiEnv().graphql.url).toBe("https://api.example.com/graphql")
    })

    it("aligns loopback API cookies with the host spelling used by the browser", () => {
        vi.stubEnv("NEXT_PUBLIC_API_GRAPHQL_BASE_URL", "http://localhost:3001/graphql")
        vi.stubGlobal("window", { location: { hostname: "127.0.0.1" } })

        expect(apiEnv().graphql.url).toBe("http://127.0.0.1:3001/graphql")
    })

    it("aligns each lvh.me UAT case to its own cookie host", () => {
        vi.stubEnv("NEXT_PUBLIC_API_GRAPHQL_BASE_URL", "http://localhost:3001/graphql")
        vi.stubGlobal("window", { location: { hostname: "expired-otp.lvh.me" } })

        expect(apiEnv().graphql.url).toBe("http://expired-otp.lvh.me:3001/graphql")
    })

    it("does not treat a lookalike lvh.me suffix as loopback", () => {
        vi.stubEnv("NEXT_PUBLIC_API_GRAPHQL_BASE_URL", "http://localhost:3001/graphql")
        vi.stubGlobal("window", { location: { hostname: "expired-otp.lvh.me.example.com" } })

        expect(apiEnv().graphql.url).toBe("http://localhost:3001/graphql")
    })

    it("never rewrites a deployed API host from a loopback page", () => {
        vi.stubEnv("NEXT_PUBLIC_API_GRAPHQL_BASE_URL", "https://api.example.com/graphql")
        vi.stubGlobal("window", { location: { hostname: "127.0.0.1" } })

        expect(apiEnv().graphql.url).toBe("https://api.example.com/graphql")
    })

    it("coerces every numeric transport setting to a number", () => {
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_MAX_RETRY", "5")
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_MAX_RETRY_DELAY", "2000")
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_INITIAL_RETRY_DELAY", "150")
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_TIMEOUT", "9000")
        expect(apiEnv().graphql).toMatchObject({
            maxRetry: 5,
            maxRetryDelay: 2000,
            initialRetryDelay: 150,
            timeout: 9000,
        })
    })

    it("defaults every numeric transport setting when unset", () => {
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_MAX_RETRY", "")
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_MAX_RETRY_DELAY", "")
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_INITIAL_RETRY_DELAY", "")
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_TIMEOUT", "")
        expect(apiEnv().graphql).toMatchObject({
            maxRetry: 3,
            maxRetryDelay: 1000,
            initialRetryDelay: 300,
            timeout: 300000,
        })
    })

    it("leaves the bearer token undefined rather than empty when unset", () => {
        vi.stubEnv("NEXT_PUBLIC_API_BEARER_TOKEN", "")
        expect(apiEnv().bearerToken).toBeUndefined()
    })

    it("reads the bearer token from NEXT_PUBLIC_API_BEARER_TOKEN", () => {
        vi.stubEnv("NEXT_PUBLIC_API_BEARER_TOKEN", "token-abc")
        expect(apiEnv().bearerToken).toBe("token-abc")
    })

    it("treats debug as on unless it is explicitly the string false", () => {
        vi.stubEnv("NEXT_PUBLIC_DEBUG", "")
        expect(apiEnv().debug).toBe(true)
        vi.stubEnv("NEXT_PUBLIC_DEBUG", "false")
        expect(apiEnv().debug).toBe(false)
    })

    it("re-reads the environment on every call", () => {
        vi.stubEnv("NEXT_PUBLIC_API_GRAPHQL_BASE_URL", "https://one.example.com/graphql")
        const first = apiEnv().graphql.url
        vi.stubEnv("NEXT_PUBLIC_API_GRAPHQL_BASE_URL", "https://two.example.com/graphql")
        expect(first).not.toBe(apiEnv().graphql.url)
    })
})
