import {fireEvent, render, screen, waitFor} from "@testing-library/react"
import {beforeEach, describe, expect, it, vi} from "vitest"

const mocks = vi.hoisted(() => ({
    content: {data: undefined as unknown, error: undefined as unknown, mutate: vi.fn()},
    module: {data: undefined as unknown, error: undefined as unknown, mutate: vi.fn()},
    outline: {data: undefined as unknown, error: undefined as unknown, mutate: vi.fn()},
    reactions: {data: undefined as unknown, error: undefined as unknown, mutate: vi.fn()},
    comments: {data: undefined as unknown, error: undefined as unknown, mutate: vi.fn()},
    source: {data: undefined as unknown, error: undefined as unknown, dependencies: {}, mutate: vi.fn()},
    react: {isMutating: false, trigger: vi.fn()},
    submit: {isMutating: false, trigger: vi.fn(() => Promise.resolve({data: {createComment: {success: true}}}))},
    router: {push: vi.fn()},
    ai: {clearCodeContext: vi.fn(), setCodeContext: vi.fn(), open: vi.fn()},
    view: "lesson" as string,
}))

vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: () => (key: string) => key,
}))
vi.mock("@/i18n/navigation", () => ({useRouter: () => mocks.router}))
vi.mock("@/hooks/swr/useQueryContentSwr", () => ({useQueryContentSwr: () => mocks.content}))
vi.mock("@/hooks/swr/useQueryModuleSwr", () => ({useQueryModuleSwr: () => mocks.module}))
vi.mock("@/hooks/swr/useQueryCourseOutlineSwr", () => ({useQueryCourseOutlineSwr: () => mocks.outline}))
vi.mock("@/hooks/swr/useQueryContentReactionsSwr", () => ({useQueryContentReactionsSwr: () => mocks.reactions}))
vi.mock("@/hooks/swr/useMutateReactContentSwr", () => ({useMutateReactContentSwr: () => mocks.react}))
vi.mock("@/hooks/swr/useQueryContentCommentsSwr", () => ({useQueryContentCommentsSwr: () => mocks.comments}))
vi.mock("@/hooks/swr/useMutateSubmitContentCommentSwr", () => ({useMutateSubmitContentCommentSwr: () => mocks.submit}))
vi.mock("@/hooks/swr/useRepoSandpackFiles", () => ({useRepoSandpackFiles: () => mocks.source}))
vi.mock("@/components/layouts/LearnShellLayout", () => ({useLearnMobileView: () => ({view: mocks.view})}))
vi.mock("@/components/layouts/GlobalAiChatLayout", () => ({useGlobalAiChat: () => mocks.ai}))

type MockPageActions = {
    readonly goCourse: () => void
    readonly goModule: () => void
    readonly changePage: (page: number) => void
    readonly changeDiscussionDraft: (value: string) => void
    readonly submitDiscussion: () => void
    readonly retryDiscussion: () => void
    readonly searchContent: (query: string) => void
    readonly selectChallenge: () => void
    readonly act?: () => void
}

type MockPageProps = {
    readonly state: string
    readonly props: {
        readonly title?: string
        readonly description?: string
        readonly facts?: ReadonlyArray<string>
        readonly noticeActionLabel?: string
        readonly courseProgress?: { readonly value: number, readonly total: number }
        readonly modules?: ReadonlyArray<{ readonly id: string, readonly title: string }>
    }
    readonly on: MockPageActions
}

vi.mock("./component", () => {
    const renderMockPage = ({state, props, on}: MockPageProps) => (
        <div>
            <output data-testid="state">{state}</output>
            <output data-testid="title">{props.title}</output>
            <output data-testid="description">{props.description}</output>
            <output data-testid="facts">{props.facts?.join(" · ")}</output>
            <output data-testid="progress">{props.courseProgress === undefined ? "" : `${props.courseProgress.value}/${props.courseProgress.total}`}</output>
            <output data-testid="modules">{props.modules?.map((module) => module.title).join("|")}</output>
            <button onClick={() => on.goCourse()}>course</button>
            <button onClick={() => on.goModule()}>module</button>
            <button onClick={() => on.changePage(2)}>next</button>
            <button onClick={() => on.changeDiscussionDraft("hello")}>draft</button>
            <button onClick={() => on.submitDiscussion()}>submit</button>
            <button onClick={() => on.retryDiscussion()}>retry</button>
            <button onClick={() => on.searchContent("database")}>search</button>
            <button onClick={() => on.selectChallenge()}>challenge</button>
            {props.noticeActionLabel && <button onClick={() => on.act?.()}>{props.noticeActionLabel}</button>}
        </div>
    )
    return {CourseLearnContentPageBase: renderMockPage}
})

import {CourseLearnContentPage} from "./index"

describe("CourseLearnContentPage route", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.content.data = undefined
        mocks.content.error = undefined
        mocks.module.data = undefined
        mocks.module.error = undefined
        mocks.outline.data = undefined
        mocks.outline.error = undefined
        mocks.reactions.data = undefined
        mocks.reactions.error = undefined
        mocks.comments.data = undefined
        mocks.comments.error = undefined
        mocks.source.data = undefined
        mocks.source.error = undefined
        mocks.view = "lesson"
    })

    it("renders pending, failed, and locked states with recovery actions", async () => {
        const input = {displayId: "course", moduleId: "module", contentId: "content"}
        const view = render(<CourseLearnContentPage {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent("pending")

        mocks.content.error = new Error("offline")
        view.rerender(<CourseLearnContentPage {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent("failed")
        fireEvent.click(screen.getByText("failedAction"))
        expect(mocks.content.mutate).toHaveBeenCalled()

        mocks.content.error = undefined
        mocks.content.data = {id: "content", title: "Premium", body: "# hidden", isPremium: true, challenges: []}
        view.rerender(<CourseLearnContentPage {...input} />)
        expect(screen.getByTestId("state")).toHaveTextContent("locked")
        fireEvent.click(screen.getByText("lockedAction"))
        expect(mocks.router.push).toHaveBeenCalledWith("/courses/course")
        await waitFor(() => expect(mocks.ai.clearCodeContext).toHaveBeenCalled())
    })

    it("wires ready navigation, discussion, reactions, and source branches", async () => {
        mocks.content.data = {
            id: "content", title: "Lesson", body: "## Intro\n### Detail", isPremium: false,
            isSandbox: true, githubBaseUrl: "https://github.test", githubDir: "/src", challenges: [{id: "challenge", title: "Try", orderIndex: 1}],
        }
        mocks.module.data = {id: "module", title: "Module", numContents: 2, contents: [{id: "content", title: "Lesson", orderIndex: 1}, {id: "next", title: "Next", orderIndex: 2}]}
        mocks.outline.data = {
            progress: {lessonsRead: 12, lessonsTotal: 95},
            modules: [
                {id: "module", title: "Backend", lessons: [{id: "content", title: "Lesson", minutesRead: 20, isRead: true}]},
                {id: "database-module", title: "Database", lessons: [{id: "database-lesson", title: "Indexes", minutesRead: 18, isRead: false}]},
            ],
        }
        mocks.reactions.data = {total: 1, myReaction: null}
        mocks.comments.data = {comments: []}
        mocks.source.data = {files: {"main.ts": "const x = 1"}}
        const view = render(<CourseLearnContentPage displayId="course" moduleId="module" contentId="content" />)
        expect(screen.getByTestId("state")).toHaveTextContent("ready")
        expect(screen.getByTestId("progress")).toHaveTextContent("12/95")
        expect(screen.getByTestId("modules")).toHaveTextContent("Backend|Database")
        fireEvent.click(screen.getByText("course"))
        fireEvent.click(screen.getByText("module"))
        fireEvent.click(screen.getByText("next"))
        fireEvent.click(screen.getByText("challenge"))
        fireEvent.click(screen.getByText("search"))
        expect(screen.getByTestId("modules")).toHaveTextContent("Database")
        expect(mocks.router.push).toHaveBeenCalled()

        fireEvent.click(screen.getByText("draft"))
        fireEvent.click(screen.getByText("submit"))
        expect(mocks.submit.trigger).toHaveBeenCalledWith({contentId: "content", parentCommentId: null, body: "hello"})
        fireEvent.click(screen.getByText("retry"))
        expect(mocks.comments.mutate).toHaveBeenCalled()
        view.unmount()
        await waitFor(() => expect(mocks.ai.clearCodeContext).toHaveBeenCalled())
    })
})
