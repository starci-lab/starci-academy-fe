/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useMutateSyncPersonalProjectGithubSwr } from "./useMutateSyncPersonalProjectGithubSwr"

const mocks = vi.hoisted(() => ({ useSWRMutation: vi.fn(), sync: vi.fn() }))
vi.mock("swr/mutation", () => ({ default: mocks.useSWRMutation }))
vi.mock("@/modules/api/graphql/queries/query-course-personal-project", () => ({
    mutateSyncPersonalProjectGithub: mocks.sync,
}))

describe("useMutateSyncPersonalProjectGithubSwr", () => {
    beforeEach(() => {
        mocks.useSWRMutation.mockReset()
        mocks.sync.mockReset()
    })

    it("returns true only for a successful repository-settings acknowledgement", async () => {
        mocks.sync.mockResolvedValue({ data: { syncPersonalProjectGithub: { success: true } } })
        renderHook(() => useMutateSyncPersonalProjectGithubSwr())
        const mutation = mocks.useSWRMutation.mock.calls[0][1] as (key: string, input: { arg: unknown }) => Promise<unknown>
        await expect(mutation("key", { arg: { courseId: "course-1", branch: "main" } })).resolves.toBe(true)
    })

    it("surfaces a rejected backend acknowledgement", async () => {
        mocks.sync.mockResolvedValue({ data: { syncPersonalProjectGithub: { success: false, message: "Denied" } } })
        renderHook(() => useMutateSyncPersonalProjectGithubSwr())
        const mutation = mocks.useSWRMutation.mock.calls[0][1] as (key: string, input: { arg: unknown }) => Promise<unknown>
        await expect(mutation("key", { arg: { courseId: "course-1" } })).rejects.toThrow("Denied")
    })
})
