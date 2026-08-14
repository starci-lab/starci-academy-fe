import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseLearnContentPage, type CourseLearnContentPageData } from "./component"

const labels: CourseLearnContentPageData["labels"] = {
    navCourse: "Course",
    navModule: "Module",
    facesLabel: "Lesson faces",
    searchPlaceholder: "Search contents",
    searchLabel: "Search contents",
    searchClearLabel: "Clear search",
    outlineTitle: "On this page",
    pageLabel: "Page",
    previousLabel: "Previous",
    nextLabel: "Next",
    reactionsLabel: "Reactions",
    reactionPrompt: "Was this useful?",
    nextTitle: "Up next",
}

describe("_CourseLearnContentPage", () => {
    it("shows one selected mobile panel and keeps all three panels on desktop", () => {
        const props: CourseLearnContentPageData = {
            labels,
            title: "Current lesson",
            body: "Lesson body",
            modules: [{ id: "module-1", title: "Module one", isOpen: true }],
            outline: [{ id: "heading-1", label: "Heading" }],
        }
        const { container, rerender } = render(
            <_CourseLearnContentPage state="ready" props={props} />,
        )

        expect(container.querySelector("[data-node=content-map-panel]")).not.toBeNull()
        expect(container.querySelector("[data-node=learn-content-page]")).not.toBeNull()
        expect(container.querySelector("[data-node=content-outline-rail]")).not.toBeNull()

        const cases = [
            ["contents", "content-map-panel"],
            ["lesson", "learn-content-page"],
            ["outline", "content-outline-rail"],
        ] as const
        for (const [mobileView, node] of cases) {
            rerender(
                <_CourseLearnContentPage state="ready" props={{ ...props, mobileView }} />,
            )
            expect(container.firstElementChild?.getAttribute("data-node")).toBe(node)
            expect(container.querySelectorAll("[data-node=content-map-panel]")).toHaveLength(mobileView === "contents" ? 1 : 0)
            expect(container.querySelectorAll("[data-node=learn-content-page]")).toHaveLength(mobileView === "lesson" ? 1 : 0)
            expect(container.querySelectorAll("[data-node=content-outline-rail]")).toHaveLength(mobileView === "outline" ? 1 : 0)
        }
    })

    it("opens a module-map content through the page-owned action", () => {
        const openContent = vi.fn()
        render(
            <_CourseLearnContentPage
                state="ready"
                props={{
                    labels,
                    title: "Current lesson",
                    body: "Lesson body",
                    modules: [{
                        id: "module-1",
                        title: "Module one",
                        isOpen: true,
                        contents: [
                            { id: "content-1", title: "Current lesson", isCurrent: true },
                            { id: "content-2", title: "Next lesson" },
                        ],
                    }],
                }}
                on={{ openContent }}
            />,
        )

        fireEvent.click(screen.getByText("Next lesson"))
        expect(openContent).toHaveBeenCalledWith("content-2")
    })

    it("routes both breadcrumb identities through named actions", () => {
        const goCourse = vi.fn()
        const goModule = vi.fn()
        render(
            <_CourseLearnContentPage
                state="ready"
                props={{ labels, title: "Current lesson", body: "Lesson body" }}
                on={{ goCourse, goModule }}
            />,
        )

        fireEvent.click(screen.getByText("Course"))
        fireEvent.click(screen.getByText("Module"))
        expect(goCourse).toHaveBeenCalledTimes(1)
        expect(goModule).toHaveBeenCalledTimes(1)
    })

    it("offers the failed reader recovery action", () => {
        const act = vi.fn()
        render(
            <_CourseLearnContentPage
                state="failed"
                props={{
                    labels,
                    noticeMessage: "Could not load lesson",
                    noticeActionLabel: "Retry",
                }}
                on={{ act }}
            />,
        )

        fireEvent.click(screen.getByText("Retry"))
        expect(act).toHaveBeenCalledTimes(1)
    })
})
