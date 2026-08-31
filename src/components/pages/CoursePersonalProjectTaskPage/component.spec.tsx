import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PersonalProjectTaskBase, type PersonalProjectTaskLabels } from "@/components/blocks/learn/PersonalProjectTask/component"

const labels: PersonalProjectTaskLabels = {
    back: "Back", guidance: "Guidance", criteria: "Criteria", showCriteria: "Show criteria", hideCriteria: "Hide criteria",
    implementation: "Implementation", points: (score) => `${score} points`, submission: "Project GitHub",
    repository: "Repository", repositoryDescription: "Paste the repository that contains your implementation.",
    repositoryPlaceholder: "https://github.com/owner/repository", settings: "Settings",
    language: "Language", model: "Model", branch: "Branch", branchPlaceholder: "main", token: "Token",
    tokenPlaceholder: "Paste token", tokenStored: (last4) => `Stored token ${last4}`, settingsSaved: "Saved",
    evaluate: "Submit for review", feedback: "View feedback", history: "Attempt history", latest: "Latest result",
    passed: "Passed", needsWork: "Needs work", saveSettings: "Save settings", retry: "Try again", lockedTitle: "Task is locked",
    openSubmission: "Open grading panel",
}

const props = {
    title: "Build the API client",
    description: "Integrate the typed client.",
    maxScore: 20,
    brief: "## Overview\nImplement the client.\n\n## Common errors\n- **Timeouts:** handle them.\n\n## Steps\n::::accordion\n:::panel{title=\"Step 1\"}\nProve the contract.\n:::\n:::panel{title=\"Step 2\"}\nExercise the client.\n:::\n::::",
    criteria: [{ id: "criterion-1", text: "Handles timeouts", score: 5 }],
    expandedBriefSectionIds: ["section-2-item-0"],
    repositoryDraft: "https://github.com/starci/demo",
    repositoryState: "ready" as const,
    languageOptions: [{ id: "typescript", label: "TypeScript" }],
    selectedLanguage: "typescript",
    modelOptions: [{ id: "auto", label: "Auto" }],
    selectedModel: "auto",
    settingsOpen: false,
    settingsState: "ready" as const,
    labels,
}

describe("CoursePersonalProjectTaskBase", () => {
    it("resolves each authored section to its semantic surface owner", () => {
        render(<PersonalProjectTaskBase state="ready" props={props} on={{ submit: vi.fn() }} />)

        expect(screen.getByRole("heading", { name: "Build the API client" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Back" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Common errors", level: 3 })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Steps", level: 3 })).toBeInTheDocument()
        expect(screen.getByText("Handles timeouts")).toBeInTheDocument()
        expect(screen.getByText("Paste the repository that contains your implementation.")).toBeInTheDocument()
        expect(screen.getByLabelText("Repository")).toHaveValue("https://github.com/starci/demo")
        expect(screen.getByRole("button", { name: "Submit for review" })).toBeEnabled()
        expect(screen.getByRole("button", { name: "Submit for review" })).toBeEnabled()
    })

    it("keeps evaluation disabled while a submission is running", () => {
        render(<PersonalProjectTaskBase state="submitting" props={props} />)
        expect(screen.getByRole("button", { name: "Submit for review" })).toBeDisabled()
    })

    it("hands compact task readers into the grading workflow at the end of the brief", () => {
        const toggleSubmission = vi.fn()
        render(<PersonalProjectTaskBase state="ready" props={props} on={{ toggleSubmission }} />)

        fireEvent.click(screen.getByRole("button", { name: "Open grading panel" }))
        expect(toggleSubmission).toHaveBeenCalledOnce()
    })

    it("announces an invalid repository once at the owning field", () => {
        render(<PersonalProjectTaskBase state="invalid-repository" props={{ ...props, repositoryState: "invalid", notice: "Invalid repository." }} />)

        expect(screen.getAllByText("Invalid repository.")).toHaveLength(1)
        expect(screen.getByRole("button", { name: "Submit for review" })).toBeDisabled()
    })

    it("replaces evaluation with recovery after a failed submission", () => {
        render(<PersonalProjectTaskBase state="submission-error" props={{ ...props, notice: "Submission failed." }} on={{ retry: vi.fn() }} />)
        expect(screen.getByText("Submission failed.")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Submit for review" })).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled()
    })

    it("replaces only the brief plane when the authored task fails", () => {
        render(<PersonalProjectTaskBase state="task-error" props={{ ...props, notice: "Task failed." }} on={{ retry: vi.fn() }} />)
        expect(screen.getAllByText("Task failed.").length).toBeGreaterThan(0)
        expect(screen.queryByText("Implement the client.")).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled()
    })

    it("renders enrollment denial as one locked card with a semantic return link and disabled evaluation", () => {
        render(<PersonalProjectTaskBase state="forbidden" props={{ ...props, notice: "Enroll to unlock." }} on={{ back: vi.fn() }} />)

        expect(screen.getByText("Task is locked")).toBeInTheDocument()
        expect(screen.getAllByText("Enroll to unlock.")).toHaveLength(2)
        expect(screen.queryByText("Implement the client.")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
        expect(screen.getAllByRole("link", { name: "Back" })).toHaveLength(2)
        expect(screen.getByRole("button", { name: "Settings" })).toBeDisabled()
        expect(screen.getByRole("button", { name: "Submit for review" })).toBeDisabled()
        expect(screen.queryByRole("button", { name: "View feedback" })).not.toBeInTheDocument()
    })

    it("preserves every authored surface when ancillary workspace data is unavailable", () => {
        render(<PersonalProjectTaskBase state="ancillary-unavailable" props={{ ...props, notice: "Workspace unavailable." }} on={{ retry: vi.fn() }} />)
        expect(screen.getByText("Implement the client.")).toBeInTheDocument()
        expect(screen.getByText("Prove the contract.")).toBeInTheDocument()
        expect(screen.getByText("Workspace unavailable.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled()
    })

    it("turns legacy muted labels into external labels and authored panels into accordion owners", () => {
        render(<PersonalProjectTaskBase
            state="ready"
            props={{
                ...props,
                brief: ":::muted\nGoal\n:::\n\nProtect the route.\n\n:::muted\nSteps\n:::\n\n::::accordion\n:::panel{title=\"Step 1\"}\nVerify the token.\n:::\n::::",
            }}
        />)

        expect(screen.getByRole("heading", { name: "Goal", level: 3 })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Steps", level: 3 })).toBeInTheDocument()
        expect(screen.getByText("Protect the route.")).toBeInTheDocument()
    })
})
