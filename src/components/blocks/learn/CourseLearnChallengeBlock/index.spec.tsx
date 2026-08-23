import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestBlockInput = { blockState: string }

const mocks = vi.hoisted(() => ({
    content: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    course: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    outline: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    progress: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    submission: { data: undefined as unknown, error: undefined as unknown, isMutating: false, trigger: vi.fn() },
    push: vi.fn(),
    replace: vi.fn(),
}))

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push, replace: mocks.replace }) }))
vi.mock("@/hooks/swr/useQueryContentSwr", () => ({ useQueryContentSwr: () => mocks.content }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryCourseOutlineSwr", () => ({ useQueryCourseOutlineSwr: () => mocks.outline }))
vi.mock("@/hooks/swr/useQueryContentChallengeProgressSwr", () => ({ useQueryContentChallengeProgressSwr: () => mocks.progress }))
vi.mock("@/hooks/swr/useMutateSubmitContentChallengeSwr", () => ({ useMutateSubmitContentChallengeSwr: () => mocks.submission }))
vi.mock("./component", () => ({ CourseLearnChallengeBlockBase: ({ blockState }: TestBlockInput) => <output data-testid="state">{blockState}</output> }))

import { CourseLearnChallengeBlock } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.content.data = undefined
    mocks.content.error = undefined
    mocks.course.data = undefined
    mocks.course.error = undefined
    mocks.outline.data = undefined
    mocks.outline.error = undefined
    mocks.progress.data = undefined
    mocks.progress.error = undefined
    mocks.submission.error = undefined
    mocks.submission.isMutating = false
})

describe("CourseLearnChallengeBlock", () => {
    it("renders loading while dependent challenge data is unresolved", () => {
        const input = { displayId: "course", contentId: "content", moduleId: "module", challengeId: "challenge" }
        const view = render(<CourseLearnChallengeBlock {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent(/pending|loading|connecting/)
        mocks.content.error = new Error("offline")
        view.rerender(<CourseLearnChallengeBlock {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent(/pending|loading|failed|error/)
    })
})
