import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { LearnShellLayout, useLearnMobileView } from "."

/**
 * What these tests guard.
 *
 * The connected frame resolves NAVIGATION, not the course: which spine row is current comes from the
 * path, and every row's destination is a route this product already has. The two facts a row may
 * carry - the enrolment gate and the viewer's rank - come from queries the frame reads but does not
 * own, so an unanswered query must leave the row plain rather than guessing.
 *
 * The mobile panel set is the other decision. Only the today and reader routes offer a choice, and a
 * panel that stops being valid when the route changes must fall back rather than leaving the frame
 * pointed at a panel this route has no such thing as.
 */

const mocks = vi.hoisted(() => ({
    pathname: "/courses/system-design/learn",
    push: vi.fn(),
    course: undefined as unknown,
    myCourses: undefined as unknown,
    leaderboard: undefined as unknown,
}))
const storage = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn() }))

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Readonly<Record<string, unknown>>) => (
        values === undefined ? key : `${key}:${JSON.stringify(values)}`
    ),
}))
vi.mock("@/i18n/navigation", () => ({
    usePathname: () => mocks.pathname,
    useRouter: () => ({ push: mocks.push }),
}))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => ({ data: mocks.course }) }))
vi.mock("@/hooks/swr/useQueryMyCoursesSwr", () => ({ useQueryMyCoursesSwr: () => ({ data: mocks.myCourses }) }))
vi.mock("@/hooks/swr/useQueryGlobalLeaderboardSwr", () => ({ useQueryGlobalLeaderboardSwr: () => ({ data: mocks.leaderboard }) }))

type SpineRow = { readonly id: string, readonly isCurrent?: boolean, readonly isLocked?: boolean, readonly fact?: string }
type FrameStub = {
    readonly props: {
        readonly spine: {
            readonly home: SpineRow
            readonly groups: ReadonlyArray<{ readonly id: string, readonly rows: ReadonlyArray<SpineRow> }>
            readonly resume?: Readonly<Record<string, unknown>>
            readonly isCollapsed: boolean
        }
        readonly mobileTabs?: ReadonlyArray<{ readonly id: string, readonly isCurrent?: boolean }>
        readonly isFullBleed: boolean
    }
    readonly on?: {
        readonly openRow?: (id: string) => void
        readonly openMobileTab?: (id: string) => void
        readonly resume?: () => void
        readonly toggleCollapse?: () => void
    }
    readonly surface: React.ReactNode
}

vi.mock("./component", () => ({
    LearnShellLayoutBase: (input: FrameStub) => (
        <>
            <output data-testid="spine">{JSON.stringify(input.props.spine)}</output>
            <output data-testid="tabs">{JSON.stringify(input.props.mobileTabs ?? null)}</output>
            <output data-testid="full-bleed">{String(input.props.isFullBleed)}</output>
            <output data-testid="rail-collapsed">{String(input.props.spine.isCollapsed)}</output>
            <button type="button" onClick={() => input.on?.openRow?.("leaderboard")}>row leaderboard</button>
            <button type="button" onClick={() => input.on?.openRow?.("home")}>row home</button>
            <button type="button" onClick={() => input.on?.openRow?.("nonexistent")}>row nonexistent</button>
            <button type="button" onClick={() => input.on?.openMobileTab?.("progress")}>tab progress</button>
            <button type="button" onClick={() => input.on?.openMobileTab?.("outline")}>tab outline</button>
            <button type="button" onClick={input.on?.resume}>resume</button>
            <button type="button" onClick={input.on?.toggleCollapse}>toggle collapse</button>
            {input.surface}
        </>
    ),
}))

/** The routed surface is the only reader of the frame's mobile panel. */
const Surface = () => {
    const view = useLearnMobileView()
    return (
        <div>
            <output data-testid="view">{view.view}</output>
            <button type="button" onClick={() => view.openView("outline")}>surface outline</button>
        </div>
    )
}

const spine = () => JSON.parse(screen.getByTestId("spine").textContent ?? "{}") as FrameStub["props"]["spine"]
const tabs = () => JSON.parse(screen.getByTestId("tabs").textContent ?? "null") as FrameStub["props"]["mobileTabs"]
const rowById = (id: string) => spine().groups.flatMap((group) => group.rows).find((row) => row.id === id)
const home = () => spine().home

const readerPath = "/courses/system-design/learn/content/modules/module-1/contents/content-1"

describe("LearnShellLayout", () => {
    beforeEach(() => {
        mocks.pathname = "/courses/system-design/learn"
        mocks.course = undefined
        mocks.myCourses = undefined
        mocks.leaderboard = undefined
        storage.getItem.mockReturnValue(null)
        Object.defineProperty(window, "localStorage", { configurable: true, value: storage })
        vi.clearAllMocks()
    })

    it("draws the reference product's three groups in their published order", () => {
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)
        expect(spine().groups.map((group) => group.id)).toEqual(["path", "practice", "track"])
        expect(home().id).toBe("home")
        expect(spine().groups[0].rows.map((row) => row.id)).toEqual(["content", "personalProject"])
    })

    it("marks the row whose route the learner is standing on", () => {
        mocks.pathname = "/courses/system-design/learn/flashcards"
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)

        expect(rowById("flashcards")?.isCurrent).toBe(true)
        expect(rowById("content")?.isCurrent).toBe(false)
    })

    it("marks Home only on the bare learn route", () => {
        const { unmount } = render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)
        expect(home().isCurrent).toBe(true)
        unmount()

        mocks.pathname = "/courses/system-design/learn/content"
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)
        expect(home().isCurrent).toBe(false)
        expect(rowById("content")?.isCurrent).toBe(true)
    })

    it("persists the icon rail mode with the legacy storage key", () => {
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)
        expect(screen.getByTestId("rail-collapsed")).toHaveTextContent("false")

        fireEvent.click(screen.getByRole("button", { name: "toggle collapse" }))
        expect(screen.getByTestId("rail-collapsed")).toHaveTextContent("true")
        expect(storage.setItem).toHaveBeenCalledWith("starci.learn.sidebar.collapsed", "true")
    })

    it("leaves the gated rows unlocked until enrolment is actually known", () => {
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)
        expect(rowById("personalProject")?.isLocked).toBe(false)
        expect(rowById("mockInterview")?.isLocked).toBe(false)
    })

    it("locks only the rows that require enrolment once the course says the learner has none", () => {
        mocks.course = { id: "course-1", isEnrolled: false }
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)

        expect(rowById("personalProject")?.isLocked).toBe(true)
        expect(rowById("mockInterview")?.isLocked).toBe(true)
        expect(rowById("flashcards")?.isLocked).toBe(false)
    })

    it("unlocks the gated rows for an enrolled learner", () => {
        mocks.course = { id: "course-1", isEnrolled: true }
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)
        expect(rowById("personalProject")?.isLocked).toBe(false)
    })

    it("carries the viewer's rank on the leaderboard row and nowhere else", () => {
        mocks.leaderboard = { myRank: 12 }
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)

        expect(rowById("leaderboard")?.fact).toBe("#12")
        expect(rowById("flashcards")?.fact).toBeUndefined()
    })

    it("leaves the leaderboard row plain while no rank was answered", () => {
        mocks.leaderboard = { myRank: null }
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)
        expect(rowById("leaderboard")?.fact).toBeUndefined()
    })

    it("offers the resume card only for a course the learner already joined", () => {
        const { unmount } = render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)
        expect(spine().resume).toBeUndefined()
        unmount()

        mocks.course = { id: "course-1" }
        mocks.myCourses = [{ globalId: "course-1", label: "System Design", completionPercent: 40 }]
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)
        expect(spine().resume).toMatchObject({ title: "System Design", percent: 40 })
    })

    it("routes a pressed spine row and ignores a row this frame does not publish", () => {
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)

        fireEvent.click(screen.getByRole("button", { name: "row leaderboard" }))
        expect(mocks.push).toHaveBeenCalledWith("/courses/system-design/learn/leaderboard")

        fireEvent.click(screen.getByRole("button", { name: "row home" }))
        expect(mocks.push).toHaveBeenCalledWith("/courses/system-design/learn")

        mocks.push.mockClear()
        fireEvent.click(screen.getByRole("button", { name: "row nonexistent" }))
        expect(mocks.push).not.toHaveBeenCalled()
    })

    it("sends the resume action back into the reading surface", () => {
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)
        fireEvent.click(screen.getByRole("button", { name: "resume" }))
        expect(mocks.push).toHaveBeenCalledWith("/courses/system-design/learn/content")
    })

    it("offers the three today panels on the course home and opens the one pressed", () => {
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)

        expect(tabs()?.map((tab) => tab.id)).toEqual(["today", "course", "progress"])
        expect(screen.getByTestId("view")).toHaveTextContent("today")

        fireEvent.click(screen.getByRole("button", { name: "tab progress" }))
        expect(screen.getByTestId("view")).toHaveTextContent("progress")
        expect(tabs()?.find((tab) => tab.id === "progress")?.isCurrent).toBe(true)
    })

    it("offers the three reader panels inside one lesson", () => {
        mocks.pathname = readerPath
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)

        expect(tabs()?.map((tab) => tab.id)).toEqual(["contents", "lesson", "outline"])
        expect(screen.getByTestId("view")).toHaveTextContent("lesson")
        fireEvent.click(screen.getByRole("button", { name: "tab outline" }))
        expect(screen.getByTestId("view")).toHaveTextContent("outline")
    })

    it("refuses a panel this route has no such thing as", () => {
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)

        fireEvent.click(screen.getByRole("button", { name: "tab outline" }))
        expect(screen.getByTestId("view")).toHaveTextContent("today")
    })

    it("keeps a lesson challenge out of the reader panel set", () => {
        mocks.pathname = `${readerPath}/challenges/challenge-1`
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)

        expect(tabs()).toBeNull()
        expect(screen.getByTestId("view")).toHaveTextContent("course")
    })

    it("falls back to the route's own panel when navigation invalidates the open one", () => {
        mocks.pathname = readerPath
        const { rerender } = render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)

        fireEvent.click(screen.getByRole("button", { name: "surface outline" }))
        expect(screen.getByTestId("view")).toHaveTextContent("outline")

        mocks.pathname = "/courses/system-design/learn"
        rerender(<LearnShellLayout displayId="system-design" surface={<Surface />} />)
        expect(screen.getByTestId("view")).toHaveTextContent("today")
    })

    it("gives a live assessment the whole frame without course furniture", () => {
        mocks.pathname = "/courses/system-design/learn/mock-interview/interview/session-1"
        const { unmount } = render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)
        expect(screen.getByTestId("full-bleed").textContent).toBe("true")
        unmount()

        mocks.pathname = "/courses/system-design/learn/mock-interview"
        render(<LearnShellLayout displayId="system-design" surface={<Surface />} />)
        expect(screen.getByTestId("full-bleed").textContent).toBe("false")
    })

    it("refuses to be read outside the frame that owns the panel", () => {
        expect(() => render(<Surface />)).toThrowError("useLearnMobileView must be used inside LearnShellLayout")
    })
})
