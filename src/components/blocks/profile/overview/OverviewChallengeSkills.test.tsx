import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useOverviewEvidence } from "./useOverviewEvidence"
import { OverviewChallengeSkills } from "./OverviewChallengeSkills"

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, string | number>) =>
        values === undefined ? key : `${key}:${Object.values(values).join("|")}`,
}))
vi.mock("./useOverviewEvidence", () => ({ useOverviewEvidence: vi.fn() }))

type Challenge = { readonly id: string, readonly difficulty?: string | null, readonly selectedLang?: string | null }

type ChallengeEvidence = { readonly data?: ReadonlyArray<Challenge>, readonly error?: Error, readonly isLoading?: boolean }

const stub = (over: ChallengeEvidence) => {
    vi.mocked(useOverviewEvidence).mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        ...over,
    } as never)
}

const rows = (root: HTMLElement) =>
    Array.from(root.querySelectorAll("[data-node=\"label-fact-over-progress\"]"), (row) => row.textContent)

const headline = (root: HTMLElement) => root.querySelector("[data-node=\"glyph-title-fact-row\"]")?.textContent

afterEach(() => {
    vi.clearAllMocks()
})

describe("OverviewChallengeSkills", () => {
    it("counts every passed challenge and splits the graded ones by difficulty", () => {
        stub({
            data: [
                { id: "a", difficulty: "Easy" },
                { id: "b", difficulty: "Easy" },
                { id: "c", difficulty: "Hard" },
                { id: "d", difficulty: null, selectedLang: null },
            ],
        })
        const { container } = render(<OverviewChallengeSkills />)

        expect(screen.getByRole("heading", { name: "overview.challengeSkills" })).toBeInTheDocument()
        expect(headline(container)).toBe("overview.passed4")
        expect(rows(container)).toEqual(["Easy2", "Hard1"])
        expect(screen.getByRole("progressbar", { name: "Easy" })).toHaveAttribute("aria-valuenow", "50")
        expect(screen.getByRole("progressbar", { name: "Hard" })).toHaveAttribute("aria-valuenow", "25")
        expect(container.textContent).not.toContain("overview.languages")
    })

    it("replaces the difficulty breakdown with the distinct languages the learner solved in", () => {
        stub({
            data: [
                { id: "a", difficulty: "Easy", selectedLang: "typescript" },
                { id: "b", difficulty: "Hard", selectedLang: "typescript" },
                { id: "c", difficulty: "Hard", selectedLang: "python" },
            ],
        })
        const { container } = render(<OverviewChallengeSkills />)

        expect(screen.getByText("overview.languages:2|typescript · python")).toBeInTheDocument()
        expect(rows(container)).toEqual([])
        expect(container.textContent).not.toContain("overview.passed")
    })

    it("rests one difficulty peer and withholds the total while the evidence is in flight", () => {
        stub({ isLoading: true })
        const { container } = render(<OverviewChallengeSkills />)

        expect(rows(container)).toHaveLength(1)
        expect(headline(container)?.trim()).toBe("overview.passed")
        expect(container.querySelector("[data-node=\"label-fact-over-progress\"] [data-component=\"Text\"]"))
            .toHaveAttribute("data-loading", "true")
    })

    it("says the learner has passed nothing yet when the evidence comes back empty", () => {
        stub({ data: [] })
        const { container } = render(<OverviewChallengeSkills />)

        expect(screen.getByText("evidence.solved-challenges.empty")).toBeInTheDocument()
        expect(rows(container)).toEqual([])
        expect(container.textContent).not.toContain("overview.passed")
    })

    it("says the challenge evidence failed instead of reporting zero passes", () => {
        stub({ error: new Error("down") })
        const { container } = render(<OverviewChallengeSkills />)

        expect(screen.getByText("evidence.error")).toBeInTheDocument()
        expect(container.textContent).not.toContain("evidence.solved-challenges.empty")
        expect(rows(container)).toEqual([])
    })
})
