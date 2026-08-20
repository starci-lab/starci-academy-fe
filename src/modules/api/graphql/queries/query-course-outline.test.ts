import { print } from "graphql"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { queryCourseOutline } from "./query-course-outline"

const mocks = vi.hoisted(() => ({
    createApolloClient: vi.fn(),
    query: vi.fn(),
    queryCourse: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))
vi.mock("./query-course", () => ({ queryCourse: mocks.queryCourse }))

beforeEach(() => {
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
    mocks.query.mockReset().mockResolvedValue({ data: { myCourseOutline: { data: null } } })
    mocks.queryCourse.mockReset().mockResolvedValue({ data: { course: { data: { id: "course-1" } } } })
})

describe("queryCourseOutline", () => {
    it("resolves the route display id before sending the private outline request", async () => {
        await queryCourseOutline("system-design-mastery")

        expect(mocks.queryCourse).toHaveBeenCalledWith({ request: { displayId: "system-design-mastery" } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        const operation = mocks.query.mock.calls[0][0]
        expect(operation.variables).toEqual({ request: { courseId: "course-1" } })
        expect(print(operation.query)).toContain("query CourseOutline")
        expect(print(operation.query)).toContain("nextContentTask")
        expect(print(operation.query)).toContain("numAttempts")
    })

    it("does not invent an outline request when the course cannot be resolved", async () => {
        mocks.queryCourse.mockResolvedValue({ data: { course: { data: null } } })

        await expect(queryCourseOutline("missing-course")).resolves.toBeNull()
        expect(mocks.createApolloClient).not.toHaveBeenCalled()
    })
})
