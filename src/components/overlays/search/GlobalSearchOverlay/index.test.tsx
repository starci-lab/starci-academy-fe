/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render } from "@testing-library/react"
import { GlobalSearchOverlay } from "."

const mocks = vi.hoisted(() => ({
    hook: vi.fn(),
    detailHook: vi.fn(),
    push: vi.fn(),
    pure: vi.fn((props: unknown) => {
        void props
        return null
    }),
    mutate: vi.fn(),
}))
vi.mock("@/hooks", () => ({
    useQueryAutocompleteGlobalSearchSwr: mocks.hook,
    useQueryGlobalSearchDetailSwr: mocks.detailHook,
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("./component", () => ({ _GlobalSearchOverlay: (props: unknown) => { mocks.pure(props); return null } }))

const empty = { courses: [], modules: [], contents: [], challenges: [], flashcardDecks: [], milestones: [], milestoneTasks: [], foundations: [] }

beforeEach(() => {
    vi.useFakeTimers()
    mocks.hook.mockReset().mockReturnValue({ data: empty, error: undefined, isLoading: false, isValidating: false, mutate: mocks.mutate })
    mocks.detailHook.mockReset().mockReturnValue({ data: undefined, error: undefined, isLoading: false, mutate: mocks.mutate })
    mocks.pure.mockClear()
    mocks.push.mockClear()
})

afterEach(() => vi.useRealTimers())

describe("GlobalSearchOverlay", () => {
    it("disables the request while closed", () => {
        render(<GlobalSearchOverlay />)
        expect(mocks.hook).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false, size: 6 }))
    })

    it("debounces query changes by 200ms", () => {
        render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} />)
        const props = mocks.pure.mock.calls.at(-1)?.[0] as { on: { queryChange: (value: string) => void } }
        act(() => props.on.queryChange("system"))
        expect(mocks.hook).toHaveBeenLastCalledWith(expect.objectContaining({ query: "" }))
        act(() => vi.advanceTimersByTime(200))
        expect(mocks.hook).toHaveBeenLastCalledWith(expect.objectContaining({ query: "system" }))
    })

    it("maps Learning to the exact backend entities", () => {
        render(<GlobalSearchOverlay intent={{ requestId: 1, source: "shortcut" }} />)
        const props = mocks.pure.mock.calls.at(-1)?.[0] as { on: { scopeSelect: (key: string) => void } }
        act(() => props.on.scopeSelect("learning"))
        expect(mocks.hook).toHaveBeenLastCalledWith(expect.objectContaining({ entities: ["ModuleEntity", "ContentEntity"] }))
    })

    it("requests canonical detail only after a result is selected", () => {
        mocks.hook.mockReturnValue({
            data: { ...empty, courses: [{ id: "course-id", displayId: "system-design", title: "System", texts: ["snippet"], path: "/courses/system-design" }] },
            error: undefined, isLoading: false, isValidating: false, mutate: mocks.mutate,
        })
        render(<GlobalSearchOverlay intent={{ requestId: 1, source: "navbar" }} />)
        expect(mocks.detailHook).toHaveBeenLastCalledWith(undefined)
        const props = mocks.pure.mock.calls.at(-1)?.[0] as { on: { resultPreview: (key: string) => void } }
        act(() => props.on.resultPreview("courses:course-id"))
        expect(mocks.detailHook).toHaveBeenLastCalledWith({ bucket: "courses", id: "course-id", displayId: "system-design" })
    })
})
