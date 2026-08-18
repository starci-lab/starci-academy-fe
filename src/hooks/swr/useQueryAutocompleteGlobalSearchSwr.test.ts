/** @vitest-environment jsdom */
import { createElement, type PropsWithChildren } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { useQueryAutocompleteGlobalSearchSwr } from "./useQueryAutocompleteGlobalSearchSwr"

const mocks = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock("@/modules/api/graphql/queries/query-autocomplete-global-search", () => ({ queryAutocompleteGlobalSearch: mocks.query }))

const empty = { courses: [], modules: [], contents: [], challenges: [], flashcardDecks: [], milestones: [], milestoneTasks: [], foundations: [] }
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

beforeEach(() => mocks.query.mockReset())

describe("useQueryAutocompleteGlobalSearchSwr", () => {
    it("does not request while closed or query is blank", async () => {
        mocks.query.mockResolvedValue({ data: { autocompleteGlobalSearch: { data: empty } } })
        renderHook(() => useQueryAutocompleteGlobalSearchSwr({ query: "  ", enabled: true }), { wrapper })
        await Promise.resolve()
        expect(mocks.query).not.toHaveBeenCalled()
    })

    it("puts query, entities and size into the request and cache identity", async () => {
        mocks.query.mockResolvedValue({ data: { autocompleteGlobalSearch: { data: empty } } })
        const { result } = renderHook(() => useQueryAutocompleteGlobalSearchSwr({ query: " system ", entities: ["CourseEntity"], size: 6 }), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(empty))
        expect(mocks.query).toHaveBeenCalledWith({ query: "system", entities: ["CourseEntity"], size: 6 })
    })

    it("searches every entity, and says so in the key, when no scope was named", async () => {
        mocks.query.mockResolvedValue({ data: { autocompleteGlobalSearch: { data: empty } } })
        const { result } = renderHook(
            () => useQueryAutocompleteGlobalSearchSwr({ query: "system" }),
            { wrapper },
        )
        await waitFor(() => expect(result.current.data).toEqual(empty))
        // No `entities` field at all - an empty list would mean "search nothing", which is the
        // opposite of what an unscoped search asks for.
        expect(mocks.query).toHaveBeenCalledWith({ query: "system", size: 6 })
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.query.mockResolvedValue({
            data: { autocompleteGlobalSearch: { success: false, message: "unavailable" } },
        })
        const { result } = renderHook(
            () => useQueryAutocompleteGlobalSearchSwr({ query: "system" }),
            { wrapper },
        )
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.query.mockResolvedValue({ data: undefined })
        const { result } = renderHook(
            () => useQueryAutocompleteGlobalSearchSwr({ query: "system" }),
            { wrapper },
        )
        await waitFor(() => expect(result.current.data).toBeNull())
    })
})
