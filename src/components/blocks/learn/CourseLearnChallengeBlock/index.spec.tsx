import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestBlockInput = {
    readonly blockState: string
    readonly props: Record<string, unknown>
    readonly on: {
        readonly changeUrl?: (id: string, value: string) => void
        readonly saveDraft?: () => void
        readonly reviewAttempt?: () => void
        readonly returnToEdit?: () => void
        readonly submitAttempt?: () => void
        readonly cancelSubmit?: () => void
        readonly confirmSubmit?: () => void
        readonly requestExit?: () => void
        readonly cancelExit?: () => void
        readonly confirmExit?: () => void
        readonly openCourseMap?: () => void
        readonly closeCourseMap?: () => void
        readonly searchCourseMap?: (query: string) => void
        readonly toggleCourseMapModule?: (id: string, isOpen: boolean) => void
        readonly openCourseMapItem?: (id: string) => void
        readonly openModelDrawer?: () => void
        readonly closeModelDrawer?: () => void
        readonly selectDefaultModel?: (id: string) => void
        readonly applyDefaultModel?: () => void
        readonly overrideModel?: (deliverableId: string, modelId: string) => void
        readonly openAi?: () => void
        readonly closeAi?: () => void
        readonly retry?: (id?: string) => void
    }
}

const mocks = vi.hoisted(() => ({
    content: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    course: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    outline: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    progress: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    persistedSubmissions: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    submission: { data: undefined as unknown, error: undefined as unknown, isMutating: false, trigger: vi.fn() },
    draftSync: { error: undefined as unknown, isMutating: false, trigger: vi.fn() },
    globalAi: { isOpen: false, close: vi.fn(), clearCodeContext: vi.fn() },
    push: vi.fn(),
    replace: vi.fn(),
}))

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push, replace: mocks.replace }) }))
vi.mock("@/hooks/swr/useQueryContentSwr", () => ({ useQueryContentSwr: () => mocks.content }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryCourseOutlineSwr", () => ({ useQueryCourseOutlineSwr: () => mocks.outline }))
vi.mock("@/hooks/swr/useQueryContentChallengeProgressSwr", () => ({ useQueryContentChallengeProgressSwr: () => mocks.progress }))
vi.mock("@/hooks/swr/useQueryContentChallengeSubmissionsSwr", () => ({ useQueryContentChallengeSubmissionsSwr: () => mocks.persistedSubmissions }))
vi.mock("@/hooks/swr/useMutateSubmitContentChallengeSwr", () => ({ useMutateSubmitContentChallengeSwr: () => mocks.submission }))
vi.mock("@/hooks/swr/useMutateSyncContentChallengeSwr", () => ({ useMutateSyncContentChallengeSwr: () => mocks.draftSync }))
vi.mock("@/modules/ai/global-ai-chat-context", () => ({ useGlobalAiChat: () => mocks.globalAi }))
vi.mock("./component", () => ({
    CourseLearnChallengeBlockBase: ({ blockState, props, on }: TestBlockInput) => (
        <>
            <output data-testid="state">{blockState}</output>
            <output data-testid="props">{JSON.stringify(props)}</output>
            <button onClick={() => on.changeUrl?.("submission-1", "https://github.com/starci/repo")}>change-url</button>
            <button onClick={on.saveDraft}>save</button>
            <button onClick={on.reviewAttempt}>review</button>
            <button onClick={on.returnToEdit}>edit</button>
            <button onClick={on.submitAttempt}>submit</button>
            <button onClick={on.cancelSubmit}>cancel-submit</button>
            <button onClick={on.confirmSubmit}>confirm-submit</button>
            <button onClick={on.requestExit}>exit</button>
            <button onClick={on.cancelExit}>cancel-exit</button>
            <button onClick={on.confirmExit}>confirm-exit</button>
            <button onClick={on.openCourseMap}>open-map</button>
            <button onClick={on.closeCourseMap}>close-map</button>
            <button onClick={() => on.searchCourseMap?.("lesson")}>search-map</button>
            <button onClick={() => on.toggleCourseMapModule?.("module", false)}>toggle-map</button>
            <button onClick={() => on.openCourseMapItem?.("lesson:content")}>open-map-item</button>
            <button onClick={on.openModelDrawer}>open-models</button>
            <button onClick={on.closeModelDrawer}>close-models</button>
            <button onClick={() => on.selectDefaultModel?.("openai:gpt")}>select-model</button>
            <button onClick={on.applyDefaultModel}>apply-model</button>
            <button onClick={() => on.overrideModel?.("submission-1", "openai:gpt")}>override-model</button>
            <button onClick={on.openAi}>open-ai</button>
            <button onClick={on.closeAi}>close-ai</button>
            <button onClick={() => on.retry?.()}>retry-load</button>
            <button onClick={() => on.retry?.("submission-1")}>retry-submit</button>
        </>
    ),
}))

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
    mocks.persistedSubmissions.data = undefined
    mocks.persistedSubmissions.error = undefined
    mocks.submission.error = undefined
    mocks.submission.isMutating = false
    mocks.draftSync.error = undefined
    mocks.draftSync.isMutating = false
    mocks.draftSync.trigger.mockResolvedValue({ draftRevision: 1 })
    mocks.submission.trigger.mockResolvedValue({ jobId: "job-1", attemptId: "attempt-1" })
    mocks.globalAi.isOpen = false
})

const setReady = () => {
    mocks.content.data = {
        id: "content",
        title: "Lesson",
        bodies: [{ lang: "en" }],
        challenges: [{
            id: "challenge", displayId: "challenge", orderIndex: 1, title: "Challenge", description: "Brief",
            difficulty: "medium", score: 100, hint: "Hint",
            prerequisites: [{ id: "prerequisite-1", orderIndex: 1, sortIndex: 1, langs: [{ lang: "en", orderIndex: 1, sortIndex: 1, text: "Know dependency inversion" }] }],
            requirements: [{ id: "requirement-1", orderIndex: 1, sortIndex: 1, langs: [{ lang: "en", orderIndex: 1, sortIndex: 1, score: 60, title: "Stable port", body: "Keep the contract stable" }] }],
            steps: [{ id: "step-1", orderIndex: 1, sortIndex: 1, langs: [{ lang: "en", orderIndex: 1, sortIndex: 1, title: "Extract interface", body: "Invert the dependency" }] }],
            outputs: [{ id: "output-1", orderIndex: 1, sortIndex: 1, langs: [{ lang: "en", orderIndex: 1, sortIndex: 1, text: "Repository and smoke-test evidence" }] }],
            submissions: [{ id: "submission-1", sortIndex: 1, title: "API", description: "Repository", score: 100 }],
        }],
    }
    mocks.course.data = { id: "course-1", title: "Course" }
    mocks.outline.data = {
        progress: { completionPercent: 50, lessonsRead: 1, lessonsTotal: 2 },
        modules: [{
            id: "module",
            title: "Module",
            lessons: [{
                id: "content", title: "Lesson", minutesRead: 5, isRead: false,
                challenges: [{ id: "challenge", title: "Challenge", maxScore: 100, completed: false }],
            }],
        }],
    }
    mocks.progress.data = [{ id: "challenge", maxScore: 100, completed: false }]
    mocks.persistedSubmissions.data = [{
        id: "submission-1", sortIndex: 1, title: "API", description: "Repository", score: 100,
        userSubmission: { submissionUrl: "", draftRevision: 0, lastAttempt: null },
    }]
}

describe("CourseLearnChallengeBlock", () => {
    it("renders loading while dependent challenge data is unresolved", () => {
        const input = { displayId: "course", contentId: "content", moduleId: "module", challengeId: "challenge" }
        const view = render(<CourseLearnChallengeBlock {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent(/pending|loading|connecting/)
        mocks.content.error = new Error("offline")
        view.rerender(<CourseLearnChallengeBlock {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent(/pending|loading|failed|error/)
    })

    it("persists the complete draft and submits one immutable whole attempt", async () => {
        setReady()
        render(<CourseLearnChallengeBlock displayId="course" contentId="content" moduleId="module" challengeId="challenge" />)
        expect(screen.getByTestId("state")).toHaveTextContent("ready")

        fireEvent.click(screen.getByText("change-url"))
        fireEvent.click(screen.getByText("save"))
        await waitFor(() => expect(mocks.draftSync.trigger).toHaveBeenCalledWith({
            courseId: "course-1",
            request: { id: "submission-1", url: "https://github.com/starci/repo", expectedDraftRevision: 0 },
        }))

        fireEvent.click(screen.getByText("review"))
        expect(screen.getByTestId("props")).toHaveTextContent("\"isReviewing\":true")
        fireEvent.click(screen.getByText("edit"))
        fireEvent.click(screen.getByText("submit"))
        expect(screen.getByTestId("props")).toHaveTextContent("\"isConfirmOpen\":true")
        fireEvent.click(screen.getByText("confirm-submit"))

        await waitFor(() => expect(mocks.submission.trigger).toHaveBeenCalled())
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining("attempt=attempt-1")))
    })

    it("maps the complete authored Challenge taxonomy without deriving it from deliverables", () => {
        setReady()
        render(<CourseLearnChallengeBlock displayId="course" contentId="content" moduleId="module" challengeId="challenge" />)
        const props = screen.getByTestId("props")

        expect(props).toHaveTextContent("Know dependency inversion")
        expect(props).toHaveTextContent("Stable port")
        expect(props).toHaveTextContent("Extract interface")
        expect(props).toHaveTextContent("Repository and smoke-test evidence")
        expect(props).toHaveTextContent("\"expandedRequirementIds\":[\"requirement-1\"]")
        expect(props).toHaveTextContent("\"expandedStepIds\":[\"step-1\"]")
        expect(props).toHaveTextContent("\"deliverables\":[{\"id\":\"submission-1\"")
    })

    it("owns map, exit, model, AI and retry interaction state", async () => {
        setReady()
        render(<CourseLearnChallengeBlock displayId="course" contentId="content" moduleId="module" challengeId="challenge" />)
        fireEvent.click(screen.getByText("change-url"))
        fireEvent.click(screen.getByText("exit"))
        expect(screen.getByTestId("props")).toHaveTextContent("\"isExitConfirmOpen\":true")
        fireEvent.click(screen.getByText("cancel-exit"))
        fireEvent.click(screen.getByText("exit"))
        fireEvent.click(screen.getByText("confirm-exit"))

        fireEvent.click(screen.getByText("open-map"))
        fireEvent.click(screen.getByText("search-map"))
        fireEvent.click(screen.getByText("toggle-map"))
        fireEvent.click(screen.getByText("open-map-item"))
        fireEvent.click(screen.getByText("close-map"))
        fireEvent.click(screen.getByText("open-models"))
        fireEvent.click(screen.getByText("select-model"))
        fireEvent.click(screen.getByText("override-model"))
        fireEvent.click(screen.getByText("apply-model"))
        fireEvent.click(screen.getByText("close-models"))
        fireEvent.click(screen.getByText("open-ai"))
        fireEvent.click(screen.getByText("close-ai"))
        fireEvent.click(screen.getByText("retry-submit"))
        fireEvent.click(screen.getByText("cancel-submit"))
        fireEvent.click(screen.getByText("retry-load"))

        await waitFor(() => expect(mocks.content.mutate).toHaveBeenCalled())
        expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining("/courses/course/learn/content/modules/module/contents/content"))
    })

    it("surfaces optimistic draft conflicts without submitting stale evidence", async () => {
        setReady()
        const conflict = Object.assign(new Error("revision conflict"), { code: "CHALLENGE_DRAFT_REVISION_CONFLICT_EXCEPTION" })
        mocks.draftSync.trigger.mockRejectedValue(conflict)
        render(<CourseLearnChallengeBlock displayId="course" contentId="content" moduleId="module" challengeId="challenge" />)
        fireEvent.click(screen.getByText("change-url"))
        fireEvent.click(screen.getByText("save"))
        await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("conflict"))
        expect(mocks.submission.trigger).not.toHaveBeenCalled()
    })
})
