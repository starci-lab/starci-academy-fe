/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { ApolloLink, Observable } from "@apollo/client"
import { LOCALE_COOKIE } from "@/i18n/config"
import { createAttachLocaleLink, resolveRequestLocale } from "./locale"

/**
 * What these tests guard: which language the API is told the reader is reading in. A wrong
 * answer here is silent - the request succeeds and returns English copy on a Vietnamese page,
 * which looks like a content bug rather than a header that was never sent.
 */

/** A fake operation that records the context updates the link applies to it. */
const fakeOperation = (operationName?: string): ApolloLink.Operation => {
    let context: Record<string, unknown> = {}
    const operation = {
        operationName,
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

/** A downstream that answers immediately, so the link's return value is subscribable. */
const forward = () => new Observable<ApolloLink.Result>((observer) => {
    observer.next({ data: {} })
    observer.complete()
})

/** Read the locale header the link left on the operation. */
const localeOf = (operation: ApolloLink.Operation) =>
    (operation.getContext().headers as Record<string, string> | undefined)?.["x-locale"]

/** Put the reader on a path without navigating jsdom away from the test page. */
const atPath = (pathname: string) => {
    vi.stubGlobal("window", { ...window, location: { ...window.location, pathname } })
}

/** Replace the whole cookie jar for one assertion. */
const withCookie = (value: string) => {
    vi.spyOn(document, "cookie", "get").mockReturnValue(value)
}

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

describe("resolveRequestLocale", () => {
    it("reads the locale out of the address the reader is on", () => {
        atPath("/vi/courses/fullstack")
        expect(resolveRequestLocale()).toBe("vi")
    })

    it("ignores a first segment that is not a shipped locale and asks the cookie instead", () => {
        atPath("/dashboard")
        withCookie(`${LOCALE_COOKIE}=vi`)
        expect(resolveRequestLocale()).toBe("vi")
    })

    it("reads the cookie past other cookies, trimming and decoding its value", () => {
        atPath("/dashboard")
        withCookie(`theme=dark; ${LOCALE_COOKIE}= vi ; other=1`)
        expect(resolveRequestLocale()).toBe("vi")

        withCookie(`${LOCALE_COOKIE}=%76i`)
        expect(resolveRequestLocale()).toBe("vi")
    })

    it("falls back to English for an empty path, an absent cookie and an unshipped value", () => {
        atPath("/")
        withCookie("")
        expect(resolveRequestLocale()).toBe("en")

        atPath("/dashboard")
        withCookie("theme=dark")
        expect(resolveRequestLocale()).toBe("en")

        withCookie(`${LOCALE_COOKIE}=de`)
        expect(resolveRequestLocale()).toBe("en")
    })

    it("declares the app default when there is no browser to ask", () => {
        vi.stubGlobal("window", undefined)
        expect(resolveRequestLocale()).toBe("en")
    })
})

describe("createAttachLocaleLink", () => {
    it("attaches the locale from the injected getter", () => {
        const operation = fakeOperation("Course")
        createAttachLocaleLink({ getLocale: () => "vi" }).request(operation, forward)
        expect(localeOf(operation)).toBe("vi")
    })

    it("resolves the locale itself when no getter is injected", () => {
        atPath("/vi/courses")
        const operation = fakeOperation("Course")
        createAttachLocaleLink().request(operation, forward)
        expect(localeOf(operation)).toBe("vi")
    })

    it("keeps headers that were already on the operation", () => {
        const operation = fakeOperation("Course")
        operation.setContext({ headers: { authorization: "Bearer abc" } })
        createAttachLocaleLink({ getLocale: () => "en" }).request(operation, forward)
        const headers = operation.getContext().headers as Record<string, string>
        expect(Object.keys(headers).sort()).toEqual(["authorization", "x-locale"])
        expect(headers.authorization).toBe("Bearer abc")
        expect(localeOf(operation)).toBe("en")
    })

    it("forwards the operation downstream", () => {
        const seen: Array<ApolloLink.Result> = []
        createAttachLocaleLink({ getLocale: () => "en" })
            .request(fakeOperation("Course"), forward)
            .subscribe({ next: (value) => seen.push(value) })
        expect(seen).toEqual([{ data: {} }])
    })

    it("names an unnamed operation in the debug line, and stays quiet by default", () => {
        const log = vi.spyOn(console, "log").mockImplementation(() => {})
        createAttachLocaleLink({ getLocale: () => "vi", debug: true }).request(fakeOperation(), forward)
        expect(log).toHaveBeenCalledTimes(1)
        expect(String(log.mock.calls[0][0])).toBe("[locale] op=anonymous locale=vi")

        createAttachLocaleLink({ getLocale: () => "vi" }).request(fakeOperation("Course"), forward)
        expect(log).toHaveBeenCalledTimes(1)
    })
})
