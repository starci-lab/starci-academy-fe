/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    QUERY_MY_FLASHCARD_STATS_SWR_KEY,
    useQueryMyFlashcardStatsSwr,
} from "./useQueryMyFlashcardStatsSwr"

/**
 * What these tests guard: the ENABLED switch, which is the whole of this hook's logic. A panel that
 * is closed must read nothing at all rather than read and hide the answer, and the query module is
 * handed to SWR as the fetcher itself rather than wrapped - so there is nothing between the switch
 * and the request.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryMyFlashcardStats: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-my-flashcard-stats", () => ({
    queryMyFlashcardStats: mocks.queryMyFlashcardStats,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[1]

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryMyFlashcardStats.mockReset()
})

describe("useQueryMyFlashcardStatsSwr", () => {
    it("reads by default, because the panel that uses it is usually open", () => {
        renderHook(() => useQueryMyFlashcardStatsSwr())
        expect(keyOf()).toBe(QUERY_MY_FLASHCARD_STATS_SWR_KEY)
    })

    it("reads nothing at all while the caller has switched it off", () => {
        renderHook(() => useQueryMyFlashcardStatsSwr(false))
        expect(keyOf()).toBeNull()
    })

    it("hands the query module straight to SWR, with nothing wrapped around it", () => {
        renderHook(() => useQueryMyFlashcardStatsSwr(true))
        expect(fetcherOf()).toBe(mocks.queryMyFlashcardStats)
    })
})
