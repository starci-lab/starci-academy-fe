import { describe, expect, it } from "vitest"
import { type MyCourseRow, type QueryMyCoursesResponse } from "./my-courses"

/**
 * What these tests guard: the payload is a LIST under the envelope, not a paginated window
 * beside it. `courses` and `myCourses` look alike and are not - one answers with `{ count,
 * data }` and the other with a bare array - and a reader that assumed the wrong one would
 * compile happily and render nothing.
 */

/** One row, spelled exactly as the back end spells it. */
const row: MyCourseRow = {
    globalId: "course-1",
    label: "Systems Design",
    completionPercent: 40,
}

describe("QueryMyCoursesResponse", () => {
    it("nests a bare array of rows under the standard envelope", () => {
        const response: QueryMyCoursesResponse = {
            myCourses: { success: true, message: "ok", data: [row] },
        }
        expect(response.myCourses.data?.[0].globalId).toBe("course-1")
        expect(Array.isArray(response.myCourses.data)).toBe(true)
    })

    it("describes an enrolment in nothing as an empty array, not as a missing payload", () => {
        const response: QueryMyCoursesResponse = {
            myCourses: { success: true, message: "ok", data: [] },
        }
        expect(response.myCourses.data).toEqual([])
        expect(response.myCourses.data).not.toBeUndefined()
    })

    it("describes a failure with no payload at all", () => {
        const response: QueryMyCoursesResponse = {
            myCourses: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" },
        }
        expect(response.myCourses.data).toBeUndefined()
    })
})

describe("MyCourseRow", () => {
    it("carries exactly the three fields the document selects", () => {
        expect(Object.keys(row)).toEqual(["globalId", "label", "completionPercent"])
    })

    it("keeps completion a number, because the block clamps it arithmetically", () => {
        expect(typeof row.completionPercent).toBe("number")
    })
})
