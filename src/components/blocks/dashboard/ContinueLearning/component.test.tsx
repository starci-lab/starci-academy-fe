/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { _ContinueLearning } from "./component"

afterEach(cleanup)

describe("_ContinueLearning", () => {
    it("keeps business kind labels text-only", () => {
        render(
            <_ContinueLearning
                state="ready"
                props={{
                    label: "Continue learning",
                    resumeLabel: "Resume",
                    items: [{ id: "lesson-one", title: "Input contracts", kindLabel: "Lesson" }],
                }}
            />,
        )

        const kind = screen.getByText("Lesson").closest("[data-component=\"Text\"]")
        expect(kind).not.toBeNull()
        expect(kind?.querySelector("[data-component=\"Icon\"]")).toBeNull()
    })
})
