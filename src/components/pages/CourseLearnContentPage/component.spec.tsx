import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import { CourseLearnContentPageBase, type CourseLearnContentPageData } from "./component"

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}

globalThis.ResizeObserver = TestResizeObserver
Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(() => null),
        length: 0,
    },
})

const labels: CourseLearnContentPageData["labels"] = {
    navCourse: "Course",
    navModule: "Module",
    facesLabel: "Lesson faces",
    searchPlaceholder: "Search contents",
    searchLabel: "Search contents",
    searchClearLabel: "Clear search",
    resizeRail: "Resize course outline",
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

describe("CourseLearnContentPageBase", () => {
    it("shows one selected mobile panel and keeps all three panels on desktop", () => {
        const props: CourseLearnContentPageData = {
            labels,
            title: "Current lesson",
            body: "Lesson body",
            modules: [{ id: "module-1", title: "Module one", isOpen: true }],
            outline: [{ id: "heading-1", label: "Heading" }],
        }
        const { container, rerender } = render(
            <CourseLearnContentPageBase state="ready" props={props} />,
        )

        expect(container.querySelector("[data-node=content-map-panel]")).not.toBeNull()
        expect(container.querySelector("[data-node=learn-content-page]")).not.toBeNull()
        expect(container.querySelector("[data-node=learn-content-page] > [data-node=content-reader-main-scroll-viewport] > [data-node=content-reader-inner]")).not.toBeNull()
        expect(container.querySelector("[data-node=content-outline-rail]")).not.toBeNull()
        expect(container.querySelector("[role=separator]")).not.toBeNull()
        expect(container.querySelector("[data-node=content-reader-frame]")).toHaveClass("h-app-rail", "overflow-hidden")
        expect(container.querySelector("[data-node=content-map-panel]")).toHaveClass("py-6")
        expect(container.querySelector("[data-node=learn-content-page]")).toHaveClass("h-full", "overflow-hidden")
        expect(container.querySelector("[data-node=content-reader-main-scroll-viewport]")).toHaveClass("h-full", "overflow-y-auto", "scrollbar")
        expect(container.querySelector("[data-node=content-outline-rail]")).toHaveClass("h-full", "overflow-y-auto", "scrollbar")

        const cases = [
            ["contents", "content-map-panel"],
            ["lesson", "learn-content-page"],
            ["outline", "content-outline-rail"],
        ] as const
        for (const [mobileView, node] of cases) {
            rerender(
                <CourseLearnContentPageBase state="ready" props={{ ...props, mobileView }} />,
            )
            expect(container.firstElementChild?.getAttribute("data-node")).toBe(node)
            expect(container.querySelectorAll("[data-node=content-map-panel]")).toHaveLength(mobileView === "contents" ? 1 : 0)
            expect(container.querySelectorAll("[data-node=learn-content-page]")).toHaveLength(mobileView === "lesson" ? 1 : 0)
            expect(container.querySelectorAll("[data-node=content-outline-rail]")).toHaveLength(mobileView === "outline" ? 1 : 0)
        }
    })

    it("opens a module-map content through the page-owned action", () => {
        const openContent = vi.fn()
        const { container } = render(
            <CourseLearnContentPageBase
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

    it("renders source-backed lesson context and submits course-map search", () => {
        const searchContent = vi.fn()
        const { container } = render(
            <CourseLearnContentPageBase
                state="ready"
                props={{
                    labels,
                    title: "Current lesson",
                    description: "Why dependency inversion matters in production.",
                    status: { content: "Unread", tone: "neutral", icon: "incomplete" },
                    facts: ["20 min", "2 challenges"],
                    body: "Lesson body",
                }}
                on={{ searchContent }}
            />,
        )

        expect(screen.getByText("Why dependency inversion matters in production.")).toBeInTheDocument()
        expect(screen.getByText("Unread")).toBeInTheDocument()
        expect(screen.getByText("20 min · 2 challenges")).toBeInTheDocument()
        expect(container.querySelectorAll("[data-component=Badge]")).toHaveLength(1)
        const identity = container.querySelector("[data-node=course-content-identity-stack]")
        expect(identity).toHaveClass("gap-2")
        expect(identity?.querySelector("[data-node=status-metadata-line]")).not.toBeNull()
        fireEvent.change(screen.getByRole("searchbox", { name: "Search contents" }), { target: { value: "database" } })
        fireEvent.submit(screen.getByRole("search"))
        expect(searchContent).toHaveBeenCalledWith("database")
    })

    it("routes the deep trail through its nearest parent action", () => {
        const goCourse = vi.fn()
        const goModule = vi.fn()
        render(
            <CourseLearnContentPageBase
                state="ready"
                props={{ labels, title: "Current lesson", body: "Lesson body" }}
                on={{ goCourse, goModule }}
            />,
        )

        fireEvent.click(screen.getByText("Back"))
        expect(goCourse).not.toHaveBeenCalled()
        expect(goModule).toHaveBeenCalledTimes(1)
    })

    it("offers the failed reader recovery action", () => {
        const act = vi.fn()
        render(
            <CourseLearnContentPageBase
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
            <CourseLearnContentPageBase
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
            <CourseLearnContentPageBase
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
                        mode: "sandbox",
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

    it("joins the paywall to the preview inside the same paper and drops the whole footer", () => {
        const act = vi.fn()
        const { container } = render(
            <CourseLearnContentPageBase
                state="locked"
                props={{
                    labels,
                    title: "Paid lesson",
                    body: "The opening paragraph",
                    selectionHint: "Select any passage to ask about it",
                    noticeMessage: "Enrol to keep reading",
                    noticeActionLabel: "Enrol",
                    nextSteps: [{ id: "next-1", label: "Next lesson" }],
                    reactions: { count: 4, labels: { like: "Like", love: "Love", haha: "Haha", wow: "Wow", sad: "Sad", angry: "Angry" } },
                }}
                on={{ act }}
            />,
        )

        const paper = container.querySelector("[data-node=content-reading-paper]")
        expect(paper?.querySelector("[data-component=Article]")).not.toBeNull()
        expect(screen.getByText("Enrol to keep reading")).toBeInTheDocument()
        expect(screen.queryByText("Select any passage to ask about it")).not.toBeInTheDocument()
        expect(container.querySelector("[data-node=content-reader-footer]")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: /Enrol/ }))
        expect(act).toHaveBeenCalledTimes(1)
    })

    it("keeps the paywall's way in even when no lock sentence was resolved", () => {
        const act = vi.fn()
        const { container } = render(
            <CourseLearnContentPageBase
                state="locked"
                props={{ labels, title: "Paid lesson", body: "The opening paragraph", noticeActionLabel: "Enrol" }}
                on={{ act }}
            />,
        )

        expect(container.querySelector("[data-node=empty-notice-stack]")).not.toBeNull()
        fireEvent.click(screen.getByRole("button", { name: /Enrol/ }))
        expect(act).toHaveBeenCalledTimes(1)
    })

    it("puts the selection hint, the reaction card and the destinations under an unlocked lesson", () => {
        const selectReaction = vi.fn()
        const changePage = vi.fn()
        const { container } = render(
            <CourseLearnContentPageBase
                state="ready"
                props={{
                    labels,
                    title: "Current lesson",
                    body: "Lesson body",
                    selectionHint: "Select any passage to ask about it",
                    reactions: {
                        count: 12,
                        selected: ReactionType.Like,
                        isPending: false,
                        labels: { like: "Like", love: "Love", haha: "Haha", wow: "Wow", sad: "Sad", angry: "Angry" },
                    },
                    nextSteps: [{ id: "next-1", label: "Records and tuples" }, { id: "next-2", label: "Pattern matching" }],
                    page: 2,
                    totalPages: 5,
                }}
                on={{ selectReaction, changePage }}
            />,
        )

        expect(screen.getByText("Select any passage to ask about it")).toBeInTheDocument()
        expect(screen.getByText("Was this useful?")).toBeInTheDocument()
        expect(container.querySelector("[data-node=content-reaction-card]")).not.toBeNull()
        expect(screen.getByText("Up next")).toBeInTheDocument()
        expect(screen.getByText("Records and tuples")).toBeInTheDocument()
        expect(container.querySelectorAll("[data-node=next-action-row]")).toHaveLength(2)

        fireEvent.click(screen.getByRole("button", { name: "Reactions" }))
        fireEvent.click(screen.getByRole("button", { name: "Love" }))
        expect(selectReaction).toHaveBeenCalledWith(ReactionType.Love)

        fireEvent.click(screen.getByRole("button", { name: "Next" }))
        expect(changePage).toHaveBeenCalledWith(3)
    })

    it("measures course progress in the map panel and closes the modules the reader has not opened", () => {
        const { container } = render(
            <CourseLearnContentPageBase
                state="ready"
                props={{
                    labels,
                    title: "Current lesson",
                    body: "Lesson body",
                    courseProgress: { label: "Course progress", value: 3, total: 12 },
                    modules: [
                        { id: "module-1", title: "Open module", countLabel: "4 lessons", isOpen: true },
                        { id: "module-2", title: "Closed module", countLabel: "6 lessons", contents: [{ id: "hidden", title: "Hidden lesson" }] },
                    ],
                }}
            />,
        )

        expect(screen.getByText("Course progress")).toBeInTheDocument()
        expect(screen.getByText("3/12")).toBeInTheDocument()
        expect(screen.queryByText("Hidden lesson")).not.toBeInTheDocument()
        expect(container.querySelectorAll("[data-component=SurfaceAccordionCard]")).toHaveLength(2)
        expect(container.querySelector("[data-component=ContentMapRow]")).toBeNull()
    })

    it("falls back to a wordless failure notice when the reader was given no sentence", () => {
        const { container } = render(
            <CourseLearnContentPageBase state="failed" props={{ labels, outline: [{ id: "heading-1", label: "Heading" }] }} />,
        )

        expect(container.querySelector("[data-node=centred-empty-notice]")).not.toBeNull()
        expect(container.querySelector("[data-node=content-outline-rail]")).toBeNull()
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("opens the bar for a single face that carries more than one example language", () => {
        const selectLanguage = vi.fn()
        const { container } = render(
            <CourseLearnContentPageBase
                state="ready"
                props={{
                    labels,
                    title: "Current lesson",
                    body: "Lesson body",
                    faces: [{ id: "reading", label: "Reading" }],
                    selectedFace: "reading",
                    languagesLabel: "Example language",
                    languages: [{ id: "ts", label: "TypeScript" }, { id: "go", label: "Go" }],
                    selectedLanguage: "ts",
                }}
                on={{ selectLanguage }}
            />,
        )

        expect(container.querySelector("[data-node=dual-tabs-toolbar]")).not.toBeNull()
        fireEvent.click(screen.getByRole("button", { name: /Example language/ }))
        fireEvent.click(screen.getByRole("option", { name: "Go" }))
        expect(selectLanguage).toHaveBeenCalledWith("go")
    })
})
