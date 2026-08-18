import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useOverviewEvidence } from "./useOverviewEvidence"
import { OverviewJobReadiness } from "./OverviewJobReadiness"

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, string | number>) =>
        values === undefined ? key : `${key}:${Object.values(values).join("|")}`,
}))
vi.mock("./useOverviewEvidence", () => ({ useOverviewEvidence: vi.fn() }))

type Track = {
    readonly courseId: string
    readonly courseTitle: string
    readonly capstoneScore: number
    readonly interviewScore: number
    readonly cvScore: number
    readonly depthScore: number
    readonly band: string
}

type Readiness = {
    readonly foundation?: { readonly codingPercentile?: number, readonly cvScore?: number }
    readonly tracks?: ReadonlyArray<Track>
}

const backend: Track = {
    courseId: "backend",
    courseTitle: "Backend track",
    capstoneScore: 72,
    interviewScore: 60,
    cvScore: 40,
    depthScore: 64,
    band: "building",
}

const mutate = vi.fn()

type ReadinessEvidence = { readonly data?: Readiness, readonly error?: Error, readonly isLoading?: boolean }

const stub = (over: ReadinessEvidence) => {
    vi.mocked(useOverviewEvidence).mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate,
        ...over,
    } as never)
}

const pillars = (root: HTMLElement) =>
    Array.from(root.querySelectorAll("[data-node=\"label-fact-over-progress\"]"), (row) => row.textContent)

afterEach(() => {
    vi.clearAllMocks()
})

describe("OverviewJobReadiness", () => {
    it("summarises the deepest track, its band, the percentile and its three pillars", () => {
        stub({
            data: {
                foundation: { codingPercentile: 64 },
                tracks: [
                    { ...backend, courseTitle: "Shallow track", depthScore: 12, band: "needsWork" },
                    backend,
                ],
            },
        })
        const { container } = render(<OverviewJobReadiness />)

        expect(screen.getByRole("heading", { name: "profile.evidence.job-readiness.label" })).toBeInTheDocument()
        expect(container.textContent).toContain("64% · Backend track")
        expect(container.textContent).toContain("jobReadiness.band.building")
        expect(container.textContent).toContain("jobReadiness.foundationPercentile:64")
        expect(container.textContent).not.toContain("Shallow track")
        expect(pillars(container)).toEqual([
            "jobReadiness.metric.capstone72%",
            "jobReadiness.metric.interview60%",
            "jobReadiness.metric.cv40%",
        ])
    })

    it("keeps every out-of-range backend score inside the drawn progress range", () => {
        stub({
            data: {
                tracks: [{
                    ...backend,
                    capstoneScore: 140,
                    interviewScore: -20,
                    cvScore: 66.6,
                    depthScore: 118,
                    band: "jobReady",
                }],
            },
        })
        const { container } = render(<OverviewJobReadiness />)

        expect(pillars(container)).toEqual([
            "jobReadiness.metric.capstone100%",
            "jobReadiness.metric.interview0%",
            "jobReadiness.metric.cv67%",
        ])
        expect(screen.getByRole("progressbar", { name: "jobReadiness.metric.capstone" }))
            .toHaveAttribute("aria-valuenow", "100")
        expect(container.textContent).toContain("100% · Backend track")
        expect(container.textContent).toContain("jobReadiness.band.jobReady")
    })

    it("falls back to the weakest band when the backend reports an unknown one", () => {
        stub({ data: { tracks: [{ ...backend, band: "somethingElse" }] } })
        const { container } = render(<OverviewJobReadiness />)

        expect(container.textContent).toContain("jobReadiness.band.needsWork")
    })

    it("drops the percentile line when the learner has no coding foundation score", () => {
        stub({ data: { foundation: {}, tracks: [backend] } })
        const { container } = render(<OverviewJobReadiness />)

        expect(container.textContent).not.toContain("foundationPercentile")
        expect(pillars(container)).toHaveLength(3)
    })

    it("says the snapshot is empty when the learner has joined no scored track", () => {
        stub({ data: { tracks: [] } })
        const { container } = render(<OverviewJobReadiness />)

        expect(container.textContent).toContain("jobReadiness.empty")
        expect(pillars(container)).toEqual([])
    })

    it("says the snapshot is empty when the evidence carries no tracks at all", () => {
        stub({ data: {} })
        const { container } = render(<OverviewJobReadiness />)

        expect(container.textContent).toContain("jobReadiness.empty")
    })

    it("rests three pillars while the readiness evidence is in flight", () => {
        stub({ isLoading: true })
        const { container } = render(<OverviewJobReadiness />)

        expect(pillars(container)).toHaveLength(3)
        expect(container.textContent).not.toContain("jobReadiness.band.")
        expect(container.textContent).not.toContain("jobReadiness.empty")
    })

    it("says the readiness request failed and refetches it on the retry press", () => {
        stub({ error: new Error("down") })
        const { container } = render(<OverviewJobReadiness />)

        expect(container.textContent).toContain("jobReadiness.error")
        fireEvent.click(screen.getByRole("button", { name: "jobReadiness.retry" }))
        expect(mutate).toHaveBeenCalledOnce()
    })
})
