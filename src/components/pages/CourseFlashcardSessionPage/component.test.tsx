import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
    _CourseFlashcardSessionPage,
    type CourseFlashcardSessionPageActions,
    type CourseFlashcardSessionPageData,
    type CourseFlashcardSessionPageProps,
} from "./component"

/**
 * What these tests guard: a live session that only ever offers the controls its own state admits.
 * The answer stays hidden until the reader asks for it, the four SM-2 grades belong to review while
 * quiz gets a two-way verdict, transport states say so out loud, and a session that expired or
 * failed keeps nothing but what happened and one way back - a grade pressed against a dead session
 * is a rating the backend will refuse.
 */

const card: CourseFlashcardSessionPageData = {
    mode: "review",
    title: "Study cards",
    progressText: "Card 1 of 12",
    deckTitle: "Core deck",
    level: "B1",
    prompt: "What is CQRS?",
    answer: "Command Query Responsibility Segregation",
    answerVisible: true,
    revealLabel: "Reveal answer",
    againLabel: "Again",
    hardLabel: "Hard",
    goodLabel: "Good",
    easyLabel: "Easy",
    correctLabel: "I got it",
    incorrectLabel: "Needs review",
    syncingLabel: "Saving your progress",
    completingLabel: "Completing the session",
    expiredText: "This session expired",
    failedText: "The session could not be read",
    retryLabel: "Try again",
    leaveLabel: "Leave session",
}

const handlers = (): CourseFlashcardSessionPageActions => ({
    reveal: vi.fn(),
    rate: vi.fn(),
    answerQuiz: vi.fn(),
    retry: vi.fn(),
    leave: vi.fn(),
})

const draw = (
    state: CourseFlashcardSessionPageProps["state"],
    data: Partial<CourseFlashcardSessionPageData> = {},
) => {
    const on = handlers()
    return { on, ...render(<_CourseFlashcardSessionPage state={state} data={{ ...card, ...data }} on={on} />) }
}

describe("_CourseFlashcardSessionPage", () => {
    it("shows the prompt, the deck it came from and how far through the session the reader is", () => {
        const { container } = draw("active")

        expect(container.querySelector("[data-node=\"course-flashcard-session-page\"]")).not.toBeNull()
        expect(screen.getByRole("heading", { name: "Study cards" })).toBeInTheDocument()
        expect(screen.getByText("Core deck")).toBeInTheDocument()
        expect(screen.getByText("Card 1 of 12")).toBeInTheDocument()
        expect(screen.getByText("B1")).toBeInTheDocument()
        expect(screen.getByText("What is CQRS?")).toBeInTheDocument()
        expect(screen.getByText("Command Query Responsibility Segregation")).toBeInTheDocument()
    })

    it("keeps the answer hidden and offers only the reveal until the reader asks for it", () => {
        const { on } = draw("active", { answerVisible: false })

        expect(screen.queryByText("Command Query Responsibility Segregation")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Good" })).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Reveal answer" }))
        expect(on.reveal).toHaveBeenCalledTimes(1)
    })

    it.each([
        ["Again", 0],
        ["Hard", 1],
        ["Good", 2],
        ["Easy", 3],
    ] as const)("sends the %s press to the scheduler as SM-2 grade %i", (label, grade) => {
        const { on } = draw("active")

        fireEvent.click(screen.getByRole("button", { name: label }))
        expect(on.rate).toHaveBeenCalledWith(grade)
    })

    it("marks the recommended grade as the main action and the other three as equal alternatives", () => {
        draw("active")

        expect(screen.getByRole("button", { name: "Good" })).toHaveAttribute("data-variant", "primary")
        expect(screen.getByRole("button", { name: "Again" })).toHaveAttribute("data-variant", "outline")
        expect(screen.getByRole("button", { name: "Hard" })).toHaveAttribute("data-variant", "outline")
        expect(screen.getByRole("button", { name: "Easy" })).toHaveAttribute("data-variant", "outline")
    })

    it.each([
        ["I got it", true],
        ["Needs review", false],
    ] as const)("records the %s press as a quiz verdict of %s", (label, correct) => {
        const { on } = draw("active", { mode: "quiz" })

        fireEvent.click(screen.getByRole("button", { name: label }))
        expect(on.answerQuiz).toHaveBeenCalledWith(correct)
    })

    it("replaces the four review grades with a two-way verdict once the card is a quiz card", () => {
        draw("active", { mode: "quiz" })

        expect(screen.queryByRole("button", { name: "Good" })).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "I got it" })).toHaveAttribute("data-variant", "primary")
        expect(screen.getByRole("button", { name: "Needs review" })).toHaveAttribute("data-variant", "outline")
    })

    it.each([
        ["syncing", "Saving your progress"],
        ["completing", "Completing the session"],
    ] as const)("announces the %s state and withdraws the card controls while the backend answers", (state, message) => {
        draw(state)

        expect(screen.getByRole("status")).toHaveTextContent(message)
        expect(screen.queryByRole("button", { name: "Good" })).not.toBeInTheDocument()
    })

    it.each([
        ["expired", "This session expired"],
        ["failed", "The session could not be read"],
    ] as const)("replaces an %s session's card and progress with what happened and one way back", (state, message) => {
        const { container, on } = draw(state)

        expect(screen.getByText(message)).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"flashcard-session-card\"]")).toBeNull()
        expect(container.querySelector("[data-node=\"label-with-muted-fact-row\"]")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(on.retry).toHaveBeenCalledTimes(1)
    })

    it("rests the header, the progress and the card while the session is still being read", () => {
        const { container } = draw("pending")

        expect(container.querySelector("[data-component=Heading][data-loading=\"true\"]")).not.toBeNull()
        expect(screen.queryByText("Core deck")).not.toBeInTheDocument()
        expect(screen.queryByText("What is CQRS?")).not.toBeInTheDocument()
        expect(screen.queryByText("Card 1 of 12")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Reveal answer" })).not.toBeInTheDocument()
    })

    it("drops the deck line entirely when the session carries no deck name to qualify its title", () => {
        const { container } = draw("active", { deckTitle: undefined })

        expect(screen.queryByText("Core deck")).not.toBeInTheDocument()
        expect(container.querySelectorAll("[data-node=\"flashcard-session-header\"] > [data-component=Text]")).toHaveLength(0)
    })

    it("leaves the level fact blank rather than inventing one when the backend reported no level", () => {
        const { container } = draw("active", { level: null })
        const fact = container.querySelector("[data-node=\"label-with-muted-fact-row\"] [data-size=\"xs\"]")

        expect(fact).not.toBeNull()
        expect(fact?.textContent).toBe("")
        expect(screen.queryByText("B1")).not.toBeInTheDocument()
    })

    it("keeps the way out of the session reachable even after the session has died", () => {
        const { on } = draw("expired")

        fireEvent.click(screen.getByRole("button", { name: "Leave session" }))
        expect(on.leave).toHaveBeenCalledTimes(1)
    })
})
