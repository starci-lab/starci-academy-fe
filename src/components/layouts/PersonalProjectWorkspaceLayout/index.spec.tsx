import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PersonalProjectWorkspaceLayout } from "."

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))

type LayoutStubProps = { readonly surface: ReactNode; readonly resizeLabel: string }

vi.mock("./component", () => ({
    PersonalProjectWorkspaceLayoutBase: ({ surface, resizeLabel }: LayoutStubProps) => (
        <><output>{resizeLabel}</output>{surface}</>
    ),
}))

describe("PersonalProjectWorkspaceLayout", () => {
    it("connects localized chrome without owning roadmap state or data", () => {
        render(<PersonalProjectWorkspaceLayout displayId="system-design" surface={<div>Task workspace</div>} />)

        expect(screen.getByText("resizeRail")).toBeInTheDocument()
        expect(screen.getByText("Task workspace")).toBeInTheDocument()
    })
})
