import { print } from "graphql"
import { describe, expect, it } from "vitest"
import { QueryCourse, queryCourseMap } from "./query-course"

/** The exact detail document sent to the existing backend course query. */
const documentText = print(queryCourseMap[QueryCourse.Query1])

describe("queryCourseMap", () => {
    it("selects the course-owned Playground preview contract", () => {
        expect(documentText).toContain("playgroundPreviewImageUrl")
    })

    it("selects the authored FAQ fields the course page renders", () => {
        expect(documentText).toContain("qnas")
        for (const field of ["id", "question", "answer", "orderIndex"]) {
            expect(documentText, field).toContain(field)
        }
    })

    it("keeps FAQ locale and ownership on the backend course payload", () => {
        expect(documentText).not.toContain("translations")
        expect(documentText).not.toContain("courseId")
    })
})
