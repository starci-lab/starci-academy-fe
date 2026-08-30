import { print } from "graphql"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    mutateSubmitPersonalTaskAttempt,
    mutateSyncPersonalProjectGithub,
    queryCoursePersonalProject,
    queryPersonalProjectGradingModels,
    queryPersonalProjectRepository,
    queryPersonalProjectTask,
    queryPersonalTaskAttemptFeedbacks,
    queryPersonalTaskAttempts,
} from "./query-course-personal-project"

const mocks = vi.hoisted(() => ({
    createApolloClient: vi.fn(),
    mutate: vi.fn(),
    query: vi.fn(),
    queryCourse: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({
    createApolloClient: mocks.createApolloClient,
}))

vi.mock("./query-course", () => ({
    queryCourse: mocks.queryCourse,
}))

beforeEach(() => {
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ query: mocks.query, mutate: mocks.mutate })
    mocks.query.mockReset()
    mocks.query.mockResolvedValue({ data: undefined })
    mocks.mutate.mockReset()
    mocks.mutate.mockResolvedValue({ data: undefined })
    mocks.queryCourse.mockReset()
    mocks.queryCourse.mockResolvedValue({ data: { course: { data: { id: "course-1" } } } })
})

describe("personal-project workspace transport", () => {
    it("reads authored task, enrollment repository and live grading models", async () => {
        await queryPersonalProjectTask("task-1", "course-1")
        await queryPersonalProjectRepository("course-1")
        await queryPersonalProjectGradingModels()

        expect(print(mocks.query.mock.calls[0][0].query)).toContain("query PersonalProjectTask")
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: { id: "task-1" } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith(expect.objectContaining({
            headers: { "X-Course-Id": "course-1" },
        }))
        expect(print(mocks.query.mock.calls[1][0].query)).toContain("personalProjectGithubTokenLast4")
        expect(mocks.query.mock.calls[1][0].variables).toEqual({ request: { courseId: "course-1" } })
        expect(print(mocks.query.mock.calls[2][0].query)).toContain("gradableModels")
    })

    it("syncs only the repository settings named by the caller", async () => {
        const request = { courseId: "course-1", branch: "main", githubToken: "secret" }
        await mutateSyncPersonalProjectGithub(request)
        const document = print(mocks.mutate.mock.calls[0][0].mutation)
        expect(document).toContain("syncPersonalProjectGithub")
        expect(document).not.toMatch(/syncPersonalProjectGithub[\s\S]*\bdata\b/u)
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request })
    })
})

describe("queryCoursePersonalProject", () => {
    it("resolves a display id and sends the backend-proven outline request", async () => {
        await queryCoursePersonalProject("frontend-mastery")

        expect(mocks.queryCourse).toHaveBeenCalledWith({
            request: { displayId: "frontend-mastery" },
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        const operation = mocks.query.mock.calls[0][0]
        expect(print(operation.query)).toContain("query CoursePersonalProject")
        expect(print(operation.query)).toContain("myCourseOutline")
        expect(print(operation.query)).toContain("numAttempts")
        expect(operation.variables).toEqual({ request: { courseId: "course-1" } })
    })

    it("does not invent an outline request when the course cannot be resolved", async () => {
        mocks.queryCourse.mockResolvedValue({ data: { course: { data: null } } })

        await expect(queryCoursePersonalProject("missing-course")).resolves.toBeNull()
        expect(mocks.createApolloClient).not.toHaveBeenCalled()
    })
})

describe("personal-project attempt transport", () => {
    it("sends newest-first attempts and authored-order feedback filters unchanged", async () => {
        const attemptsRequest = {
            courseId: "course-1",
            taskId: "task-1",
            filters: {
                pageNumber: 0,
                limit: 20,
                sorts: [{ by: "attemptNumber" as const, order: "DESC" as const }],
            },
        }
        const feedbackRequest = {
            attemptId: "attempt-1",
            filters: {
                pageNumber: 0,
                limit: 100,
                sorts: [{ by: "sortIndex" as const, order: "ASC" as const }],
            },
        }

        await queryPersonalTaskAttempts(attemptsRequest)
        await queryPersonalTaskAttemptFeedbacks(feedbackRequest)

        expect(print(mocks.query.mock.calls[0][0].query)).toContain("query PersonalTaskAttempts")
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: attemptsRequest })
        expect(print(mocks.query.mock.calls[1][0].query)).toContain("query PersonalTaskAttemptFeedbacks")
        expect(mocks.query.mock.calls[1][0].variables).toEqual({ request: feedbackRequest })
    })

    it("uses reviewPersonalProjectTask and returns the Apollo mutation unchanged", async () => {
        const response = {
            data: {
                reviewPersonalProjectTask: {
                    success: true,
                    message: "Queued",
                    data: { jobId: "job-1" },
                },
            },
        }
        mocks.mutate.mockResolvedValue(response)

        await expect(mutateSubmitPersonalTaskAttempt({ courseId: "course-1", taskId: "task-1" }))
            .resolves.toBe(response)
        expect(print(mocks.mutate.mock.calls[0][0].mutation)).toContain("mutation SubmitPersonalTaskAttempt")
        expect(print(mocks.mutate.mock.calls[0][0].mutation)).toContain("reviewPersonalProjectTask")
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: { courseId: "course-1", taskId: "task-1" },
        })
    })
})
