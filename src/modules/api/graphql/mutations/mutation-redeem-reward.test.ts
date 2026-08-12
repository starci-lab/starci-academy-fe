import { beforeEach, describe, expect, it, vi } from "vitest"
import { mutationRedeemReward } from "./mutation-redeem-reward"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.mutate.mockReset()
    mocks.mutate.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ mutate: mocks.mutate })
})

describe("mutationRedeemReward", () => {
    it("sends the streak-freeze reward key through an authenticated client", async () => {
        await mutationRedeemReward({ request: { rewardKey: "streakFreeze" } })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({ withAuth: true })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: { rewardKey: "streakFreeze" },
        })
    })
})
