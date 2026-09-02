import { beforeEach, describe, expect, it, vi } from "vitest"
import { queryMyProSubscription, queryProOffer } from "./query-pro-subscription"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

describe("Pro subscription queries", () => {
    it("keeps the public offer independent from viewer credentials", async () => {
        await queryProOffer()
        expect(mocks.createApolloClient).toHaveBeenCalledWith()
        expect(mocks.query).toHaveBeenCalledWith(expect.objectContaining({ fetchPolicy: "network-only" }))
    })

    it("requires the authenticated transport for the viewer lifecycle", async () => {
        await queryMyProSubscription()
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        expect(mocks.query).toHaveBeenCalledWith(expect.objectContaining({ fetchPolicy: "network-only" }))
    })
})
