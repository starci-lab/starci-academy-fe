import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type DrawerInput = { readonly title: string }

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("./component", () => ({
    ChallengeAttemptHistoryDrawerBase: ({ title }: DrawerInput) => <output>{title}</output>,
}))

import { ChallengeAttemptHistoryDrawer } from "./index"

describe("ChallengeAttemptHistoryDrawer", () => {
    it("resolves the Challenge-owned title", () => {
        render(<ChallengeAttemptHistoryDrawer isOpen onDismiss={vi.fn()} />)
        expect(screen.getByText("challengeHistoryTitle")).toBeInTheDocument()
    })
})
