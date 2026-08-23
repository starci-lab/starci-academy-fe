/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors"
import { setSessionToken } from "../auth/useSessionToken"
import {
    isPersonalProjectEnrollmentDenied,
    useQueryPersonalProjectTaskWorkspaceSwr,
} from "./useQueryPersonalProjectTaskWorkspaceSwr"

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
            ancillaryUnavailable: false,
        })
    })

    it("preserves the authored task when repository or grading-model discovery fails", async () => {
        mocks.repository.mockRejectedValue(new Error("repository unavailable"))
        mocks.models.mockRejectedValue(new Error("models unavailable"))
        renderHook(() => useQueryPersonalProjectTaskWorkspaceSwr("course-1", "task-1"))

        await expect(fetcher()()).resolves.toMatchObject({
            task: { id: "task-1" },
            repository: {},
            models: [],
            ancillaryUnavailable: true,
        })
    })

    it("still fails when the authored task request itself fails", async () => {
        mocks.task.mockRejectedValue(new Error("task unavailable"))
        renderHook(() => useQueryPersonalProjectTaskWorkspaceSwr("course-1", "task-1"))
        await expect(fetcher()()).rejects.toThrow("task unavailable")
    })

    it("turns a settled unenrolled contract into a stable permission denial", async () => {
        mocks.task.mockRejectedValue(new Error("transport hid the guard body"))
        mocks.repository.mockResolvedValue({ data: { courseEnrollmentStatus: { data: {
            isEnrolled: false,
            enrollment: null,
        } } } })
        renderHook(() => useQueryPersonalProjectTaskWorkspaceSwr("course-1", "task-1"))

        await expect(fetcher()()).rejects.toSatisfy(isPersonalProjectEnrollmentDenied)
    })

    it("recognizes the backend enrollment guard code without treating other failures as permission denial", () => {
        const denied = new CombinedGraphQLErrors({
            errors: [{ message: "Enrollment not found", extensions: { code: "ENROLLMENT_NOT_FOUND_EXCEPTION" } }],
        })

        expect(isPersonalProjectEnrollmentDenied(denied)).toBe(true)
        expect(isPersonalProjectEnrollmentDenied(new ServerError("Response not successful", {
            response: new Response(null, { status: 500 }),
            bodyText: JSON.stringify({
                errors: [{ message: "Enrollment not found", extensions: { code: "ENROLLMENT_NOT_FOUND_EXCEPTION" } }],
            }),
        }))).toBe(true)
        expect(isPersonalProjectEnrollmentDenied({
            bodyText: JSON.stringify({ errors: [{ extensions: { code: "ENROLLMENT_NOT_FOUND_EXCEPTION" } }] }),
        })).toBe(true)
        expect(isPersonalProjectEnrollmentDenied(new Error("task unavailable"))).toBe(false)
    })

    it("refuses a settled response without an authored task", async () => {
        mocks.task.mockResolvedValue({ data: { task: { data: null } } })
        renderHook(() => useQueryPersonalProjectTaskWorkspaceSwr("course-1", "task-1"))
        await expect(fetcher()()).rejects.toThrow("task is absent")
    })
})
