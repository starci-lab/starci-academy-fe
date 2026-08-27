/** @vitest-environment jsdom */
import { act, cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { CourseFoundationsBlockProps as CourseFoundationsProps } from "./component"

const mocks = vi.hoisted(() => ({
    input: undefined as CourseFoundationsProps | undefined,
    categoriesData: {
        data: [{ id: "category-1", title: "Containers", description: "Runtime basics", thumbnailUrl: null }],
        totalCount: 1,
    } as { data: Array<{ id: string; title: string; description: string | null; thumbnailUrl: string | null }>; totalCount: number } | null | undefined,
    push: vi.fn(),
    mutate: vi.fn(),
    queryArguments: vi.fn(),
}))
const storage = new Map<string, string>()

Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
        clear: () => storage.clear(),
        key: (index: number) => [...storage.keys()][index] ?? null,
        get length() { return storage.size },
    },
})

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => ({ data: { isEnrolled: true } }) }))
vi.mock("@/hooks/swr/useQueryFoundationCategoriesSwr", () => ({
    useQueryFoundationCategoriesSwr: (arguments_: unknown) => {
        mocks.queryArguments(arguments_)
        return { data: mocks.categoriesData, error: undefined, isValidating: false, mutate: mocks.mutate }
    },
}))
vi.mock("./component", () => ({
    CourseFoundationsBlockBase: (props: CourseFoundationsProps) => {
        mocks.input = props
        return <output data-testid="foundations-base" />
    },
}))

import { CourseFoundationsBlock } from "./index"

beforeEach(() => {
    window.localStorage.clear()
    mocks.input = undefined
    mocks.categoriesData = {
        data: [{ id: "category-1", title: "Containers", description: "Runtime basics", thumbnailUrl: null }],
        totalCount: 1,
    }
    mocks.push.mockClear()
    mocks.mutate.mockClear()
    mocks.queryArguments.mockClear()
})
afterEach(cleanup)

describe("CourseFoundationsBlock", () => {
    it("defaults to grid, persists list, and restores the reader's category layout", async () => {
        const { unmount } = render(<CourseFoundationsBlock displayId="fullstack-mastery" />)
        expect(mocks.input?.props.layout).toBe("grid")

        act(() => { mocks.input?.on?.changeLayout?.("line") })
        await waitFor(() => expect(mocks.input?.props.layout).toBe("line"))
        expect(window.localStorage.getItem("starci.foundations.view")).toBe("line")

        unmount()
        mocks.input = undefined
        render(<CourseFoundationsBlock displayId="fullstack-mastery" />)
        await waitFor(() => expect(mocks.input?.props.layout).toBe("line"))
    })

    it("keeps presentation state out of the server category query", () => {
        render(<CourseFoundationsBlock displayId="fullstack-mastery" />)
        act(() => { mocks.input?.on?.changeLayout?.("line") })

        expect(mocks.queryArguments).toHaveBeenLastCalledWith({ search: "", pageNumber: 1, limit: 10 })
    })

    it("treats a declined category response as failed instead of empty", () => {
        mocks.categoriesData = null
        render(<CourseFoundationsBlock displayId="fullstack-mastery" />)
        expect(mocks.input?.state).toBe("failed")
    })
})
