import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    content: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    module: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    courseOutline: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    reactions: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    comments: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    source: { data: undefined as unknown, error: undefined as unknown, dependencies: {}, mutate: vi.fn() },
    react: { isMutating: false, trigger: vi.fn() },
    submit: { isMutating: false, trigger: vi.fn(() => Promise.resolve({ data: { createComment: { success: true } } })) },
    router: { push: vi.fn() },
    ai: { clearCodeContext: vi.fn(), setCodeContext: vi.fn(), open: vi.fn() },
    view: "lesson" as string,
}))

vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: () => (key: string) => key,
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => mocks.router }))
vi.mock("@/hooks/swr/useQueryContentSwr", () => ({ useQueryContentSwr: () => mocks.content }))
vi.mock("@/hooks/swr/useQueryModuleSwr", () => ({ useQueryModuleSwr: () => mocks.module }))
vi.mock("@/hooks/swr/useQueryCourseOutlineSwr", () => ({ useQueryCourseOutlineSwr: () => mocks.courseOutline }))
vi.mock("@/hooks/swr/useQueryContentReactionsSwr", () => ({ useQueryContentReactionsSwr: () => mocks.reactions }))
vi.mock("@/hooks/swr/useMutateReactContentSwr", () => ({ useMutateReactContentSwr: () => mocks.react }))
vi.mock("@/hooks/swr/useQueryContentCommentsSwr", () => ({ useQueryContentCommentsSwr: () => mocks.comments }))
vi.mock("@/hooks/swr/useMutateSubmitContentCommentSwr", () => ({ useMutateSubmitContentCommentSwr: () => mocks.submit }))
vi.mock("@/hooks/swr/useRepoSandpackFiles", () => ({ useRepoSandpackFiles: () => mocks.source }))
vi.mock("@/components/product-shells/LearnShellLayout", () => ({ useLearnMobileView: () => ({ view: mocks.view }) }))
vi.mock("@/components/product-shells/GlobalAiChatLayout", () => ({ useGlobalAiChat: () => mocks.ai }))

type MockBlockActions = {
    readonly goCourse: () => void
    readonly goModule: () => void
    readonly changePage: (page: number) => void
    readonly changeDiscussionDraft: (value: string) => void
    readonly submitDiscussion: () => void
    readonly retryDiscussion: () => void
    readonly selectChallenge: () => void
    readonly act?: () => void
}

type MockBlockProps = {
    readonly blockState: string
    readonly on: MockBlockActions
}

vi.mock("./component", () => ({
    CourseLearnContentBlockBase: ({ blockState, on }: MockBlockProps) => (
        <div>
            <output data-testid="state">{blockState}</output>
            <button onClick={() => on.goCourse()}>course</button>
            <button onClick={() => on.goModule()}>module</button>
            <button onClick={() => on.changePage(2)}>next</button>
            <button onClick={() => on.changeDiscussionDraft("hello")}>draft</button>
            <button onClick={() => on.submitDiscussion()}>submit</button>
            <button onClick={() => on.retryDiscussion()}>retry</button>
            <button onClick={() => on.selectChallenge()}>challenge</button>
            <button onClick={() => on.act?.()}>act</button>
        </div>
    ),
}))

import { CourseLearnContentBlock } from "./index"

describe("CourseLearnContentBlock", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.content.data = undefined
        mocks.content.error = undefined
        mocks.module.data = undefined
        mocks.module.error = undefined
        mocks.courseOutline.data = undefined
        mocks.courseOutline.error = undefined
        mocks.reactions.data = undefined
        mocks.reactions.error = undefined
        mocks.comments.data = undefined
        mocks.comments.error = undefined
        mocks.source.data = undefined
        mocks.source.error = undefined
        mocks.view = "lesson"
    })

    it("renders pending, failed, and locked states with recovery actions", async () => {
        const input = { displayId: "course", moduleId: "module", contentId: "content" }
        const view = render(<CourseLearnContentBlock {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent("pending")

        mocks.content.error = new Error("offline")
        view.rerender(<CourseLearnContentBlock {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent("failed")
        fireEvent.click(screen.getByText("act"))
        expect(mocks.content.mutate).toHaveBeenCalled()

        mocks.content.error = undefined
        mocks.content.data = { id: "content", title: "Premium", body: "# hidden", isPremium: true, challenges: [] }
        view.rerender(<CourseLearnContentBlock {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent("locked")
        fireEvent.click(screen.getByText("act"))
        expect(mocks.router.push).toHaveBeenCalledWith("/courses/course")
        await waitFor(() => expect(mocks.ai.clearCodeContext).toHaveBeenCalled())
    })

    it("wires ready navigation, discussion, reactions, and source branches", async () => {
        mocks.content.data = {
            id: "content",
            title: "Lesson",
            body: "## Intro\n### Detail",
            isPremium: false,
            isSandbox: true,
            githubBaseUrl: "https://github.test",
            githubDir: "/src",
            challenges: [{ id: "challenge", title: "Try", orderIndex: 1 }],
        }
        mocks.module.data = { id: "module", title: "Module", numContents: 2, contents: [{ id: "content", title: "Lesson", orderIndex: 1 }, { id: "next", title: "Next", orderIndex: 2 }] }
        mocks.courseOutline.data = { modules: [], progress: { lessonsRead: 1, lessonsTotal: 2 } }
        mocks.reactions.data = { total: 1, myReaction: null }
        mocks.comments.data = { comments: [] }
        mocks.source.data = { files: { "main.ts": "const x = 1" } }
        const view = render(<CourseLearnContentBlock displayId="course" moduleId="module" contentId="content" />)
        expect(screen.getByTestId("state")).toHaveTextContent("ready")
        fireEvent.click(screen.getByText("course"))
        fireEvent.click(screen.getByText("module"))
        fireEvent.click(screen.getByText("next"))
        fireEvent.click(screen.getByText("challenge"))
        expect(mocks.router.push).toHaveBeenCalled()

        fireEvent.click(screen.getByText("draft"))
        fireEvent.click(screen.getByText("submit"))
        expect(mocks.submit.trigger).toHaveBeenCalledWith({ contentId: "content", parentCommentId: null, body: "hello" })
        fireEvent.click(screen.getByText("retry"))
        expect(mocks.comments.mutate).toHaveBeenCalled()
        view.unmount()
        await waitFor(() => expect(mocks.ai.clearCodeContext).toHaveBeenCalled())
    })
})
