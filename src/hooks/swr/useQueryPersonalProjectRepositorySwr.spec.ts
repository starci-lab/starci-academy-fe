/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_PERSONAL_PROJECT_REPOSITORY_SWR_KEY,
    useQueryPersonalProjectRepositorySwr,
} from "./useQueryPersonalProjectRepositorySwr"

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), repository: vi.fn() }))
vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-course-personal-project", () => ({
    queryPersonalProjectRepository: mocks.repository,
}))

const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]
const fetcherOf = () => mocks.useSWR.mock.calls.at(-1)?.[1] as () => Promise<unknown>

describe("useQueryPersonalProjectRepositorySwr", () => {
    beforeEach(() => {
        setSessionToken("viewer")
        mocks.useSWR.mockReset()
        mocks.repository.mockReset().mockResolvedValue({ data: { courseEnrollmentStatus: { data: {
            isEnrolled: true,
            enrollment: {
                personalProjectGithubUrl: "https://github.com/starci/shop",
                personalProjectGithubBranch: "main",
                personalProjectGithubTokenLast4: "1234",
            },
        } } } })
    })

    it("waits for both viewer and course identity", () => {
        renderHook(() => useQueryPersonalProjectRepositorySwr())
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryPersonalProjectRepositorySwr("course-1"))
        expect(keyOf()).toBeNull()
    })

    it("keys and returns the enrollment-owned repository settings", async () => {
        renderHook(() => useQueryPersonalProjectRepositorySwr("course-1"))
        expect(keyOf()).toEqual([QUERY_PERSONAL_PROJECT_REPOSITORY_SWR_KEY, expect.any(String), "course-1"])
        await expect(fetcherOf()()).resolves.toEqual({
            githubUrl: "https://github.com/starci/shop",
            branch: "main",
            tokenLast4: "1234",
        })
        expect(mocks.repository).toHaveBeenCalledWith("course-1")
    })

    it("returns no settings when the viewer is not enrolled", async () => {
        mocks.repository.mockResolvedValue({ data: { courseEnrollmentStatus: { data: { isEnrolled: false, enrollment: null } } } })
        renderHook(() => useQueryPersonalProjectRepositorySwr("course-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })
})
