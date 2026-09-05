/** @vitest-environment jsdom */
import { createElement, type PropsWithChildren } from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useQueryConceptSwr } from "./useQueryConceptSwr"

const mocks = vi.hoisted(() => ({ locale: "en", queryConcept: vi.fn() }))
vi.mock("next-intl", () => ({ useLocale: () => mocks.locale }))
vi.mock("@/modules/api/graphql/queries/query-concept", () => ({ queryConcept: mocks.queryConcept }))

const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

const concept = { displayId: "request-response-lifecycle", title: "Request lifecycle", sections: [] }

beforeEach(() => {
    mocks.locale = "en"
    mocks.queryConcept.mockReset()
    mocks.queryConcept.mockResolvedValue({ data: { concept: { success: true, message: "ok", data: concept } } })
})

describe("useQueryConceptSwr", () => {
    it("returns a successful concept and sends its routed display id", async () => {
        const { result } = renderHook(() => useQueryConceptSwr(concept.displayId), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(concept))
        expect(mocks.queryConcept).toHaveBeenCalledWith({ request: { displayId: concept.displayId } })
    })

    it("keeps a successful null payload as a missing concept rather than a transport failure", async () => {
        mocks.queryConcept.mockResolvedValue({ data: { concept: { success: true, message: "not found", data: null } } })
        const { result } = renderHook(() => useQueryConceptSwr("absent"), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("fetches a fresh localized document when the locale changes", async () => {
        mocks.queryConcept.mockImplementation(async () => ({
            data: { concept: { success: true, message: "ok", data: { ...concept, title: mocks.locale } } },
        }))
        const hook = renderHook(() => useQueryConceptSwr(concept.displayId), { wrapper })
        await waitFor(() => expect(hook.result.current.data?.title).toBe("en"))
        mocks.locale = "vi"
        hook.rerender()
        await waitFor(() => expect(hook.result.current.data?.title).toBe("vi"))
        expect(mocks.queryConcept).toHaveBeenCalledTimes(2)
    })

    it("surfaces a rejected envelope as a request error", async () => {
        mocks.queryConcept.mockResolvedValue({ data: { concept: { success: false, message: "denied", error: "FORBIDDEN" } } })
        const { result } = renderHook(() => useQueryConceptSwr(concept.displayId), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })
})
