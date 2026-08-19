type TestPageInput = { state: string; on: Record<string, (...args: ReadonlyArray<unknown>) => unknown> }
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const m = vi.hoisted(() => ({ token: "token" as string | undefined, restoring: false, weekly: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() }, global: { data: undefined as unknown }, me: { data: { username: "me", avatar: null } }, push: vi.fn(), replace: vi.fn(), follow: vi.fn().mockResolvedValue({ data: { setFollow: { success: true } } }) }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: m.push, replace: m.replace }) }))
vi.mock("@/hooks/auth/useSessionToken", () => ({ useSessionToken: () => m.token }))
vi.mock("@/hooks/auth/useSessionRefresh", () => ({ useSessionRefresh: () => ({ isRestoring: m.restoring }) }))
vi.mock("@/hooks", () => ({ useQueryMeSwr: () => m.me, useQueryMyLeagueSwr: () => m.weekly, useQueryGlobalLeaderboardSwr: () => m.global, useMutateSetFollowSwr: () => ({ trigger: m.follow }) }))
vi.mock("./component", () => ({ LeaguePageBase: ({ state, on }: TestPageInput) => <><output data-testid="state">{state}</output><button onClick={() => on.selectScope("global")}>global</button><button onClick={on.goHome}>home</button><button onClick={on.climb}>climb</button><button onClick={on.retry}>retry</button></> }))
import { LeaguePage } from "./index"
beforeEach(() => { vi.clearAllMocks(); m.token = "token"; m.restoring = false; m.weekly.data = undefined; m.weekly.error = undefined; m.global.data = undefined })
describe("LeaguePage route", () => {
    it("withholds signed-out content and redirects to authentication", () => { m.token = undefined; render(<LeaguePage />); expect(screen.queryByTestId("state")).not.toBeInTheDocument(); expect(m.replace).toHaveBeenCalledWith("/authentication") })
    it("reports pending, failed, empty and ready states with navigation", () => { const view = render(<LeaguePage />); expect(screen.getByTestId("state")).toHaveTextContent("pending"); m.weekly.error = new Error("offline"); view.rerender(<LeaguePage />); expect(screen.getByTestId("state")).toHaveTextContent("failed"); m.weekly.error = undefined; m.weekly.data = { weekEndAt: new Date(Date.now() + 1000).toISOString(), entries: [] }; view.rerender(<LeaguePage />); expect(screen.getByTestId("state")).toHaveTextContent("empty"); m.weekly.data = { weekEndAt: new Date(Date.now() + 1000).toISOString(), entries: [{ userGlobalId: "gid://User/1", username: "Ada", rank: 1, weekPoints: 10, rankDelta: 0, avatar: null }] }; view.rerender(<LeaguePage />); expect(screen.getByTestId("state")).toHaveTextContent("ready"); fireEvent.click(screen.getByText("global")); fireEvent.click(screen.getByText("home")); fireEvent.click(screen.getByText("climb")); fireEvent.click(screen.getByText("retry")); expect(m.push).toHaveBeenCalledWith("/league?scope=global"); expect(m.push).toHaveBeenCalledWith("/dashboard"); expect(m.push).toHaveBeenCalledWith("/dashboard?tab=courses"); expect(m.weekly.mutate).toHaveBeenCalled() })
})


