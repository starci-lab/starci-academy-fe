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

})
