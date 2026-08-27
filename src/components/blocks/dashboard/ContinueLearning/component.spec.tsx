/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { ContinueLearningBase } from "./component"

afterEach(cleanup)

describe("ContinueLearningBase", () => {
    it("keeps business kind labels text-only", () => {
        render(
            <ContinueLearningBase
                state="ready"
                props={{
                    label: "Continue learning",
                    resumeLabel: "Resume",
                    items: [{ id: "lesson-one", title: "Input contracts", kindLabel: "Lesson" }],
                }}
            />,
        )

        const kind = screen.getByText("Lesson")
        expect(kind).toHaveAttribute("data-size", "sm")
        expect(kind.querySelector("svg")).toBeNull()
    })

    it("keeps long titles compact and their supporting content plain", () => {
        render(
            <ContinueLearningBase
                state="ready"
                props={{
                    label: "Continue learning",
                    resumeLabel: "Resume",
                    items: [{
                        id: "lesson-one",
                        title: "The document model and ODM: embedding versus referencing",
                        kindLabel: "Content",
                    }],
                }}
            />,
        )

        const title = screen.getByText("The document model and ODM: embedding versus referencing")
        expect(title).toHaveAttribute("data-size", "sm")
        expect(title).toHaveAttribute("data-weight", "medium")

        const content = screen.getByText("Content")
        expect(content).toHaveAttribute("data-size", "sm")
        expect(content).toHaveAttribute("data-weight", "normal")
    })
})
