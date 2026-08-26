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
    earnedScore: 0,
    maximumScore: 10,
    expandedRequirementIds: ["submission-1"],
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
        expect(container.querySelector("[data-node=challenge-workspace]")).toBeTruthy()
        expect(container.querySelector("[data-node=challenge-attempt-workbench]")).toBeTruthy()
        expect(screen.getByRole("heading", { name: "Repository challenge", level: 1 })).toBeInTheDocument()
        expect(screen.getAllByText("1/2")).toHaveLength(1)
    })

    it("rests the full composition and two deliverable shapes while pending", () => {
        const { container } = render(<CourseLearnChallengeBlockBase blockState="pending" props={baseProps} />)

        expect(container.querySelectorAll("[data-node=challenge-deliverable-row]")).toHaveLength(2)
        expect(container.querySelector("h1")).toHaveAttribute("data-loading", "true")
        expect(screen.getByRole("button", { name: "Submit complete attempt" })).toBeDisabled()
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

        fireEvent.change(screen.getByLabelText("API repository"), {
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

        expect(screen.getByLabelText("API repository")).toBeDisabled()
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

        expect(screen.getByLabelText("API repository")).toHaveAttribute("aria-invalid", "true")
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
        expect(screen.queryByLabelText("API repository")).not.toBeInTheDocument()
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
