import { beforeEach, describe, expect, it, vi } from "vitest"
import { mutationClaimWeeklyChallengeReward } from "./mutation-claim-weekly-challenge-reward"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.mutate.mockReset()
    mocks.mutate.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ mutate: mocks.mutate })
})

describe("mutationClaimWeeklyChallengeReward", () => {
    it("uses the bearer-aware client and sends no invented request variables", async () => {
        await mutationClaimWeeklyChallengeReward()
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({ withAuth: true })
        expect(mocks.mutate.mock.calls[0][0].variables).toBeUndefined()
    })
})
