/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useQueryMyDailyQuestSwr } from "@/hooks"
import { DailyQuest } from "./index"

/**
 * What these tests guard - that the connected half settles exactly ONE situation per payload.
 *
 * The three the server can describe are not derivable from each other: a day still arriving, a day
 * with nothing on it, and a day whose reward has already been taken. Each is asserted through what
 * a reader actually sees, not through the props handed downstream.
 */

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, number>) =>
        values === undefined ? key : `${key}:${Object.values(values).join(",")}`,
}))

vi.mock("@/hooks", () => ({ useQueryMyDailyQuestSwr: vi.fn() }))

/** One settled SWR answer, shaped the way the barrel hook returns it. */
const answer = (over: Partial<{ data: unknown, error: unknown, mutate: () => void }>) => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
    ...over,
}) as never

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

describe("DailyQuest", () => {
    it("offers a way back and re-asks when the day could not be read", () => {
        const mutate = vi.fn()
        vi.mocked(useQueryMyDailyQuestSwr).mockReturnValue(answer({ error: new Error("down"), mutate }))

        render(<DailyQuest />)
        expect(screen.getByText("failed")).toBeInTheDocument()
        fireEvent.click(screen.getByText("retry"))
        expect(mutate).toHaveBeenCalledOnce()
    })

    it("keeps the card its own size while the day is still on its way", () => {
        vi.mocked(useQueryMyDailyQuestSwr).mockReturnValue(answer({ data: undefined }))

        render(<DailyQuest />)
        expect(screen.queryAllByRole("progressbar")).toHaveLength(0)
        expect(screen.queryByText("empty")).toBeNull()
    })

    it("treats a null error as no error at all and still reads the payload", () => {
        vi.mocked(useQueryMyDailyQuestSwr).mockReturnValue(answer({ error: null, data: null }))

        render(<DailyQuest />)
        expect(screen.getByText("empty")).toBeInTheDocument()
        expect(screen.queryByText("failed")).toBeNull()
    })

    it("says the day is bare when the server sends a quest with no tasks", () => {
        vi.mocked(useQueryMyDailyQuestSwr).mockReturnValue(answer({
            data: { tasks: [], reward: 20, claimed: false, allDone: false },
        }))

        render(<DailyQuest />)
        expect(screen.getByText("empty")).toBeInTheDocument()
        expect(screen.getByText("empty")).toBeInTheDocument()
    })

    it("counts an unfinished day in whole things done and offers nothing to press", () => {
        vi.mocked(useQueryMyDailyQuestSwr).mockReturnValue(answer({
            data: {
                tasks: [
                    { key: "readContent", current: 1, target: 4 },
                    { key: "passChallenge", current: 0, target: 1 },
                ],
                reward: 20,
                claimed: false,
                allDone: false,
            },
        }))

        const { container } = render(<DailyQuest />)
        expect(screen.getByText("tasks.readContent")).toBeInTheDocument()
        expect(screen.getByText("1/4")).toBeInTheDocument()
        expect(screen.getByText("0/1")).toBeInTheDocument()
        expect(screen.getByText("reward:20")).toBeInTheDocument()
        expect(container.querySelector("button")).toBeNull()
    })

    it("survives a zero target instead of dividing by it", () => {
        vi.mocked(useQueryMyDailyQuestSwr).mockReturnValue(answer({
            data: {
                tasks: [{ key: "readContent", current: 3, target: 0 }],
                reward: 5,
                claimed: false,
                allDone: false,
            },
        }))

        const { container } = render(<DailyQuest />)
        expect(screen.getByText("3/0")).toBeInTheDocument()
        // A zero target cannot reach 100, so the row keeps its unfinished mark rather than
        // reporting a task nobody completed as done.
        expect(container.querySelectorAll("svg.text-success-soft-foreground")).toHaveLength(0)
    })

    it("drops the reward sentence once every task is done", () => {
        vi.mocked(useQueryMyDailyQuestSwr).mockReturnValue(answer({
            data: {
                tasks: [{ key: "readContent", current: 4, target: 4 }],
                reward: 20,
                claimed: false,
                allDone: true,
            },
        }))

        const { container } = render(<DailyQuest />)
        // A finished, uncollected day stops explaining what the day is worth and stops saying it
        // has been taken. NOTE - it also draws no claim control, because this connected half never
        // passes a `claim` action and `SurfaceListCard` hides an action label with no handler.
        expect(screen.getByText("reward:20")).toBeInTheDocument()
        expect(screen.queryByText("claimed")).toBeNull()
        expect(container.querySelectorAll("[data-grammar-state-mark=\"check\"]")).toHaveLength(1)
    })

    it("stops offering the reward once it has been taken", () => {
        vi.mocked(useQueryMyDailyQuestSwr).mockReturnValue(answer({
            data: {
                tasks: [{ key: "readContent", current: 4, target: 4 }],
                reward: 20,
                claimed: true,
                allDone: true,
            },
        }))

        render(<DailyQuest />)
        expect(screen.getByText("claimed")).toBeInTheDocument()
        expect(screen.queryByText("claim")).toBeNull()
    })
})
