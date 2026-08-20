import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CoursePersonalProjectTaskPageBase, type CoursePersonalProjectTaskPageLabels } from "./component"

const labels: CoursePersonalProjectTaskPageLabels = {
    back: "Back", criteria: "Criteria", showCriteria: "Show criteria", hideCriteria: "Hide criteria",
    implementation: "Implementation", points: (score) => `${score} points`, submission: "Project GitHub",
    repository: "Repository", repositoryPlaceholder: "https://github.com/owner/repository", settings: "Settings",
    language: "Language", model: "Model", branch: "Branch", branchPlaceholder: "main", token: "Token",
    tokenPlaceholder: "Paste token", tokenStored: (last4) => `Stored token ${last4}`, settingsSaved: "Saved",
    evaluate: "Submit for review", feedback: "View feedback", history: "Attempt history", latest: "Latest result",
    passed: "Passed", needsWork: "Needs work", saveSettings: "Save settings", retry: "Try again",
}

const props = {
    title: "Build the API client",
    description: "Integrate the typed client.",
    maxScore: 20,
    brief: "Implement the client and prove the contract.",
    criteria: [{ id: "criterion-1", text: "Handles timeouts", score: 5 }],
    criteriaExpanded: true,
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

describe("CoursePersonalProjectTaskPageBase", () => {
    it("renders the task, rubric and persistent submission action", () => {
        render(<CoursePersonalProjectTaskPageBase state="ready" props={props} on={{ submit: vi.fn() }} />)

        expect(screen.getByRole("heading", { name: "Build the API client" })).toBeInTheDocument()
        expect(screen.getByText("Handles timeouts")).toBeInTheDocument()
        expect(screen.getAllByText("20 points")).toHaveLength(2)
        expect(screen.getByRole("button", { name: "Submit for review" })).toBeEnabled()
    })

    it("keeps evaluation disabled while a submission is running", () => {
        render(<CoursePersonalProjectTaskPageBase state="submitting" props={props} />)
        expect(screen.getByRole("button", { name: "Submit for review" })).toBeDisabled()
    })

    it("replaces evaluation with recovery after a failed submission", () => {
        render(<CoursePersonalProjectTaskPageBase state="failed" props={{ ...props, notice: "Submission failed." }} on={{ retry: vi.fn() }} />)
        expect(screen.getByText("Submission failed.")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Submit for review" })).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled()
    })
})
