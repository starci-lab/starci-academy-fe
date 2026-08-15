/** @vitest-environment jsdom */
import { createElement, type PropsWithChildren } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { useQueryGlobalSearchDetailSwr } from "./useQueryGlobalSearchDetailSwr"

const mocks = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock("@/modules/api/graphql/queries/query-global-search-detail", () => ({ queryGlobalSearchDetail: mocks.query }))

const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

beforeEach(() => mocks.query.mockReset())

describe("useQueryGlobalSearchDetailSwr", () => {
    it("does not request before a result is selected", async () => {
        renderHook(() => useQueryGlobalSearchDetailSwr(), { wrapper })
        await Promise.resolve()
        expect(mocks.query).not.toHaveBeenCalled()
    })

    it("requests the selected bucket identity", async () => {
        const request = { bucket: "courses" as const, id: "one", displayId: "course-one" }
        mocks.query.mockResolvedValue({ id: "one", title: "One", description: "Detail" })
        const { result } = renderHook(() => useQueryGlobalSearchDetailSwr(request), { wrapper })
        await waitFor(() => expect(result.current.data?.title).toBe("One"))
        expect(mocks.query).toHaveBeenCalledWith(request)
    })
})

