import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { ProfileChallengeSubmissionPageBase } from "./component"

/**
 * What these tests guard.
 *
 * One public proof reads as four settled statements: who it belongs to, the source that was
 * submitted, every attempt, then the grading feedback. A proof that is still arriving, failed, or
 * simply not public each has its own sentence, and none of them may present an empty card as data.
 */

const rows = (container: HTMLElement) => container.querySelectorAll("[data-node='evidence-title-subtitle-fact-row']")

describe("ProfileChallengeSubmissionPageBase", () => {
    it("keeps submitted proof, attempts and structured feedback in legacy order", () => {
        const html = renderToStaticMarkup(<ProfileChallengeSubmissionPageBase state="ready" detail={{ title: "Resilient checkout", courseTitle: "Frontend Engineering", submissionUrl: "https://example.com/proof", attempts: [{ attemptNumber: 3, score: 94 }], feedbacks: [{ message: "Reliability", severity: "Strong" }] }} onBack={vi.fn()} />)
        expect(html.indexOf("Submitted proof")).toBeLessThan(html.indexOf("Attempts"))
        expect(html.indexOf("Attempts")).toBeLessThan(html.indexOf("Structured feedback"))
        expect(html).toContain("https://example.com/proof")
    })

    it("rests three attempts, three feedbacks and a placeholder proof link while loading", () => {
        const { container } = render(<ProfileChallengeSubmissionPageBase state="pending" onBack={vi.fn()} />)

        expect(rows(container)).toHaveLength(6)
        expect(screen.getByRole("button", { name: "← Challenges" })).toBeInTheDocument()
        expect(screen.getByText("Loading proof")).toBeInTheDocument()
        expect(container.querySelector("[data-component='Heading'][data-loading='true']")).not.toBeNull()
    })

    it("drops the proof card and says both lists are unknown when the proof failed to load", () => {
        render(<ProfileChallengeSubmissionPageBase state="error" detail={null} onBack={vi.fn()} />)

        expect(screen.getByRole("heading", { name: "Challenge proof couldn't be loaded" })).toBeInTheDocument()
        expect(screen.queryByText("Submitted proof")).not.toBeInTheDocument()
        expect(screen.getByText("No public attempts were found.")).toBeInTheDocument()
        expect(screen.getByText("No structured feedback was published.")).toBeInTheDocument()
    })

    it("tells a reader the submission is simply not public rather than broken", () => {
        render(<ProfileChallengeSubmissionPageBase state="ready" onBack={vi.fn()} />)

        expect(screen.getByRole("heading", { name: "Challenge proof not found" })).toBeInTheDocument()
        expect(screen.getByText("This submission is not public.")).toBeInTheDocument()
    })

    it("returns to the owning course listing through the back action", () => {
        const onBack = vi.fn()
        render(
            <ProfileChallengeSubmissionPageBase
                state="ready"
                detail={{ title: "Resilient checkout", courseTitle: "Frontend Engineering" }}
                onBack={onBack}
            />,
        )

        screen.getByRole("button", { name: "← Frontend Engineering" }).click()
        expect(onBack).toHaveBeenCalledOnce()
    })

    it("numbers an unlabelled attempt, withholds Passed from a zero score and keeps an ungraded row factless", () => {
        const { container } = render(
            <ProfileChallengeSubmissionPageBase
                state="ready"
                detail={{
                    title: "Rate limiter",
                    difficulty: "hard",
                    selectedLang: "Go",
                    score: 40,
                    passedAt: "2026-07-28",
                    attempts: [{ score: 0, processedAt: "2026-07-27", shortFeedback: "Timed out" }, { attemptNumber: 2, score: null }],
                    feedbacks: [{ suggestion: "Batch the writes", severity: "moderate" }, {}],
                }}
                onBack={vi.fn()}
            />,
        )

        expect(screen.getByText("Attempt 1")).toBeInTheDocument()
        expect(screen.getByText("2026-07-27 · Timed out")).toBeInTheDocument()
        expect(screen.getByText("Attempt 2")).toBeInTheDocument()
        expect(screen.getByText("Feedback 1")).toBeInTheDocument()
        expect(screen.getByText("Batch the writes")).toBeInTheDocument()
        expect(screen.getByText("Feedback 2")).toBeInTheDocument()
        expect(screen.getByText("hard · Go · score 40 · 2026-07-28")).toBeInTheDocument()
        expect(container.querySelectorAll("[data-component='Badge']")).toHaveLength(2)
    })
})
