import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useOverviewEvidence } from "./useOverviewEvidence"
import { OverviewCodeSkills } from "./OverviewCodeSkills"

vi.mock("next-intl", () => ({
    useTranslations:
    () => (key: string, values?: Record<string, string | number>) =>
        values === undefined ? key : `${key}:${Object.values(values).join("|")}`,
}))
vi.mock("./useOverviewEvidence", () => ({ useOverviewEvidence: vi.fn() }))

type Breakdown = { readonly key: string; readonly solved: number };
type CodingSkills = {
  readonly byLanguage: ReadonlyArray<Breakdown>;
  readonly byDifficulty: ReadonlyArray<Breakdown>;
  readonly byDomain: ReadonlyArray<Breakdown>;
};

type CodingSkillsEvidence = {
  readonly data?: CodingSkills;
  readonly error?: Error;
  readonly isLoading?: boolean;
};

const stub = (over: CodingSkillsEvidence) => {
    vi.mocked(useOverviewEvidence).mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        ...over,
    } as never)
}

const rows = (root: HTMLElement) =>
    Array.from(
        root.querySelectorAll("[role=\"progressbar\"]"),
        (row) => row.parentElement?.textContent,
    )

const headline = (root: HTMLElement) => root.textContent?.match(/overview\.solved\d+/)?.[0]

afterEach(() => {
    vi.clearAllMocks()
})

describe("OverviewCodeSkills", () => {
    it("totals the solved practice problems and shares them out across the difficulty rungs", () => {
        stub({
            data: {
                byLanguage: [],
                byDifficulty: [
                    { key: "Easy", solved: 6 },
                    { key: "Medium", solved: 3 },
                    { key: "Hard", solved: 1 },
                ],
                byDomain: [],
            },
        })
        const { container } = render(<OverviewCodeSkills />)

        expect(
            screen.getByRole("heading", { name: "overview.codeSkills" }),
        ).toBeInTheDocument()
        expect(headline(container)).toContain("solved10")
        expect(rows(container)).toEqual(["Easy6", "Medium3", "Hard1"])
        expect(screen.getByRole("progressbar", { name: "Easy" })).toHaveAttribute(
            "aria-valuenow",
            "60",
        )
        expect(screen.getByRole("progressbar", { name: "Medium" })).toHaveAttribute(
            "aria-valuenow",
            "30",
        )
        expect(screen.getByRole("progressbar", { name: "Hard" })).toHaveAttribute(
            "aria-valuenow",
            "10",
        )
    })

    it("replaces the difficulty rungs with the per-language solved breakdown when one exists", () => {
        stub({
            data: {
                byLanguage: [
                    { key: "typescript", solved: 7 },
                    { key: "python", solved: 3 },
                ],
                byDifficulty: [{ key: "Easy", solved: 10 }],
                byDomain: [],
            },
        })
        const { container } = render(<OverviewCodeSkills />)

        expect(
            screen.getByText("overview.languageBreakdown:typescript 7 · python 3"),
        ).toBeInTheDocument()
        expect(rows(container)).toEqual([])
        expect(container.textContent).not.toContain("overview.solved")
    })

    it("says the practice snapshot is empty when every rung is reported at zero solved", () => {
        stub({
            data: {
                byLanguage: [{ key: "typescript", solved: 0 }],
                byDifficulty: [
                    { key: "Easy", solved: 0 },
                    { key: "Hard", solved: 0 },
                ],
                byDomain: [],
            },
        })
        const { container } = render(<OverviewCodeSkills />)

        expect(
            screen.getByText("evidence.coding-skills.empty"),
        ).toBeInTheDocument()
        expect(container.textContent).not.toContain("overview.languageBreakdown")
        expect(rows(container)).toEqual([])
    })

    it("says the practice snapshot is empty when the evidence carries no breakdown at all", () => {
        stub({})
        const { container } = render(<OverviewCodeSkills />)

        expect(
            screen.getByText("evidence.coding-skills.empty"),
        ).toBeInTheDocument()
        expect(rows(container)).toEqual([])
    })

    it("rests one difficulty peer and withholds the solved total while the request is in flight", () => {
        stub({ isLoading: true })
        const { container } = render(<OverviewCodeSkills />)

        expect(rows(container)).toHaveLength(0)
        expect(container.textContent).toContain("overview.solved")
        expect(screen.queryByRole("progressbar")).toBeNull()
    })

    it("says the practice evidence failed instead of reporting zero solved", () => {
        stub({ error: new Error("down") })
        const { container } = render(<OverviewCodeSkills />)

        expect(screen.getByText("evidence.error")).toBeInTheDocument()
        expect(container.textContent).not.toContain("evidence.coding-skills.empty")
        expect(rows(container)).toEqual([])
    })
})
