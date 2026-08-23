import { act, render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestInput = { blockState: string; on: { search: (query: string) => void; select: (id: string) => void; openContent: (id: string) => void; retry: () => void } }
const mocks = vi.hoisted(() => ({ input: undefined as TestInput | undefined, graph: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() }, push: vi.fn() }))

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryCourseMindMapSwr", () => ({ useQueryCourseMindMapSwr: () => mocks.graph }))
vi.mock("./component", () => ({ CourseMindMapBase: (input: TestInput) => { mocks.input = input; return <output data-testid="mind-map" /> } }))

import { CourseMindMapBlock } from "./index"

beforeEach(() => { vi.clearAllMocks(); mocks.input = undefined; mocks.graph.data = undefined; mocks.graph.error = undefined })

describe("CourseMindMapBlock", () => {
    it("maps graph states, search and navigable nodes", () => {
        const view = render(<CourseMindMapBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("pending")
        mocks.graph.error = new Error("offline")
        view.rerender(<CourseMindMapBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("failed")
        mocks.graph.error = undefined
        mocks.graph.data = { nodes: [], edges: [] }
        view.rerender(<CourseMindMapBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("empty")
        mocks.graph.data = { nodes: [{ id: "lesson", position: { x: 1, y: 2 }, data: { label: "Lesson", desc: "Detail", kind: "lesson", entityId: "content", moduleId: "module", links: [] } }], edges: [] }
        view.rerender(<CourseMindMapBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("ready")
        act(() => { mocks.input?.on.search("lesson"); mocks.input?.on.select("lesson"); mocks.input?.on.openContent("lesson"); mocks.input?.on.retry() })
        expect(mocks.push).toHaveBeenCalledWith("/courses/course/learn/content/modules/module/contents/content")
        expect(mocks.graph.mutate).toHaveBeenCalled()
    })
})
