import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseLearnContentPage, type CourseLearnContentPageData } from "./component"

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}

globalThis.ResizeObserver = TestResizeObserver

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

const discussion = {
    state: "ready" as const,
    props: {
        labels: {
            title: "Discussion",
            composerLabel: "Comment",
            placeholder: "Share a question",
            submit: "Post comment",
            submitting: "Posting",
            empty: "No comments yet.",
            failed: "Comments could not be loaded.",
            retry: "Try again",
        },
        draft: "A question",
        draftKey: 0,
        comments: [{ id: "comment-1", author: "Ada", meta: "Today", body: "Helpful context" }],
    },
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

    it("keeps the visible discussion inside the unlocked lesson footer", () => {
        const submitDiscussion = vi.fn()
        const { container } = render(
            <_CourseLearnContentPage
                state="ready"
                props={{ labels, title: "Current lesson", body: "Lesson body", discussion }}
                on={{ submitDiscussion }}
            />,
        )

        expect(container.querySelector("[data-node=content-reader-footer]")).toBeTruthy()
        expect(container.querySelector("[data-node=content-discussion-panel]")).toBeTruthy()
        expect(screen.getByText("Helpful context")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Post comment" }))
        expect(submitDiscussion).toHaveBeenCalledTimes(1)
    })

    it("switches the lesson body to the approved Source face", () => {
        const selectSource = vi.fn()
        const { container } = render(
            <_CourseLearnContentPage
                state="ready"
                props={{
                    labels,
                    title: "Current lesson",
                    body: "Lesson body",
                    selectedFace: "source",
                    faces: [
                        { id: "reading", label: "Reading" },
                        { id: "source", label: "Source" },
                        { id: "challenge", label: "Challenge" },
                    ],
                    sourceState: "pending",
                    source: {
                        files: {},
                        dependencies: {},
                        activePath: "",
                        editedPaths: [],
                        filesLabel: "Files",
                        editorLabel: "Source",
                        previewLabel: "Preview",
                        identity: "Lesson snapshot",
                        loadingLabel: "Loading source",
                        failedLabel: "Source failed",
                        retryLabel: "Try again",
                        resetLabel: "Reset",
                        localChangesLabel: "Local changes",
                        runtimeErrorLabel: "Preview failed",
                        askErrorLabel: "Debug preview",
                    },
                }}
                on={{ selectSource }}
            />,
        )

        expect(container.querySelector("[data-component=Article]")).toBeNull()
        expect(container.querySelector("[data-node=source-workspace-root]")).not.toBeNull()
        fireEvent.click(screen.getByText("Source"))
        expect(selectSource).toHaveBeenCalledTimes(1)
    })
})
