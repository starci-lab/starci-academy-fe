import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const m = vi.hoisted(() => ({ data: undefined as unknown, error: undefined as unknown, mutate: vi.fn(), push: vi.fn(), replace: vi.fn() }))
vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: m.push, replace: m.replace }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => ({ data: m.data, error: m.error, mutate: m.mutate }) }))
type MockPageProps = { readonly displayId: string }
vi.mock("./component", () => ({ CourseHeadhuntingsPageBase: ({ displayId }: MockPageProps) => <output data-testid="route">{displayId}</output> }))
import { CourseHeadhuntingsPage } from "./index"
beforeEach(() => { vi.clearAllMocks(); m.data = undefined; m.error = undefined })
describe("CourseHeadhuntingsPage route", () => {
    it("passes route identity to the page shell without owning block state", () => { render(<CourseHeadhuntingsPage displayId="course" />); expect(screen.getByTestId("route")).toHaveTextContent("course") })
})





