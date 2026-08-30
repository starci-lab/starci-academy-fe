import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PersonalProjectWorkspaceLayout } from "."

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ usePathname: () => "/courses/system-design/learn/personal-project" }))

type LayoutStubProps = { readonly surface: ReactNode; readonly resizeLabel: string; readonly showRoadmapNavigation?: boolean }

vi.mock("./component", () => ({
    PersonalProjectWorkspaceLayoutBase: ({ surface, resizeLabel, showRoadmapNavigation }: LayoutStubProps) => (
        <><output>{resizeLabel}</output><output data-testid="roadmap">{String(showRoadmapNavigation)}</output>{surface}</>
    ),
}))

describe("PersonalProjectWorkspaceLayout", () => {
    it("connects localized chrome without owning roadmap state or data", () => {
        render(<PersonalProjectWorkspaceLayout displayId="system-design" surface={<div>Task workspace</div>} />)

        expect(screen.getByText("resizeRail")).toBeInTheDocument()
        expect(screen.getByTestId("roadmap")).toHaveTextContent("false")
        expect(screen.getByText("Task workspace")).toBeInTheDocument()
    })
})
