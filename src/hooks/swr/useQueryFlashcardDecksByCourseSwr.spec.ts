/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    QUERY_FLASHCARD_DECKS_BY_COURSE_SWR_KEY,
    QUERY_MY_DUE_FLASHCARDS_SWR_KEY,
    useQueryFlashcardDecksByCourseSwr,
    useQueryMyDueFlashcardsSwr,
} from "./useQueryFlashcardDecksByCourseSwr"

/**
 * What these tests guard: TWO reads that share a course but not a cache entry. The decks of a
 * course and what is due in them change on entirely different clocks, so a single key would let a
 * finished review wipe the deck list, or a new deck reset the due count.
 *
 * Neither reads before the course is known, and each unwraps whatever its query module hands back
 * without a second envelope of its own.
 */

const mocks = vi.hoisted(() => ({
    useSWR: vi.fn(),
    queryFlashcardDecksByCourse: vi.fn(),
    queryMyDueFlashcards: vi.fn(),
}))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-flashcard-decks-by-course", () => ({
    queryFlashcardDecksByCourse: mocks.queryFlashcardDecksByCourse,
    queryMyDueFlashcards: mocks.queryMyDueFlashcards,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One deck, trimmed to the fields the document selects. */
const decks = [{ id: "deck-1", label: "HTTP verbs", cardCount: 20 }]

/** What is due, trimmed to the fields the document selects. */
const due = { dueCount: 7, decks: ["deck-1"] }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryFlashcardDecksByCourse.mockReset().mockResolvedValue(decks)
    mocks.queryMyDueFlashcards.mockReset().mockResolvedValue(due)
})

describe("useQueryFlashcardDecksByCourseSwr", () => {
    it("reads nothing before a course is known", () => {
        renderHook(() => useQueryFlashcardDecksByCourseSwr())
        expect(keyOf()).toBeNull()
    })

    it("gives each course its own cache entry", () => {
        renderHook(() => useQueryFlashcardDecksByCourseSwr("course-1"))
        expect(keyOf()).toEqual([QUERY_FLASHCARD_DECKS_BY_COURSE_SWR_KEY, "course-1"])

        renderHook(() => useQueryFlashcardDecksByCourseSwr("course-2"))
        expect(keyOf()).toEqual([QUERY_FLASHCARD_DECKS_BY_COURSE_SWR_KEY, "course-2"])
    })

    it("passes the course to its query module and hands back what it returns", async () => {
        renderHook(() => useQueryFlashcardDecksByCourseSwr("course-1"))
        await expect(fetcherOf()()).resolves.toEqual(decks)
        expect(mocks.queryFlashcardDecksByCourse).toHaveBeenCalledWith("course-1")
    })

    it("asks for an empty course rather than the word undefined if it is ever run without one", async () => {
        renderHook(() => useQueryFlashcardDecksByCourseSwr())
        await fetcherOf()()
        expect(mocks.queryFlashcardDecksByCourse).toHaveBeenCalledWith("")
    })
})

describe("useQueryMyDueFlashcardsSwr", () => {
    it("reads nothing before a course is known", () => {
        renderHook(() => useQueryMyDueFlashcardsSwr())
        expect(keyOf()).toBeNull()
    })

    it("keeps its own cache entry, separate from the deck list on the same course", () => {
        renderHook(() => useQueryFlashcardDecksByCourseSwr("course-1"))
        const deckKey = keyOf()

        renderHook(() => useQueryMyDueFlashcardsSwr("course-1"))
        expect(keyOf()).toEqual([QUERY_MY_DUE_FLASHCARDS_SWR_KEY, "course-1"])
        expect(keyOf()).not.toEqual(deckKey)
    })

    it("passes the course to its query module and hands back what it returns", async () => {
        renderHook(() => useQueryMyDueFlashcardsSwr("course-1"))
        await expect(fetcherOf()()).resolves.toEqual(due)
        expect(mocks.queryMyDueFlashcards).toHaveBeenCalledWith("course-1")
    })

    it("asks for an empty course rather than the word undefined if it is ever run without one", async () => {
        renderHook(() => useQueryMyDueFlashcardsSwr())
        await fetcherOf()()
        expect(mocks.queryMyDueFlashcards).toHaveBeenCalledWith("")
    })
})
