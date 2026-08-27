import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type HistoryInput = { readonly selectedAttemptId?: string }

vi.mock("@/components/blocks/learn/ChallengeAttemptHistory", () => ({
    ChallengeAttemptHistory: ({ selectedAttemptId }: HistoryInput) => <output>{selectedAttemptId}</output>,
}))

import { ChallengeAttemptHistoryDrawerBase } from "./component"

describe("ChallengeAttemptHistoryDrawerBase", () => {
    it("seats the bounded history owner in the drawer", () => {
        render(<ChallengeAttemptHistoryDrawerBase isOpen title="History" selectedAttemptId="attempt-1" onDismiss={vi.fn()} />)
        expect(screen.getByText("History")).toBeInTheDocument()
        expect(screen.getByText("attempt-1")).toBeInTheDocument()
    })
})
