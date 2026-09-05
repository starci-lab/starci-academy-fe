/** @vitest-environment jsdom */
import { createElement, type PropsWithChildren } from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useQueryConceptsSwr } from "./useQueryConceptsSwr"

const mocks = vi.hoisted(() => ({ locale: "en", queryConcepts: vi.fn() }))
vi.mock("next-intl", () => ({ useLocale: () => mocks.locale }))
vi.mock("@/modules/api/graphql/queries/query-concepts", () => ({ queryConcepts: mocks.queryConcepts }))

const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

beforeEach(() => {
    mocks.locale = "en"
    mocks.queryConcepts.mockReset()
    mocks.queryConcepts.mockImplementation(async () => ({
        data: { concepts: { success: true, message: "ok", data: [{ displayId: "one", title: mocks.locale }] } },
    }))
})

describe("useQueryConceptsSwr", () => {
    it("preserves an empty successful catalog", async () => {
        mocks.queryConcepts.mockResolvedValue({ data: { concepts: { success: true, message: "ok", data: [] } } })
        const { result } = renderHook(() => useQueryConceptsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(result.current.error).toBeUndefined()
    })

    it("isolates the server-localized catalog by locale", async () => {
        const hook = renderHook(() => useQueryConceptsSwr(), { wrapper })
        await waitFor(() => expect(hook.result.current.data?.[0]?.title).toBe("en"))
        mocks.locale = "vi"
        hook.rerender()
        await waitFor(() => expect(hook.result.current.data?.[0]?.title).toBe("vi"))
        expect(mocks.queryConcepts).toHaveBeenCalledTimes(2)
    })

    it("does not turn a rejected envelope into an empty catalog", async () => {
        mocks.queryConcepts.mockResolvedValue({ data: { concepts: { success: false, message: "failed", error: "OFFLINE" } } })
        const { result } = renderHook(() => useQueryConceptsSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })
})
