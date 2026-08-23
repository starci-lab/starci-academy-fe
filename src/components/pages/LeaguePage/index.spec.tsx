import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ token: "token" as string | undefined, restoring: false, scope: "weekly", push: vi.fn(), replace: vi.fn() }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("next/navigation", () => ({ useSearchParams: () => ({ get: () => mocks.scope }) }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push, replace: mocks.replace }) }))
vi.mock("@/hooks/auth/useSessionToken", () => ({ useSessionToken: () => mocks.token }))
vi.mock("@/hooks/auth/useSessionRefresh", () => ({ useSessionRefresh: () => ({ isRestoring: mocks.restoring }) }))
type PageShellStub = { readonly scope: string; readonly on?: { readonly selectScope?: (scope: string) => void } }
vi.mock("./component", () => ({ LeaguePageBase: (input: PageShellStub) => <><output data-testid="scope">{input.scope}</output><button type="button" onClick={() => input.on?.selectScope?.("global")}>global</button></> }))
import { LeaguePage } from "./index"

describe("LeaguePage route", () => {
    it("withholds signed-out content and redirects", () => { mocks.token = undefined; render(<LeaguePage />); expect(screen.queryByTestId("scope")).not.toBeInTheDocument(); expect(mocks.replace).toHaveBeenCalledWith("/authentication"); mocks.token = "token" })
    it("keeps scope in the page shell and URL action", () => { mocks.token = "token"; mocks.scope = "global"; render(<LeaguePage />); expect(screen.getByTestId("scope")).toHaveTextContent("global"); screen.getByRole("button", { name: "global" }).click(); expect(mocks.push).toHaveBeenCalledWith("/league?scope=global") })
})
