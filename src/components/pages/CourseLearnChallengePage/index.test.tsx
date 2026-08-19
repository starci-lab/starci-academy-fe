import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const m = vi.hoisted(() => ({ data: undefined as any, error: undefined as any, mutate: vi.fn(), push: vi.fn(), replace: vi.fn() }))
vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: m.push, replace: m.replace }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => ({ data: m.data, error: m.error, mutate: m.mutate }) }))
vi.mock("./component", () => ({ _CourseLearnChallengePage: ({ state }: any) => <output data-testid="state">{state}</output> }))
import { CourseLearnChallengePage } from "./index"
beforeEach(() => { vi.clearAllMocks(); m.data = undefined; m.error = undefined })
describe("CourseLearnChallengePage route", () => {
 it("renders loading while dependent challenge data is unresolved", () => { const view = render(<CourseLearnChallengePage displayId="course" contentId="content" challengeId="challenge" />); expect(screen.getByTestId("state")).toHaveTextContent(/pending|loading|connecting/); m.error = new Error("offline"); view.rerender(<CourseLearnChallengePage displayId="course" contentId="content" challengeId="challenge" />); expect(screen.getByTestId("state")).toHaveTextContent(/pending|loading|failed|error/) })
})
