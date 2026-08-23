import { act, render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestInput = { state: string; on: { climb: () => void; retry: () => void; open: (id: string) => void; follow: (id: string) => void } }
const mocks = vi.hoisted(() => ({
    input: undefined as TestInput | undefined,
    weekly: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    global: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    me: { data: { username: "me", avatar: null } as unknown },
    follow: vi.fn().mockResolvedValue({ data: { setFollow: { success: true } } }), push: vi.fn(),
}))

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks", () => ({ useQueryMeSwr: () => mocks.me, useQueryMyLeagueSwr: () => mocks.weekly, useQueryGlobalLeaderboardSwr: () => mocks.global, useMutateSetFollowSwr: () => ({ trigger: mocks.follow }) }))
vi.mock("./component", () => ({ LeagueBlockBase: (input: TestInput) => { mocks.input = input; return <output data-testid="league" /> } }))

import { LeagueBlock } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.input = undefined
    mocks.weekly.data = undefined
    mocks.weekly.error = undefined
    mocks.global.data = undefined
    mocks.global.error = undefined
})

describe("LeagueBlock", () => {
    it("maps weekly and global boards and dispatches row actions", () => {
        const view = render(<LeagueBlock scope="weekly" />)
        expect(mocks.input?.state).toBe("pending")
        mocks.weekly.data = { weekEndAt: new Date(Date.now() + 1000).toISOString(), entries: [] }
        view.rerender(<LeagueBlock scope="weekly" />)
        expect(mocks.input?.state).toBe("empty")
        mocks.weekly.data = { weekEndAt: new Date(Date.now() + 1000).toISOString(), entries: [1, 2, 3, 4].map((rank) => ({ userGlobalId: `gid://User/${rank}`, username: rank === 4 ? "me" : `user-${rank}`, rank, weekPoints: 10, rankDelta: rank === 2 ? 1 : rank === 3 ? -1 : 0, avatar: null })) }
        view.rerender(<LeagueBlock scope="weekly" />)
        expect(mocks.input?.state).toBe("ready")
        act(() => { mocks.input?.on.open("gid://User/4"); mocks.input?.on.follow("gid://User/4"); mocks.input?.on.climb(); mocks.input?.on.retry() })
        expect(mocks.weekly.mutate).toHaveBeenCalled()

        mocks.global.data = { myRank: 8, myPoints: 50, entries: [1, 2, 3, 4, 5].map((rank) => ({ userGlobalId: `gid://User/${rank}`, username: `global-${rank}`, rank, points: rank * 10, avatar: null, isFollowing: false })) }
        view.rerender(<LeagueBlock scope="global" />)
        expect(mocks.input?.state).toBe("ready")
        act(() => { mocks.input?.on.open("gid://User/5"); mocks.input?.on.follow("gid://User/5") })
        expect(mocks.push).toHaveBeenCalledWith("/profile/global-5")
    })
})
