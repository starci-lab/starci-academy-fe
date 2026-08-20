/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createElement, type PropsWithChildren } from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_MY_REWARD_WALLET_SWR_KEY,
    useQueryMyRewardWalletSwr,
} from "./useQueryMyRewardWalletSwr"

/**
 * What these tests guard: the unwrapping and the loading contract. The query module is
 * replaced, so nothing here reaches the network. An EMPTY wallet gets its own test for the
 * same reason a spent quota does - a balance of zero is an answer, and a hook that folded it
 * into "no answer" would hide the one number the reader came to check.
 */

const mocks = vi.hoisted(() => ({
    queryMyRewardWallet: vi.fn(),
}))

vi.mock("../../modules/api/graphql/queries/query-my-reward-wallet", () => ({
    queryMyRewardWallet: mocks.queryMyRewardWallet,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
        SWRConfig,
        { value: { provider: () => new Map(), dedupingInterval: 0 } },
        children,
    )

/** A healthy payload. */
const wallet = { balance: 240 }

beforeEach(() => {
    // A viewer must exist before any of this fetches: the key is viewer-scoped, and with nobody
    // signed in the hook passes a null key and makes no request at all, by design.
    setSessionToken("token-under-test")
    mocks.queryMyRewardWallet.mockReset()
    mocks.queryMyRewardWallet.mockResolvedValue({
        data: { myRewardWallet: { success: true, message: "ok", data: wallet } },
    })
})

describe("QUERY_MY_REWARD_WALLET_SWR_KEY", () => {
    it("is a stable array key, so a revalidating caller can name it", () => {
        expect(QUERY_MY_REWARD_WALLET_SWR_KEY).toEqual(["QUERY_MY_REWARD_WALLET_SWR"])
    })
})

describe("useQueryMyRewardWalletSwr", () => {
    it("starts with no data and no error", () => {
        const { result } = renderHook(() => useQueryMyRewardWalletSwr(), { wrapper })
        expect(result.current.data).toBeUndefined()
        expect(result.current.error).toBeUndefined()
    })

    it("hands back the payload, not the envelope", async () => {
        const { result } = renderHook(() => useQueryMyRewardWalletSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(wallet))
    })

    it("sends no arguments, because the query declares none", async () => {
        const { result } = renderHook(() => useQueryMyRewardWalletSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(wallet))
        expect(mocks.queryMyRewardWallet).toHaveBeenCalledTimes(1)
        expect(mocks.queryMyRewardWallet.mock.calls[0][0]).toBeUndefined()
    })

    it("keeps an empty wallet as a zero rather than as nothing", async () => {
        mocks.queryMyRewardWallet.mockResolvedValue({
            data: { myRewardWallet: { success: true, message: "ok", data: { balance: 0 } } },
        })
        const { result } = renderHook(() => useQueryMyRewardWalletSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual({ balance: 0 }))
        expect(result.current.data).not.toBeNull()
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.queryMyRewardWallet.mockResolvedValue({
            data: {
                myRewardWallet: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" },
            },
        })
        const { result } = renderHook(() => useQueryMyRewardWalletSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryMyRewardWallet.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMyRewardWalletSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as an empty wallet", async () => {
        mocks.queryMyRewardWallet.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMyRewardWalletSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("exposes the SWR surface a component needs", async () => {
        const { result } = renderHook(() => useQueryMyRewardWalletSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(wallet))
        expect(result.current.mutate).toBeTypeOf("function")
        expect(result.current.isLoading).toBe(false)
    })

    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryMyRewardWalletSwr(), { wrapper })
        // A balance is nobody's until somebody is asking: the key is null, so a signed-out reader
        // makes no request rather than one that is refused and retried on a backoff.
        expect(mocks.queryMyRewardWallet).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeUndefined()
    })
})
