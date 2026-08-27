import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type ModelDrawerInput = {
    readonly quotaLabel?: string
    readonly models: ReadonlyArray<{ readonly id: string; readonly disabled?: boolean }>
}

const mocks = vi.hoisted(() => ({
    quota: { data: { credit: { remainingWeek: 3 } } as unknown },
    catalogue: vi.fn(),
}))

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/hooks", () => ({ useQueryMyAiQuotaSwr: () => mocks.quota }))
vi.mock("@/modules/api/graphql/queries/query-course-personal-project", () => ({
    queryPersonalProjectGradingModels: () => mocks.catalogue(),
}))
vi.mock("./component", () => ({
    ChallengeGradingModelDrawerBase: ({ quotaLabel, models }: ModelDrawerInput) => <output>{quotaLabel}|{JSON.stringify(models)}</output>,
}))

import { ChallengeGradingModelDrawer } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.quota.data = { credit: { remainingWeek: 3 } }
    mocks.catalogue.mockResolvedValue({ data: { aiModels: { data: { gradableModels: [{ provider: "openai", model: "gpt", category: "reasoning", available: false }] } } } })
})

describe("ChallengeGradingModelDrawer", () => {
    it("combines auto and public grading models with quota evidence", async () => {
        render(<ChallengeGradingModelDrawer isOpen selectedDefaultModelId="auto" deliverables={[]} onDismiss={vi.fn()} />)
        expect(screen.getByText(/challengeModelQuota/)).toBeInTheDocument()
        expect(await screen.findByText(/openai:gpt/)).toBeInTheDocument()
        expect(screen.getByText(/"disabled":true/)).toBeInTheDocument()
    })

    it("omits quota copy when quota is unresolved", () => {
        mocks.quota.data = undefined
        render(<ChallengeGradingModelDrawer isOpen={false} selectedDefaultModelId="auto" deliverables={[]} onDismiss={vi.fn()} />)
        expect(screen.getByText(/^\|/)).toBeInTheDocument()
    })
})
