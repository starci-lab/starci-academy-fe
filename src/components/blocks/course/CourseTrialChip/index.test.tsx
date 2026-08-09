/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { CourseTrialChip, meta } from "@/components/blocks/course/CourseTrialChip"

/**
 * What these tests guard: the one rule that makes this component worth having - it marks the
 * EXCEPTION and stays silent on the norm. A chip on every row would be a chip on no row.
 */

afterEach(() => {
    cleanup()
})

describe("CourseTrialChip", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "CourseTrialChip" })
    })

    it("says nothing at all about a real enrolment", () => {
        const { container } = render(<CourseTrialChip isEnrolled label="Trial" />)
        expect(container.firstElementChild).toBeNull()
    })

    it("marks a trial, in the tone that says it has an end date", () => {
        const { container } = render(<CourseTrialChip isEnrolled={false} label="Trial" />)
        const chip = container.firstElementChild
        expect(chip?.getAttribute("data-tone")).toBe("warning")
        expect(chip?.textContent).toBe("Trial")
    })
})
