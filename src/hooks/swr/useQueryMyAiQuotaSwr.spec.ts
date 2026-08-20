/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createElement, type PropsWithChildren } from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_MY_AI_QUOTA_SWR_KEY, useQueryMyAiQuotaSwr } from "./useQueryMyAiQuotaSwr"

/**
 * What these tests guard: the unwrapping and the loading contract. The query module is
 * replaced, so nothing here reaches the network. The case worth its own test is a FULLY
 * SPENT allowance: `remainingWeek: 0` is a real answer, and a hook that treated it as
 * missing would blank the row exactly when the reader most needs to see the number.
 */

const mocks = vi.hoisted(() => ({
    queryMyAiQuota: vi.fn(),
}))

vi.mock("../../modules/api/graphql/queries/query-my-ai-quota", () => ({
    queryMyAiQuota: mocks.queryMyAiQuota,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
        SWRConfig,
        { value: { provider: () => new Map(), dedupingInterval: 0 } },
        children,
    )

/** A healthy payload. */
const quota = { credit: { limitWeek: 500, remainingWeek: 120 } }

beforeEach(() => {
    // A viewer must exist before any of this fetches: the key is viewer-scoped, and with nobody
    // signed in the hook passes a null key and makes no request at all, by design.
    setSessionToken("token-under-test")
    mocks.queryMyAiQuota.mockReset()
    mocks.queryMyAiQuota.mockResolvedValue({
        data: { myAiQuota: { success: true, message: "ok", data: quota } },
    })
})

describe("QUERY_MY_AI_QUOTA_SWR_KEY", () => {
    it("is a stable array key, so a revalidating caller can name it", () => {
        expect(QUERY_MY_AI_QUOTA_SWR_KEY).toEqual(["QUERY_MY_AI_QUOTA_SWR"])
    })
})

describe("useQueryMyAiQuotaSwr", () => {
    it("starts with no data and no error", () => {
        const { result } = renderHook(() => useQueryMyAiQuotaSwr(), { wrapper })
        expect(result.current.data).toBeUndefined()
        expect(result.current.error).toBeUndefined()
    })

    it("hands back the payload, not the envelope", async () => {
        const { result } = renderHook(() => useQueryMyAiQuotaSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(quota))
    })

    it("keeps the credit pair nested, because that is where the reader looks it up", async () => {
        const { result } = renderHook(() => useQueryMyAiQuotaSwr(), { wrapper })
        await waitFor(() => expect(result.current.data?.credit.remainingWeek).toBe(120))
        expect(result.current.data?.credit.limitWeek).toBe(500)
    })

    it("sends no arguments, because the query declares none", async () => {
        const { result } = renderHook(() => useQueryMyAiQuotaSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(quota))
        expect(mocks.queryMyAiQuota.mock.calls[0][0]).toBeUndefined()
    })

    it("keeps a fully spent allowance as a zero rather than as nothing", async () => {
        const spent = { credit: { limitWeek: 500, remainingWeek: 0 } }
        mocks.queryMyAiQuota.mockResolvedValue({
            data: { myAiQuota: { success: true, message: "ok", data: spent } },
        })
        const { result } = renderHook(() => useQueryMyAiQuotaSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(spent))
        expect(result.current.data).not.toBeNull()
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.queryMyAiQuota.mockResolvedValue({
            data: { myAiQuota: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" } },
        })
        const { result } = renderHook(() => useQueryMyAiQuotaSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryMyAiQuota.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMyAiQuotaSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as an empty quota", async () => {
        mocks.queryMyAiQuota.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMyAiQuotaSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("exposes the SWR surface a component needs", async () => {
        const { result } = renderHook(() => useQueryMyAiQuotaSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(quota))
        expect(result.current.mutate).toBeTypeOf("function")
        expect(result.current.isLoading).toBe(false)
    })

    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryMyAiQuotaSwr(), { wrapper })
        // A signed-out reader must not shimmer at an answer that is never coming: the key is null,
        // so there is no request to retry and no loading state to be stuck in.
        expect(mocks.queryMyAiQuota).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeUndefined()
    })
})
