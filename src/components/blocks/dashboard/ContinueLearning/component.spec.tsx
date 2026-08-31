/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ContinueLearningBase } from "./component"

afterEach(cleanup)

describe("ContinueLearningBase", () => {
    it("keeps an empty answer compact while preserving its next step", () => {
        const act = vi.fn()
        const { container } = render(<ContinueLearningBase state="empty" props={{ label: "Continue learning", message: "Nothing to resume", actionLabel: "Browse courses" }} on={{ act }} />)

        expect(screen.getByText("Nothing to resume")).toHaveAttribute("data-size", "sm")
        expect(screen.getByText("Nothing to resume").parentElement).toHaveClass("items-center", "text-center")
        expect(container.querySelector(".bg-gradient-to-br")).toBeNull()
        const action = screen.getByRole("button", { name: "Browse courses" })
        expect(action.querySelector("svg")).toBeNull()
        fireEvent.click(action)
        expect(act).toHaveBeenCalledOnce()
    })

    it("does not invent an unnamed action when the notice has no destination", () => {
        render(<ContinueLearningBase state="empty" props={{ label: "Continue learning", message: "Nothing to resume" }} />)

        expect(screen.getByText("Nothing to resume")).toBeInTheDocument()
        expect(screen.queryByRole("button")).toBeNull()
    })

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

    it("highlights exactly the first equal-height resume card", () => {
        const { container } = render(
            <ContinueLearningBase
                state="ready"
                props={{
                    label: "Continue learning",
                    resumeLabel: "Resume",
                    items: [
                        { id: "one", title: "One", kindLabel: "Content" },
                        { id: "two", title: "Two", kindLabel: "Content" },
                        { id: "three", title: "Three", kindLabel: "Content" },
                    ],
                }}
            />,
        )

        expect(container.querySelectorAll("[data-dashboard-resume-item]")).toHaveLength(3)
        expect(screen.getByText("Continue learning").closest("[data-grammar-surface-label='true']")).not.toBeNull()
        expect(screen.getByText("Continue learning").closest("[data-grammar-label='true']")).not.toBeNull()
        expect(container.querySelector(".grid.items-stretch")).toHaveClass("gap-6")
        expect(container.querySelectorAll("[data-grammar-highlight=true]")).toHaveLength(1)
        expect(container.querySelector("[data-dashboard-resume-item=featured]")).toHaveClass("h-full")
        expect(container.querySelector("[data-dashboard-resume-item=supporting]")).toHaveClass("h-full")
        expect(container.querySelector("[data-dashboard-resume-item=featured] [data-tone=accent]")).toHaveClass("bg-accent-soft", "text-accent-soft-foreground")
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
