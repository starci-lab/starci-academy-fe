import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseLearnChallengeBlockBase, type CourseLearnChallengePageProps } from "@/components/blocks/learn/CourseLearnChallengeBlock/component"

const baseProps: CourseLearnChallengePageProps["props"] = {
    title: "Repository challenge",
    courseTitle: "Fullstack Mastery",
    moduleTitle: "Foundations",
    contentTitle: "Dependency injection",
    description: "Submit the authored deliverable.",
    difficultyLabel: "Hard",
    statusLabel: "Not submitted",
    hint: "Keep the public API stable.",
    prerequisites: [{ id: "prerequisite-1", body: "Know dependency inversion." }],
    requirements: [{ id: "requirement-1", title: "Stable contract", body: "Keep the public API stable.", score: 6 }],
    steps: [{ id: "step-1", title: "Extract the port", body: "Move the dependency behind an interface." }],
    outputs: [{ id: "output-1", body: "A public repository with smoke-test evidence." }],
    earnedScore: 0,
    maximumScore: 10,
    expandedRequirementIds: ["submission-1"],
    expandedStepIds: ["step-1"],
    isCourseMapOpen: false,
    isConfirmOpen: false,
    allDraftsComplete: true,
    draftStatus: "Draft saved",
    courseMap: {
        state: "ready",
        props: {
            labels: {
                progress: "Course progress",
                searchPlaceholder: "Search contents",
                searchLabel: "Search this course",
                searchClearLabel: "Clear search",
                failed: "Course outline failed",
            },
            completionPercent: 50,
            progressFact: "1/2",
            modules: [{
                id: "module-1",
                title: "Foundations",
                countLabel: "0/1 lesson",
                progressLabel: "Progress for Foundations",
                completionPercent: 0,
                isOpen: true,
                lessons: [{
                    id: "challenge:challenge-1",
                    title: "Repository challenge",
                    meta: "10 points",
                    isComplete: false,
                    isCurrent: true,
                }],
            }],
        },
    },
    deliverables: [{
        id: "submission-1",
        title: "API repository",
        description: "Provide the repository URL.",
        score: 10,
        url: "https://example.test/repository",
    }],
    labels: {
        backToLesson: "Back to lesson",
        openCourseMap: "Course contents",
        closeCourseMap: "Close course contents",
        brief: "Challenge brief",
        deliverables: "Submit your work",
        prerequisites: "Before you start",
        requirements: "Scored requirements",
        steps: "Suggested approach",
        expectedOutputs: "Expected outputs",
        hintLabel: "Hint",
        evidenceLabel: "Repository evidence",
        gradingModel: "Grading model",
        changeModel: "Choose grading model",
        score: "Your score",
        repositoryPlaceholder: "https://github.com/…",
        saved: "Saved locally",
        saving: "Saving",
        saveFailed: "Save failed",
        conflict: "Draft conflict",
        saveDraft: "Save draft",
        retrySave: "Retry save",
        submitAttempt: "Submit complete attempt",
        confirmTitle: "Submit this attempt?",
        confirmDescription: "The submitted revision cannot be edited.",
        confirmSubmit: "Submit and evaluate",
        cancel: "Keep editing",
        breadcrumb: "Course challenge path",
        submit: "Submit",
        submitting: "Submitting",
        retry: "Retry",
        result: "Open graded result",
        points: (score) => `${score} points`,
        scoreValue: (score, maximum) => `${score} / ${maximum} points`,
        passing: (score) => `Pass at ${score}`,
        scoreCaption: "Reach the passing threshold.",
    },
}

describe("CourseLearnChallengeBlockBase", () => {
    it("composes the existing course map with the accepted challenge document and action rail", () => {
        const { container } = render(<CourseLearnChallengeBlockBase blockState="ready" props={baseProps} />)

        expect(container.querySelector("[data-node=challenge-page-document]")).toBeTruthy()
        const workspace = container.querySelector("[data-node=challenge-workspace]")
        const actionBar = container.querySelector("[data-node=challenge-workspace-action-bar]")
        expect(workspace).toBeTruthy()
        expect(workspace).toHaveClass("xl:flex-row")
        expect(workspace).not.toHaveClass("2xl:flex-row")
        expect(actionBar).toHaveClass("pr-32")
        expect(container.querySelector("[data-node=challenge-attempt-workbench]")).toBeTruthy()
        expect(screen.getByRole("heading", { name: "Repository challenge", level: 1 })).toBeInTheDocument()
        expect(screen.getAllByText("1/2")).toHaveLength(1)
        expect(screen.getByRole("heading", { name: "Before you start", level: 2 })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Scored requirements", level: 2 })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Suggested approach", level: 2 })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Expected outputs", level: 2 })).toBeInTheDocument()
        expect(screen.getAllByText("Submit the authored deliverable.")).toHaveLength(1)
        expect(screen.getAllByRole("button", { name: "Back to lesson" })).toHaveLength(1)
        expect(screen.getByLabelText("Course challenge path")).toHaveTextContent("Fullstack MasteryFoundationsDependency injectionRepository challenge")
        expect(container.querySelectorAll("[data-node=challenge-brief] [data-component=SurfaceListCard]")).toHaveLength(2)
        expect(container.querySelectorAll("[data-node=challenge-brief] [data-component=SurfaceListCardSurface][data-surface-context=nested]")).toHaveLength(2)
        for (const list of container.querySelectorAll("[data-node=challenge-brief] [data-component=SurfaceListCard]")) {
            expect(list).toHaveAttribute("data-grammar-label-visibility", "hidden")
        }
        expect(container.querySelectorAll("[data-node=challenge-brief] [data-component=SurfaceAccordionCard]")).toHaveLength(2)
        expect(container.querySelectorAll("[data-node=challenge-brief] [data-component=SurfaceAccordionCardItem]")).toHaveLength(2)
        const guidanceGroup = screen.getByRole("heading", { name: "Suggested approach" }).closest("[data-node=challenge-brief-group]")
        expect(guidanceGroup?.querySelectorAll("[data-component=SurfaceAccordionCard]")).toHaveLength(1)
        expect(guidanceGroup?.querySelectorAll("[data-component=SurfaceAccordionCardItem]")).toHaveLength(1)
        expect(guidanceGroup?.querySelector("[data-component=SurfaceListCard]")).toBeNull()
        expect(guidanceGroup?.querySelector("[data-component=SurfaceAccordionCard]")).toHaveAttribute("data-grammar-surface-depth", "nested")
        expect(guidanceGroup?.querySelector("[data-component=SurfaceAccordionCard]")).toHaveClass("starci-core-surface", "starci-core-accordion-shell")
        expect(guidanceGroup?.querySelector("[data-component=SurfaceAccordionCard]")).not.toHaveClass("shadow-surface")
        const challengeArticles = container.querySelectorAll("[data-node=challenge-brief] [data-component=Article]")
        expect(challengeArticles.length).toBeGreaterThan(0)
        expect(Array.from(challengeArticles).every((article) => article.getAttribute("data-measure") === "compact")).toBe(true)
    })

    it("uses the shared quiet ordinal leaf for every authored guidance sequence", () => {
        const { container } = render(<CourseLearnChallengeBlockBase blockState="ready" props={baseProps} />)

        const leadingNumbers = container.querySelectorAll("[data-grammar-leading-number=true]")
        expect(leadingNumbers).toHaveLength(3)
        expect(Array.from(leadingNumbers, (marker) => marker.textContent)).toEqual(["1.", "1.", "1."])
        expect(container.querySelector("[data-node=challenge-guidance-item] [data-component=Badge]")).toBeNull()
        expect(container.querySelector("[data-node=challenge-guidance-summary] [data-component=Badge]")).toBeNull()
    })

    it("joins scored requirements into one accordion surface and routes each disclosure by id", () => {
        const toggleRequirement = vi.fn()
        render(<CourseLearnChallengeBlockBase
            blockState="ready"
            props={{
                ...baseProps,
                requirements: [
                    ...(baseProps.requirements ?? []),
                    { id: "requirement-2", title: "Second contract", body: "Keep the second boundary stable.", score: 4 },
                ],
                expandedRequirementIds: [],
            }}
            on={{ toggleRequirement }}
        />)

        const requirementGroup = screen.getByRole("heading", { name: "Scored requirements" }).closest("[data-node=challenge-brief-group]")
        expect(requirementGroup?.querySelectorAll("[data-component=SurfaceAccordionCard]")).toHaveLength(1)
        expect(requirementGroup?.querySelectorAll("[data-component=SurfaceAccordionCardItem]")).toHaveLength(2)
        expect(requirementGroup?.querySelector("[data-component=SurfaceAccordionCard]")).toHaveAttribute("data-surface-context", "nested")
        expect(requirementGroup?.querySelector("[data-component=SurfaceAccordionCard]")).not.toHaveClass("shadow-surface")
        const trigger = screen.getByText("Second contract").closest("button")
        expect(trigger).not.toBeNull()
        fireEvent.click(trigger as HTMLButtonElement)
        expect(toggleRequirement).toHaveBeenCalledWith("requirement-2", true)
    })

    it("renders implementation steps as one accordion surface and routes each step by id", () => {
        const toggleStep = vi.fn()
        render(<CourseLearnChallengeBlockBase
            blockState="ready"
            props={{
                ...baseProps,
                steps: [
                    ...(baseProps.steps ?? []),
                    { id: "step-2", title: "Verify the boundary", body: "Confirm only the selected slice renders again." },
                ],
                expandedStepIds: [],
            }}
            on={{ toggleStep }}
        />)

        const guidanceGroup = screen.getByRole("heading", { name: "Suggested approach" }).closest("[data-node=challenge-brief-group]")
        expect(guidanceGroup?.querySelectorAll("[data-component=SurfaceAccordionCard]")).toHaveLength(1)
        expect(guidanceGroup?.querySelectorAll("[data-component=SurfaceAccordionCardItem]")).toHaveLength(2)
        expect(guidanceGroup?.querySelector("[data-component=SurfaceListCard]")).toBeNull()
        expect(document.querySelector("[data-node=challenge-accordion-body]")).toBeNull()
        const trigger = screen.getByText("Verify the boundary").closest("button")
        expect(trigger).not.toBeNull()
        fireEvent.click(trigger as HTMLButtonElement)
        expect(toggleStep).toHaveBeenCalledWith("step-2", true)
    })

    it("rests the full composition and two deliverable shapes while pending", () => {
        const { container } = render(<CourseLearnChallengeBlockBase blockState="pending" props={baseProps} />)

        expect(container.querySelectorAll("[data-node=challenge-deliverable-row]")).toHaveLength(2)
        expect(container.querySelector("h1")).toHaveAttribute("data-loading", "true")
        expect(screen.getByRole("button", { name: "Submit complete attempt" })).toBeDisabled()
    })

    it("keeps model ownership on the deliverable and replaces editing with immutable review", () => {
        const openModelDrawer = vi.fn()
        const { rerender } = render(
            <CourseLearnChallengeBlockBase
                blockState="ready"
                props={baseProps}
                on={{ openModelDrawer }}
            />,
        )

        expect(screen.getAllByRole("button", { name: "Choose grading model" })).toHaveLength(1)
        expect(document.querySelector("[data-node=challenge-header-actions]")).not.toHaveTextContent("Choose grading model")
        fireEvent.click(screen.getByRole("button", { name: "Choose grading model" }))
        expect(openModelDrawer).toHaveBeenCalledTimes(1)

        rerender(<CourseLearnChallengeBlockBase blockState="ready" props={{ ...baseProps, isReviewing: true }} />)
        expect(screen.queryByLabelText("Repository evidence")).not.toBeInTheDocument()
        expect(document.querySelector("[data-node=challenge-attempt-review]")).toBeTruthy()
        expect(document.querySelector("[data-node=challenge-deliverable-list]")).toBeNull()
        expect(screen.queryByRole("button", { name: "Save draft" })).not.toBeInTheDocument()
        expect(screen.getAllByRole("button", { name: "Submit complete attempt" })).toHaveLength(1)
    })

    it("edits one deliverable and submits the complete attempt", () => {
        const changeUrl = vi.fn()
        const submitAttempt = vi.fn()
        render(
            <CourseLearnChallengeBlockBase
                blockState="ready"
                props={baseProps}
                on={{ changeUrl, submitAttempt }}
            />,
        )

        fireEvent.change(screen.getByLabelText("Repository evidence"), {
            target: { value: "https://example.test/next" },
        })
        fireEvent.click(screen.getByRole("button", { name: "Submit complete attempt" }))
        expect(changeUrl).toHaveBeenCalledWith("submission-1", "https://example.test/next")
        expect(submitAttempt).toHaveBeenCalledTimes(1)
    })

    it("locks every submit control while the active deliverable is in flight", () => {
        render(
            <CourseLearnChallengeBlockBase
                blockState="submitting"
                props={{ ...baseProps, activeSubmissionId: "submission-1" }}
            />,
        )

        expect(screen.getByLabelText("Repository evidence")).toBeDisabled()
        expect(screen.getByRole("button", { name: "Submit complete attempt" })).toBeDisabled()
    })

    it("keeps the failed field in place and retries the recoverable draft save", () => {
        const saveDraft = vi.fn()
        render(
            <CourseLearnChallengeBlockBase
                blockState="failed"
                props={{
                    ...baseProps,
                    failedSubmissionId: "submission-1",
                    notice: "Submission refused",
                }}
                on={{ saveDraft }}
            />,
        )

        expect(screen.getByLabelText("Repository evidence")).toHaveAttribute("aria-invalid", "true")
        fireEvent.click(screen.getByRole("button", { name: "Save draft" }))
        expect(saveDraft).toHaveBeenCalledTimes(1)
    })

    it("opens the graded result after the challenge has passed", () => {
        const openResult = vi.fn()
        render(
            <CourseLearnChallengeBlockBase
                blockState="passed"
                props={{ ...baseProps, earnedScore: 9, statusLabel: "Passed" }}
                on={{ openResult }}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Open graded result" }))
        expect(openResult).toHaveBeenCalledWith("submission-1")
        expect(screen.queryByLabelText("Repository evidence")).not.toBeInTheDocument()
    })

    it("exposes the same course map through the narrow-screen drawer control", () => {
        const openCourseMap = vi.fn()
        const { container } = render(
            <CourseLearnChallengeBlockBase
                blockState="ready"
                props={baseProps}
                on={{ openCourseMap }}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Course contents" }))
        expect(openCourseMap).toHaveBeenCalledTimes(1)
        expect(container.querySelector("[data-node=learn-mobile-course-map-row]")).toBeTruthy()
        expect(container.querySelector("[data-node=challenge-mobile-map-row]")).toBeNull()
    })
})
