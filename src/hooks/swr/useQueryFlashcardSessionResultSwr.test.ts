/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    QUERY_FLASHCARD_SESSION_RESULT_SWR_KEY,
    useQueryFlashcardSessionResultSwr,
} from "./useQueryFlashcardSessionResultSwr"

/**
 * What these tests guard: the MODE is part of the identity, not decoration. The same session id
 * read in two modes is two different results, so both are in the key and both travel to the query
 * module - and neither half alone is enough to read anything.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryFlashcardSessionResult: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-flashcard-session-result", () => ({
    queryFlashcardSessionResult: mocks.queryFlashcardSessionResult,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One result, trimmed to the fields the document selects. */
const result = { correct: 18, total: 20 }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryFlashcardSessionResult.mockReset().mockResolvedValue(result)
})

describe("useQueryFlashcardSessionResultSwr", () => {
    it("reads nothing until both the mode and the session are known", () => {
        renderHook(() => useQueryFlashcardSessionResultSwr())
        expect(keyOf()).toBeNull()

        renderHook(() => useQueryFlashcardSessionResultSwr("review"))
        expect(keyOf()).toBeNull()

        renderHook(() => useQueryFlashcardSessionResultSwr(undefined, "session-1"))
        expect(keyOf()).toBeNull()
    })

    it("gives each mode and each session its own cache entry", () => {
        renderHook(() => useQueryFlashcardSessionResultSwr("review", "session-1"))
        expect(keyOf()).toEqual([QUERY_FLASHCARD_SESSION_RESULT_SWR_KEY, "review", "session-1"])

        renderHook(() => useQueryFlashcardSessionResultSwr("quiz", "session-1"))
        expect(keyOf()).toEqual([QUERY_FLASHCARD_SESSION_RESULT_SWR_KEY, "quiz", "session-1"])
    })

    it("passes both halves to the query module and hands back what it returns", async () => {
        renderHook(() => useQueryFlashcardSessionResultSwr("review", "session-1"))
        await expect(fetcherOf()()).resolves.toEqual(result)
        expect(mocks.queryFlashcardSessionResult).toHaveBeenCalledWith("review", "session-1")
    })

    it("asks for an empty session rather than the word undefined if it is ever run without one", async () => {
        renderHook(() => useQueryFlashcardSessionResultSwr("review"))
        await fetcherOf()()
        expect(mocks.queryFlashcardSessionResult).toHaveBeenCalledWith("review", "")
    })
})
