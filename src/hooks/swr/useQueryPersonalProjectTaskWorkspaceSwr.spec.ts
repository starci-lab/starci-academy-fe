/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { useQueryPersonalProjectTaskWorkspaceSwr } from "./useQueryPersonalProjectTaskWorkspaceSwr"

const mocks = vi.hoisted(() => ({
    useSWR: vi.fn(),
    task: vi.fn(),
    repository: vi.fn(),
    models: vi.fn(),
}))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-course-personal-project", () => ({
    queryPersonalProjectTask: mocks.task,
    queryPersonalProjectRepository: mocks.repository,
    queryPersonalProjectGradingModels: mocks.models,
}))

const fetcher = () => mocks.useSWR.mock.calls.at(-1)?.[1] as () => Promise<unknown>

describe("useQueryPersonalProjectTaskWorkspaceSwr", () => {
    beforeEach(() => {
        setSessionToken("viewer")
        mocks.useSWR.mockReset()
        mocks.task.mockResolvedValue({ data: { task: { data: { id: "task-1" } } } })
        mocks.repository.mockResolvedValue({ data: { courseEnrollmentStatus: { data: { enrollment: {
            personalProjectGithubUrl: "https://github.com/starci/shop",
            personalProjectGithubBranch: "main",
            personalProjectGithubTokenLast4: "1234",
        } } } } })
        mocks.models.mockResolvedValue({ data: { aiModels: { data: { gradableModels: [
            { model: "review-pro", provider: "openai", supportedTasks: ["grading"] },
            { model: "chat-only", provider: "openai", supportedTasks: ["chatting"] },
        ] } } } })
    })

    it("waits for course, task and viewer identities", () => {
        renderHook(() => useQueryPersonalProjectTaskWorkspaceSwr())
        expect(mocks.useSWR.mock.calls.at(-1)?.[0]).toBeNull()
    })

    it("joins authored task, masked repository settings and grading-only models", async () => {
        renderHook(() => useQueryPersonalProjectTaskWorkspaceSwr("course-1", "task-1"))
        await expect(fetcher()()).resolves.toMatchObject({
            task: { id: "task-1" },
            repository: { branch: "main", tokenLast4: "1234" },
            models: [{ model: "review-pro" }],
        })
    })

    it("refuses a settled response without an authored task", async () => {
        mocks.task.mockResolvedValue({ data: { task: { data: null } } })
        renderHook(() => useQueryPersonalProjectTaskWorkspaceSwr("course-1", "task-1"))
        await expect(fetcher()()).rejects.toThrow("task is absent")
    })
})
