/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_MODULE_SWR_KEY, useQueryModuleSwr } from "./useQueryModuleSwr"

/**
 * What these tests guard: a module carries the asking learner's progress through it, so the key
 * names both the module and the viewer - a shared entry would show one reader another's completed
 * lessons.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryModule: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-module", () => ({ queryModule: mocks.queryModule }))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One module, trimmed to the fields the document selects. */
const module = { id: "module-1", label: "Caching", completionPercent: 40 }

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryModule.mockReset()
    mocks.queryModule.mockResolvedValue({
        data: { module: { success: true, message: "ok", data: module } },
    })
})

describe("useQueryModuleSwr", () => {
    it("holds the key null until both the module and the viewer are known", () => {
        renderHook(() => useQueryModuleSwr())
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryModuleSwr({ id: "module-1" }))
        expect(keyOf()).toBeNull()
    })

    it("names the module and the viewer in the key", () => {
        const hook = renderHook(() => useQueryModuleSwr({ id: "module-1" }))
        const resting = keyOf()
        expect(resting).toEqual([QUERY_MODULE_SWR_KEY, "module-1", expect.any(String)])

        renderHook(() => useQueryModuleSwr({ id: "module-2" }))
        expect(keyOf()).not.toEqual(resting)

        hook.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(resting)
    })

    it("sends the module id and hands back the module, not the envelope", async () => {
        renderHook(() => useQueryModuleSwr({ id: "module-1" }))
        await expect(fetcherOf()()).resolves.toEqual(module)
        expect(mocks.queryModule).toHaveBeenCalledWith({ request: { id: "module-1" } })
    })

    it("resolves to null for a module the server does not know", async () => {
        mocks.queryModule.mockResolvedValue({
            data: { module: { success: false, message: "not found", error: "NOT_FOUND" } },
        })
        renderHook(() => useQueryModuleSwr({ id: "module-1" }))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryModule.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryModuleSwr({ id: "module-1" }))
        await expect(fetcherOf()()).resolves.toBeNull()
    })
})
