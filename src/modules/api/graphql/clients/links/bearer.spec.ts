import { afterEach, describe, expect, it, vi } from "vitest"
import { ApolloLink, Observable } from "@apollo/client"
import { createAttachBearerTokenLink } from "./bearer"

/**
 * What these tests guard: the header is attached only when a token exists, and the token
 * itself never reaches a log. Both are silent failures otherwise - a missing header looks
 * like a back-end permission bug, and a logged token looks like nothing at all until it
 * turns up in a bug report.
 */

/** A fake operation that records the context updates the link applies to it. */
const fakeOperation = (): ApolloLink.Operation => {
    let context: Record<string, unknown> = {}
    const operation = {
        operationName: "PlatformStats",
        getContext: () => context,
        setContext: (update: unknown) => {
            const next = typeof update === "function"
                ? (update as (previous: Record<string, unknown>) => Record<string, unknown>)(context)
                : (update as Record<string, unknown>)
            context = { ...context, ...next }
        },
    }
    return operation as unknown as ApolloLink.Operation
}

/** The same fake, for an operation the document never gave a name. */
const anonymousOperation = (): ApolloLink.Operation =>
    ({ ...fakeOperation(), operationName: undefined }) as unknown as ApolloLink.Operation

/** A downstream that answers immediately, so the link's return value is subscribable. */
const forward = () => new Observable<ApolloLink.Result>((observer) => {
    observer.next({ data: {} })
    observer.complete()
})

/** Read the authorization header the link left on the operation. */
const authorizationOf = (operation: ApolloLink.Operation) =>
    (operation.getContext().headers as Record<string, string> | undefined)?.authorization

afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
})

describe("createAttachBearerTokenLink", () => {
    it("attaches the token from the injected getter", () => {
        const operation = fakeOperation()
        createAttachBearerTokenLink({ getToken: () => "abc123" }).request(operation, forward)
        expect(authorizationOf(operation)).toBe("Bearer abc123")
    })

    it("reads the environment token when no getter is injected", () => {
        vi.stubEnv("NEXT_PUBLIC_API_BEARER_TOKEN", "from-env")
        const operation = fakeOperation()
        createAttachBearerTokenLink().request(operation, forward)
        expect(authorizationOf(operation)).toBe("Bearer from-env")
    })

    it("leaves the request anonymous when there is no token", () => {
        const operation = fakeOperation()
        createAttachBearerTokenLink({ getToken: () => undefined }).request(operation, forward)
        expect(operation.getContext().headers).toBeUndefined()
    })

    it("keeps headers that were already on the operation", () => {
        const operation = fakeOperation()
        operation.setContext({ headers: { "X-Locale": "en" } })
        createAttachBearerTokenLink({ getToken: () => "abc123" }).request(operation, forward)
        expect(operation.getContext().headers).toEqual({
            "X-Locale": "en",
            authorization: "Bearer abc123",
        })
    })

    it("forwards the operation downstream either way", () => {
        const seen: Array<ApolloLink.Result> = []
        createAttachBearerTokenLink({ getToken: () => undefined })
            .request(fakeOperation(), forward)
            .subscribe({ next: (value) => seen.push(value) })
        expect(seen).toEqual([{ data: {} }])
    })

    it("never writes the token into the debug log", () => {
        const log = vi.spyOn(console, "log").mockImplementation(() => {})
        createAttachBearerTokenLink({ getToken: () => "super-secret", debug: true })
            .request(fakeOperation(), forward)
        expect(log).toHaveBeenCalledTimes(1)
        const line = String(log.mock.calls[0][0])
        expect(line).not.toContain("super-secret")
        expect(line).toContain("attached=true")
    })

    it("names an unnamed operation in the debug log rather than leaving a blank", () => {
        const log = vi.spyOn(console, "log").mockImplementation(() => {})
        createAttachBearerTokenLink({ getToken: () => undefined, debug: true })
            .request(anonymousOperation(), forward)
        expect(String(log.mock.calls[0][0])).toBe("[bearer] op=anonymous attached=false")
    })

    it("stays quiet unless debug is asked for", () => {
        const log = vi.spyOn(console, "log").mockImplementation(() => {})
        createAttachBearerTokenLink({ getToken: () => "abc123" }).request(fakeOperation(), forward)
        expect(log).not.toHaveBeenCalled()
    })
})
