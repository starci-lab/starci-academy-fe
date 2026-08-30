import { describe, expect, it } from "vitest"
import { parseCourseAdvisorResponse } from "./course-advisor-response"

describe("parseCourseAdvisorResponse", () => {
    it("restores visible copy and bounded recommendation evidence from history", () => {
        const parsed = parseCourseAdvisorResponse("Fullstack Mastery fits your goal.\n<!--starci-course-advisor:{\"intent\":\"recommend\",\"clarificationQuestion\":null,\"recommendations\":[{\"courseDisplayId\":\"fullstack-mastery\",\"reason\":\"Covers frontend and backend\",\"fitGap\":\"Needs JavaScript basics\",\"confidence\":\"high\"}]}-->")
        expect(parsed.body).toBe("Fullstack Mastery fits your goal.")
        expect(parsed.courseAdvisor?.recommendations).toEqual([{
            courseDisplayId: "fullstack-mastery",
            reason: "Covers frontend and backend",
            fitGap: "Needs JavaScript basics",
            confidence: "high",
        }])
    })

    it("never renders the hidden envelope when malformed metadata follows valid copy", () => {
        expect(parseCourseAdvisorResponse("Useful answer\n<!--starci-course-advisor:not-json-->")).toEqual({ body: "Useful answer" })
    })

    it("leaves ordinary assistant answers unchanged", () => {
        expect(parseCourseAdvisorResponse("No course recommendation is needed.")).toEqual({ body: "No course recommendation is needed." })
    })
})
