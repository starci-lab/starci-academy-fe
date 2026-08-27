/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useMutateClaimWeeklyChallengeRewardSwr, useQueryWeeklyChallengeSwr } from "@/hooks"
import { WeeklyChallengeCard } from "./index"

/**
 * What these tests guard - that one control means two different things and never the wrong one.
 *
 * The same button either opens the challenge or collects a reward, and which it is depends on two
 * server flags that do not imply each other. Pressing it is asserted in every combination: an
 * unfinished challenge must navigate and must not spend a claim, and a finished unclaimed one must
 * claim and then re-read the week.
 */

const push = vi.fn()

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) =>
        values === undefined ? key : `${key}:${Object.values(values).join(",")}`,
    useLocale: () => "en",
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({
    useQueryWeeklyChallengeSwr: vi.fn(),
    useMutateClaimWeeklyChallengeRewardSwr: vi.fn(),
}))

/** The instant every relative label in these tests is measured against. */
const NOW = new Date("2026-09-10T12:00:00.000Z")

/** One settled SWR answer, shaped the way the barrel hook returns it. */
const answer = (over: Partial<{ data: unknown, error: unknown, mutate: () => void }>) => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
    ...over,
}) as never

/** One featured weekly challenge as the server sends it. */
const challenge = (over: Partial<Record<string, unknown>> = {}) => ({
    challengeGlobalId: "chal-1",
    title: "Build a parser",
    weekEndAt: "2026-09-12T15:00:00.000Z",
    passedCount: 12,
    viewerPassed: false,
    claimed: false,
    coinReward: 50,
    leaderboard: [],
    ...over,
})

beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(NOW)
})

afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.clearAllMocks()
})

describe("WeeklyChallengeCard", () => {
    it("offers the request again when the week could not be read", () => {
        const mutate = vi.fn()
        vi.mocked(useQueryWeeklyChallengeSwr).mockReturnValue(answer({ error: new Error("down"), mutate }))
        vi.mocked(useMutateClaimWeeklyChallengeRewardSwr).mockReturnValue({ trigger: vi.fn() } as never)

        render(<WeeklyChallengeCard />)
        expect(screen.getByText("failed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mutate).toHaveBeenCalledOnce()
    })

    it("keeps showing the challenge it already has when a refresh fails", () => {
        vi.mocked(useQueryWeeklyChallengeSwr).mockReturnValue(answer({ error: new Error("stale"), data: challenge() }))
        vi.mocked(useMutateClaimWeeklyChallengeRewardSwr).mockReturnValue({ trigger: vi.fn() } as never)

        render(<WeeklyChallengeCard />)
        expect(screen.getByText("Build a parser")).toBeInTheDocument()
        expect(screen.queryByText("failed")).toBeNull()
    })

    it("draws a resting card, with no countdown to read, while the week is on its way", () => {
        vi.mocked(useQueryWeeklyChallengeSwr).mockReturnValue(answer({ data: undefined }))
        vi.mocked(useMutateClaimWeeklyChallengeRewardSwr).mockReturnValue({ trigger: vi.fn() } as never)

        render(<WeeklyChallengeCard />)
        expect(screen.queryByText(/^endsIn:/)).toBeNull()
        expect(screen.queryByText("empty")).toBeNull()
        expect(screen.getByText("title")).toBeInTheDocument()
    })

    it("says there is no challenge this week, and the offer to try does nothing", () => {
        vi.mocked(useQueryWeeklyChallengeSwr).mockReturnValue(answer({ data: null }))
        vi.mocked(useMutateClaimWeeklyChallengeRewardSwr).mockReturnValue({ trigger: vi.fn() } as never)

        render(<WeeklyChallengeCard />)
        expect(screen.getByText("empty")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "tryNow" }))
        expect(push).not.toHaveBeenCalled()
    })

    it("counts the week down in whole days and hours and opens the challenge", () => {
        vi.mocked(useQueryWeeklyChallengeSwr).mockReturnValue(answer({ data: challenge() }))
        vi.mocked(useMutateClaimWeeklyChallengeRewardSwr).mockReturnValue({ trigger: vi.fn() } as never)

        render(<WeeklyChallengeCard />)
        expect(screen.getByText("endsIn:2,3")).toBeInTheDocument()
        expect(screen.getByText("passedCount:12")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "tryNow" }))
        expect(push).toHaveBeenCalledWith("/challenges/chal-1")
    })

    it("floors an already-finished week at zero instead of counting backwards", () => {
        vi.mocked(useQueryWeeklyChallengeSwr).mockReturnValue(answer({
            data: challenge({ weekEndAt: "2026-09-01T00:00:00.000Z" }),
        }))
        vi.mocked(useMutateClaimWeeklyChallengeRewardSwr).mockReturnValue({ trigger: vi.fn() } as never)

        render(<WeeklyChallengeCard />)
        expect(screen.getByText("endsIn:0,0")).toBeInTheDocument()
    })

    it("shows the reward as a badge, and no control, once it has been collected", () => {
        vi.mocked(useQueryWeeklyChallengeSwr).mockReturnValue(answer({
            data: challenge({ viewerPassed: true, claimed: true }),
        }))
        vi.mocked(useMutateClaimWeeklyChallengeRewardSwr).mockReturnValue({ trigger: vi.fn() } as never)

        render(<WeeklyChallengeCard />)
        expect(screen.getByText("claimed")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: /^claim:/ })).toBeNull()
    })

    it("opens the challenge rather than claiming when the reader has not passed it", () => {
        const trigger = vi.fn()
        vi.mocked(useQueryWeeklyChallengeSwr).mockReturnValue(answer({ data: challenge({ claimed: false }) }))
        vi.mocked(useMutateClaimWeeklyChallengeRewardSwr).mockReturnValue({ trigger } as never)

        render(<WeeklyChallengeCard />)
        fireEvent.click(screen.getByRole("button", { name: "tryNow" }))
        expect(trigger).not.toHaveBeenCalled()
        expect(push).toHaveBeenCalledWith("/challenges/chal-1")
    })

    it("claims the reward and re-reads the week once the reader has passed", async () => {
        const trigger = vi.fn().mockResolvedValue({})
        const mutate = vi.fn()
        vi.mocked(useQueryWeeklyChallengeSwr).mockReturnValue(answer({
            data: challenge({ viewerPassed: true, claimed: false }),
            mutate,
        }))
        vi.mocked(useMutateClaimWeeklyChallengeRewardSwr).mockReturnValue({ trigger } as never)

        render(<WeeklyChallengeCard />)
        fireEvent.click(screen.getByRole("button", { name: "claim:50" }))

        await waitFor(() => expect(trigger).toHaveBeenCalledOnce())
        await waitFor(() => expect(mutate).toHaveBeenCalledOnce())
        expect(push).not.toHaveBeenCalled()
    })

    it("offers a zero reward rather than a blank one when the server names no coins", () => {
        vi.mocked(useQueryWeeklyChallengeSwr).mockReturnValue(answer({
            data: challenge({ viewerPassed: true, claimed: false, coinReward: null }),
        }))
        vi.mocked(useMutateClaimWeeklyChallengeRewardSwr).mockReturnValue({ trigger: vi.fn() } as never)

        render(<WeeklyChallengeCard />)
        expect(screen.getByRole("button", { name: "claim:0" })).toBeInTheDocument()
    })

    it("lists at most five finishers and dates each by how long ago they passed", () => {
        vi.mocked(useQueryWeeklyChallengeSwr).mockReturnValue(answer({
            data: challenge({
                leaderboard: [
                    { username: "ada", passedAt: "2026-09-10T11:30:00.000Z" },
                    { username: "grace", passedAt: "2026-09-10T09:00:00.000Z" },
                    { username: "alan", passedAt: "2026-09-08T12:00:00.000Z" },
                    { username: "edsger", passedAt: "2026-09-10T11:00:00.000Z" },
                    { username: "barbara", passedAt: "2026-09-10T10:00:00.000Z" },
                    { username: "linus", passedAt: "2026-09-07T12:00:00.000Z" },
                ],
            }),
        }))
        vi.mocked(useMutateClaimWeeklyChallengeRewardSwr).mockReturnValue({ trigger: vi.fn() } as never)

        const { container } = render(<WeeklyChallengeCard />)
        expect(container.querySelectorAll("img[alt]")).toHaveLength(5)
        expect(screen.queryByText("linus")).toBeNull()
        // Under an hour is counted in minutes, under a day in hours, and beyond that in days.
        expect(screen.getByText("30 minutes ago")).toBeInTheDocument()
        expect(screen.getByText("3 hours ago")).toBeInTheDocument()
        expect(screen.getByText("2 days ago")).toBeInTheDocument()
    })
})
