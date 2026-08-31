/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useLocale } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import { useQueryPersonalTaskAttemptFeedbacksSwr } from "@/hooks/swr/useQueryPersonalTaskAttemptFeedbacksSwr"
import { useQueryPersonalTaskAttemptsSwr } from "@/hooks/swr/useQueryPersonalTaskAttemptsSwr"
import { useQueryJobStatusSwr } from "@/hooks/swr/useQueryJobStatusSwr"
import { PersonalProjectResult } from "./index"

const push = vi.fn()
const replace = vi.fn()
const laterAttempt = { id: "attempt-21", attemptNumber: 21, score: 19, passed: true }
type HistoryDrawerProps = { readonly isOpen: boolean; readonly onSelect?: (attempt: typeof laterAttempt) => void }

vi.mock("next-intl", () => ({ useLocale: vi.fn() }))
vi.mock("next/navigation", () => ({ useSearchParams: vi.fn() }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push, replace }) }))
vi.mock("@/hooks/swr/useQueryCoursePersonalProjectSwr", () => ({ useQueryCoursePersonalProjectSwr: vi.fn() }))
vi.mock("@/hooks/swr/useQueryPersonalTaskAttemptsSwr", () => ({ useQueryPersonalTaskAttemptsSwr: vi.fn() }))
vi.mock("@/hooks/swr/useQueryPersonalTaskAttemptFeedbacksSwr", () => ({ useQueryPersonalTaskAttemptFeedbacksSwr: vi.fn() }))
vi.mock("@/hooks/swr/useQueryJobStatusSwr", () => ({ useQueryJobStatusSwr: vi.fn() }))
vi.mock("@/components/overlays/learn/PersonalProjectHistoryDrawer", () => ({
    PersonalProjectHistoryDrawer: (props: HistoryDrawerProps) => props.isOpen
        ? <button type="button" onClick={() => props.onSelect?.(laterAttempt)}>Choose page 2 attempt</button>
        : null,
}))

const answer = (data: unknown, over: Record<string, unknown> = {}) => ({ data, error: undefined, mutate: vi.fn(), ...over }) as never

afterEach(() => {
    vi.clearAllMocks()
})

describe("PersonalProjectResult", () => {
    it("uses feedback keyed by an attempt selected from a later history page", async () => {
        vi.mocked(useLocale).mockReturnValue("en")
        vi.mocked(useSearchParams).mockReturnValue({ get: () => null } as never)
        vi.mocked(useQueryJobStatusSwr).mockReturnValue(answer(undefined))
        vi.mocked(useQueryCoursePersonalProjectSwr).mockReturnValue(answer({
            course: { id: "course-1", title: "Capstone", displayId: "capstone" },
            milestones: [{ id: "milestone-1", title: "Ship", orderIndex: 0, tasks: [{ id: "task-1", title: "Build", type: "code", maxScore: 20, completed: true, lastScore: 18, numAttempts: 21 }] }],
            progress: { tasksCompleted: 1, tasksTotal: 1, completionPercent: 100 }, currentTask: null,
        }))
        vi.mocked(useQueryPersonalTaskAttemptsSwr).mockReturnValue(answer({ data: [{ id: "attempt-20", attemptNumber: 20, score: 18, passed: true }] , count: 21 }))
        vi.mocked(useQueryPersonalTaskAttemptFeedbacksSwr).mockImplementation((attemptId) => answer([{ id: `feedback-${attemptId}`, message: `feedback for ${attemptId}`, sortIndex: 0 }]))

        render(<PersonalProjectResult displayId="capstone" taskId="task-1" />)
        fireEvent.click(screen.getByRole("button", { name: "Attempt history" }))
        fireEvent.click(screen.getByRole("button", { name: "Choose page 2 attempt" }))

        await waitFor(() => expect(screen.getByText("feedback for attempt-21")).toBeInTheDocument())
        expect(useQueryPersonalTaskAttemptFeedbacksSwr).toHaveBeenLastCalledWith("attempt-21")
        expect(replace).toHaveBeenCalledWith("/courses/capstone/learn/personal-project/tasks/task-1/result?attempt=attempt-21")
    })
})
