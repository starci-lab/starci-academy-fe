import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useQueryMyJobReadinessSwr } from "@/hooks"
import { JobReadinessWidget } from "./index"

const push = vi.fn()

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, number>) =>
        values === undefined ? key : `${key}:${Object.values(values).join("|")}`,
}))

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({ useQueryMyJobReadinessSwr: vi.fn() }))

const track = {
    courseId: "backend",
    courseTitle: "Backend track",
    courseSlug: "backend-basics",
    capstoneScore: 72,
    interviewScore: 60,
    cvScore: 40,
    depthScore: 64,
    band: "building",
    isQualified: false,
}

const stub = (over: Record<string, unknown>) => {
    const mutate = vi.fn()
    vi.mocked(useQueryMyJobReadinessSwr).mockReturnValue({
        data: undefined,
        error: undefined,
        mutate,
        ...over,
    } as never)
    return mutate
}

const rows = (root: HTMLElement) =>
    Array.from(root.querySelectorAll("[data-node=\"label-fact-over-progress\"]"), (row) => row.textContent)

afterEach(() => {
    vi.clearAllMocks()
})

describe("JobReadinessWidget", () => {
    it("draws the strongest track, its band, the percentile and the three pillars", () => {
        stub({ data: { foundation: { codingPercentile: 64, cvScore: null }, tracks: [track] } })
        const { container } = render(<JobReadinessWidget />)
        expect(container.querySelector("[data-component=\"SurfaceListCard\"]")?.textContent)
            .toContain("64% · Backend track")
        expect(container.textContent).toContain("band.building")
        expect(container.textContent).toContain("foundationPercentile:64")
        expect(rows(container)).toEqual([
            "metric.capstone72%",
            "metric.interview60%",
            "metric.cv40%",
        ])
    })

    it("routes the action into the strongest track's own course", () => {
        stub({ data: { foundation: { codingPercentile: 64, cvScore: null }, tracks: [track] } })
        render(<JobReadinessWidget />)
        fireEvent.click(screen.getByRole("button", { name: "action" }))
        expect(push).toHaveBeenCalledExactlyOnceWith("/courses/backend-basics")
    })

    it("draws a dash for each pillar the learner has not attempted, and no depth headline", () => {
        stub({
            data: {
                foundation: { codingPercentile: null, cvScore: null },
                tracks: [{ ...track, capstoneScore: null, interviewScore: null, cvScore: null, depthScore: null }],
            },
        })
        const { container } = render(<JobReadinessWidget />)
        expect(rows(container)).toEqual([
            "metric.capstone—",
            "metric.interview—",
            "metric.cv—",
        ])
        expect(container.querySelector("[data-component=\"SurfaceListCard\"]")?.textContent)
            .toContain("Backend track")
        expect(container.textContent).not.toContain("foundationPercentile")
    })

    it("says the snapshot is empty and sends an unranked learner to the catalog", () => {
        stub({ data: { foundation: { codingPercentile: null, cvScore: null }, tracks: [] } })
        const { container } = render(<JobReadinessWidget />)
        expect(container.textContent).toContain("empty")
        fireEvent.click(screen.getByRole("button", { name: "action" }))
        expect(push).toHaveBeenCalledExactlyOnceWith("/courses")
    })

    it("says the request failed and refetches on the retry press", () => {
        const mutate = stub({ error: new Error("down") })
        const { container } = render(<JobReadinessWidget />)
        expect(container.textContent).toContain("error")
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mutate).toHaveBeenCalledOnce()
    })

    it("keeps the settled snapshot on screen when a revalidation fails behind it", () => {
        stub({
            data: { foundation: { codingPercentile: 64, cvScore: null }, tracks: [track] },
            error: new Error("stale"),
        })
        const { container } = render(<JobReadinessWidget />)
        expect(container.textContent).not.toContain("error")
        expect(rows(container)).toHaveLength(3)
    })

    it("rests three pillars while the snapshot is in flight", () => {
        stub({})
        const { container } = render(<JobReadinessWidget />)
        expect(rows(container)).toHaveLength(3)
        expect(container.querySelector("[data-component=\"Button\"]")).toHaveAttribute("data-loading", "true")
        expect(container.textContent).not.toContain("band.")
    })
})
