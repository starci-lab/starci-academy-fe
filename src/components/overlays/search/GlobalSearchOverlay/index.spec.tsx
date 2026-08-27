/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render } from "@testing-library/react"
import type { GlobalSearchData, GlobalSearchItem } from "@/modules/api/graphql/queries/types/global-search"
import { GlobalSearchOverlay } from "."

/**
 * What these tests guard: the seven states the overlay can be in and the one thing it is for -
 * getting the reader to the canonical route of the thing they picked. A stale spinner, a detail
 * pane that says "loading" over an answer that already failed, or an Enter that opens nothing are
 * all silent: the surface still renders, it just stops being useful.
 */

type ResultView = {
    readonly id: string
    readonly title: string
    readonly snippet: string
    readonly kindLabel: string
    readonly statusLabel?: string
}
type DetailView = {
    readonly status: string
    readonly id?: string
    readonly title?: string
    readonly description?: string
    readonly kindLabel?: string
    readonly statusLabel?: string
}
type OverlayProps = {
    readonly isOpen: boolean
    readonly state: {
        readonly status: string
        readonly query: string
        readonly scopes: ReadonlyArray<{ readonly id: string, readonly count: number }>
        readonly selectedScope: string
        readonly results: ReadonlyArray<ResultView>
        readonly selectedResult?: string
        readonly isPending: boolean
        readonly detail: DetailView
    }
    readonly copy: Readonly<Record<string, string>>
    readonly on: {
        readonly queryChange: (value: string) => void
        readonly clear: () => void
        readonly scopeSelect: (key: string) => void
        readonly resultPreview: (key: string) => void
        readonly resultOpen: (key: string) => void
        readonly previous: () => void
        readonly next: () => void
        readonly submit: () => void
        readonly retry: () => void
        readonly browseCourses: () => void
        readonly dismiss?: () => void
    }
}

const mocks = vi.hoisted(() => ({
    hook: vi.fn(),
    detailHook: vi.fn(),
    push: vi.fn(),
    pure: vi.fn((props: unknown) => {
        void props
        return null
    }),
    mutate: vi.fn(),
    detailMutate: vi.fn(),
}))
vi.mock("@/hooks", () => ({
    useQueryAutocompleteGlobalSearchSwr: mocks.hook,
    useQueryGlobalSearchDetailSwr: mocks.detailHook,
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("./component", () => ({ GlobalSearchOverlayView: (props: unknown) => { mocks.pure(props); return null } }))

const empty: GlobalSearchData = { courses: [], modules: [], contents: [], challenges: [], flashcardDecks: [], milestones: [], milestoneTasks: [], foundations: [] }

const course = (overrides: Partial<GlobalSearchItem> = {}): GlobalSearchItem => ({
    id: "course-id",
    displayId: "system-design",
    title: "System",
    texts: ["snippet"],
    path: "/courses/system-design",
    ...overrides,
})

const withCourses = (...items: ReadonlyArray<GlobalSearchItem>): GlobalSearchData =>
    ({ ...empty, courses: [...items] })

/** Answer the autocomplete hook with one settled SWR shape. */
const search = (over: Partial<{ data: GlobalSearchData | undefined, error: unknown, isLoading: boolean, isValidating: boolean }> = {}) => {
    mocks.hook.mockReturnValue({
        data: empty,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mocks.mutate,
        ...over,
    })
}

/** Answer the canonical detail hook with one settled SWR shape. */
const detail = (over: Partial<{ data: unknown, error: unknown, isLoading: boolean }> = {}) => {
    mocks.detailHook.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: mocks.detailMutate,
        ...over,
    })
}

/** The props the pure overlay was last handed. */
const lastProps = () => mocks.pure.mock.calls.at(-1)?.[0] as OverlayProps

/** Open the overlay and type a settled query, so the status ladder leaves `idle`. */
const openWithQuery = (query = "system") => {
    render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} on={{ dismissed: mocks.push }} />)
    act(() => lastProps().on.queryChange(query))
    act(() => vi.advanceTimersByTime(200))
}

beforeEach(() => {
    vi.useFakeTimers()
    mocks.hook.mockReset()
    mocks.detailHook.mockReset()
    search()
    detail()
    mocks.pure.mockClear()
    mocks.push.mockClear()
    mocks.mutate.mockClear()
    mocks.detailMutate.mockClear()
})

afterEach(() => vi.useRealTimers())

describe("GlobalSearchOverlay", () => {
    it("disables the request while closed", () => {
        render(<GlobalSearchOverlay />)
        expect(mocks.hook).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false, size: 6 }))
        expect(lastProps().isOpen).toBe(false)
    })

    it("debounces query changes by 200ms", () => {
        render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} />)
        act(() => lastProps().on.queryChange("system"))
        expect(mocks.hook).toHaveBeenLastCalledWith(expect.objectContaining({ query: "" }))
        act(() => vi.advanceTimersByTime(200))
        expect(mocks.hook).toHaveBeenLastCalledWith(expect.objectContaining({ query: "system" }))
    })

    it("maps Learning to the exact backend entities", () => {
        render(<GlobalSearchOverlay intent={{ requestId: 1, source: "shortcut" }} />)
        act(() => lastProps().on.scopeSelect("learning"))
        expect(mocks.hook).toHaveBeenLastCalledWith(expect.objectContaining({ entities: ["ModuleEntity", "ContentEntity"] }))
    })

    it("requests canonical detail only after a result is selected", () => {
        search({ data: withCourses(course()) })
        render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} />)
        expect(mocks.detailHook).toHaveBeenLastCalledWith(undefined)
        act(() => lastProps().on.resultPreview("courses:course-id"))
        expect(mocks.detailHook).toHaveBeenLastCalledWith({ bucket: "courses", id: "course-id", displayId: "system-design" })
    })
})

describe("GlobalSearchOverlay status ladder", () => {
    it("rests at idle until the reader has actually typed something", () => {
        render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} />)
        expect(lastProps().state.status).toBe("idle")

        act(() => lastProps().on.queryChange("   "))
        expect(lastProps().state.status).toBe("idle")
    })

    it("reports a failed search ahead of every other answer", () => {
        search({ error: new Error("offline"), isLoading: true })
        openWithQuery()
        expect(lastProps().state.status).toBe("error")
    })

    it("separates a first load from a refresh over rows already on screen", () => {
        search({ isLoading: true, data: undefined })
        openWithQuery()
        expect(lastProps().state.status).toBe("pending-empty")
        expect(lastProps().state.isPending).toBe(true)

        search({ isValidating: true, data: withCourses(course()) })
        openWithQuery()
        expect(lastProps().state.status).toBe("pending-stale")
    })

    it("says empty for a settled search that found nothing, and ready once it did", () => {
        openWithQuery()
        expect(lastProps().state.status).toBe("empty")

        search({ data: withCourses(course()) })
        openWithQuery()
        expect(lastProps().state.status).toBe("ready")
        expect(lastProps().state.results).toHaveLength(1)
    })

    it("counts every scope from the same answer and keeps the selected one", () => {
        search({ data: withCourses(course()) })
        openWithQuery()
        expect(lastProps().state.selectedScope).toBe("all")
        expect(lastProps().state.scopes.find((scope) => scope.id === "courses")?.count).toBe(1)
        expect(lastProps().state.scopes.find((scope) => scope.id === "foundations")?.count).toBe(0)
    })
})

describe("GlobalSearchOverlay result rows", () => {
    it.each([
        [{ isEnrolled: true }, "status.enrolled"],
        [{ isFree: true }, "status.free"],
        [{ isPremium: true }, "status.premium"],
    ])("labels the reader's standing on a hit", (flags, expected) => {
        search({ data: withCourses(course(flags)) })
        openWithQuery()
        expect(lastProps().state.results[0]?.statusLabel).toBe(expected)
    })

    it("claims no standing at all for a plain hit", () => {
        search({ data: withCourses(course({ isEnrolled: false, isFree: false, isPremium: false })) })
        openWithQuery()
        expect(lastProps().state.results[0]).toMatchObject({
            statusLabel: undefined,
            kindLabel: "kinds.courses",
            snippet: "snippet",
            title: "System",
        })
    })

    it("drops a selection a revalidated answer no longer contains", () => {
        search({ data: withCourses(course()) })
        const { rerender } = render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} />)
        act(() => lastProps().on.resultPreview("courses:course-id"))
        expect(lastProps().state.selectedResult).toBe("courses:course-id")

        // The reader typed nothing; SWR simply came back with a different set of rows.
        search({ data: withCourses(course({ id: "replacement", displayId: "replacement" })) })
        act(() => rerender(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} />))
        expect(lastProps().state.selectedResult).toBeUndefined()
        expect(mocks.detailHook).toHaveBeenLastCalledWith(undefined)
    })

    it("keeps a selection the revalidated answer still contains", () => {
        search({ data: withCourses(course()) })
        const { rerender } = render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} />)
        act(() => lastProps().on.resultPreview("courses:course-id"))

        search({ data: withCourses(course(), course({ id: "second", displayId: "second" })) })
        act(() => rerender(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} />))
        expect(lastProps().state.selectedResult).toBe("courses:course-id")
    })
})

describe("GlobalSearchOverlay detail pane", () => {
    const select = () => {
        search({ data: withCourses(course({ isFree: true })) })
        openWithQuery()
        act(() => lastProps().on.resultPreview("courses:course-id"))
    }

    it("stays idle while nothing is picked", () => {
        openWithQuery()
        expect(lastProps().state.detail).toEqual({ status: "idle" })
    })

    it("reports a failed detail fetch rather than an endless pending pane", () => {
        detail({ error: new Error("offline"), isLoading: true })
        select()
        expect(lastProps().state.detail).toEqual({ status: "error", kindLabel: "kinds.courses" })
    })

    it("treats a resolved-but-absent record as an error, not as still loading", () => {
        detail({ data: null })
        select()
        expect(lastProps().state.detail).toEqual({ status: "error", kindLabel: "kinds.courses" })
    })

    it("stays pending while the canonical record is still on its way", () => {
        detail({ isLoading: true })
        select()
        expect(lastProps().state.detail).toEqual({ status: "pending", kindLabel: "kinds.courses" })
    })

    it("carries the canonical title, description and the reader's standing", () => {
        detail({ data: { id: "course-id", title: "Canonical", description: "Why it exists" } })
        select()
        expect(lastProps().state.detail).toEqual({
            status: "ready",
            id: "courses:course-id",
            title: "Canonical",
            description: "Why it exists",
            kindLabel: "kinds.courses",
            statusLabel: "status.free",
        })
    })

    it("shows a described-nowhere record without inventing a description or a standing", () => {
        detail({ data: { id: "course-id", title: "Canonical", description: null } })
        search({ data: withCourses(course()) })
        openWithQuery()
        act(() => lastProps().on.resultPreview("courses:course-id"))
        expect(lastProps().state.detail).toMatchObject({
            status: "ready",
            description: undefined,
            statusLabel: undefined,
        })
    })
})

describe("GlobalSearchOverlay navigation", () => {
    it("dismisses and routes to the canonical path of the opened hit", () => {
        const dismissed = vi.fn()
        search({ data: withCourses(course()) })
        render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} on={{ dismissed }} />)
        act(() => lastProps().on.resultOpen("courses:course-id"))
        expect(dismissed).toHaveBeenCalledTimes(1)
        expect(mocks.push).toHaveBeenCalledWith("/courses/system-design")
    })

    it("routes even when the summoner registered no dismissal of its own", () => {
        search({ data: withCourses(course()) })
        render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} />)
        act(() => lastProps().on.resultOpen("courses:course-id"))
        expect(mocks.push).toHaveBeenCalledWith("/courses/system-design")
    })

    it("goes nowhere for a hit with no route and for a key nothing matches", () => {
        search({ data: withCourses(course({ path: null }), course({ id: "other", path: undefined })) })
        render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} />)
        act(() => lastProps().on.resultOpen("courses:course-id"))
        act(() => lastProps().on.resultOpen("courses:other"))
        act(() => lastProps().on.resultOpen("courses:absent"))
        expect(mocks.push).not.toHaveBeenCalled()
    })

    it("walks the rows in both directions and wraps at either end", () => {
        search({ data: withCourses(course(), course({ id: "second", displayId: "second" })) })
        openWithQuery()
        act(() => lastProps().on.next())
        expect(lastProps().state.selectedResult).toBe("courses:second")

        act(() => lastProps().on.next())
        expect(lastProps().state.selectedResult).toBe("courses:course-id")

        act(() => lastProps().on.previous())
        expect(lastProps().state.selectedResult).toBe("courses:second")
    })

    it("has nowhere to walk when the search found nothing", () => {
        openWithQuery()
        act(() => lastProps().on.next())
        expect(lastProps().state.selectedResult).toBeUndefined()
    })

    it("submits the highlighted row and does nothing when none is", () => {
        search({ data: withCourses(course()) })
        render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} />)
        act(() => lastProps().on.submit())
        expect(mocks.push).not.toHaveBeenCalled()

        act(() => lastProps().on.resultPreview("courses:course-id"))
        act(() => lastProps().on.submit())
        expect(mocks.push).toHaveBeenCalledWith("/courses/system-design")
    })

    it("dismisses and sends an empty-handed reader to the catalogue", () => {
        const dismissed = vi.fn()
        render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} on={{ dismissed }} />)
        act(() => lastProps().on.browseCourses())
        expect(dismissed).toHaveBeenCalledTimes(1)
        expect(mocks.push).toHaveBeenCalledWith("/courses")
    })

    it("hands its own dismissal straight back to the summoner", () => {
        const dismissed = vi.fn()
        render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} on={{ dismissed }} />)
        lastProps().on.dismiss?.()
        expect(dismissed).toHaveBeenCalledTimes(1)

        render(<GlobalSearchOverlay intent={{ requestId: 2, source: "shortcut" }} />)
        expect(lastProps().on.dismiss).toBeUndefined()
    })

    it("retries the search itself, or the detail once one is picked", () => {
        search({ data: withCourses(course()) })
        render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} />)
        act(() => lastProps().on.retry())
        expect(mocks.mutate).toHaveBeenCalledTimes(1)
        expect(mocks.detailMutate).not.toHaveBeenCalled()

        act(() => lastProps().on.resultPreview("courses:course-id"))
        act(() => lastProps().on.retry())
        expect(mocks.detailMutate).toHaveBeenCalledTimes(1)
        expect(mocks.mutate).toHaveBeenCalledTimes(1)
    })

    it("clears the typed query and the row it had highlighted", () => {
        search({ data: withCourses(course()) })
        openWithQuery()
        act(() => lastProps().on.resultPreview("courses:course-id"))
        act(() => lastProps().on.clear())
        expect(lastProps().state.query).toBe("")
        expect(lastProps().state.selectedResult).toBeUndefined()
    })
})
