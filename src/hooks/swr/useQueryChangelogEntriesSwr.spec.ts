/** @vitest-environment jsdom */
import { renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_CHANGELOG_ENTRIES_SWR_KEY, useQueryChangelogEntriesSwr } from "./useQueryChangelogEntriesSwr"

/**
 * What these tests guard: this is the deliberate OPPOSITE of its viewer-scoped neighbours. A
 * changelog is the same for everybody, so the key carries no viewer and the request is made even
 * with nobody signed in - which is what lets a signed-out visitor read what changed.
 */

const mocks = vi.hoisted(() => ({ queryChangelogEntries: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-changelog-entries", () => ({
    queryChangelogEntries: mocks.queryChangelogEntries,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** One entry, trimmed to the fields the document selects. */
const entries = [{ entryId: "entry-1", title: "Playground goes live", publishedAt: "2025-02-01" }]

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { changelogEntries: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken(undefined)
    mocks.queryChangelogEntries.mockReset()
    mocks.queryChangelogEntries.mockResolvedValue(responseWith(entries))
})

describe("QUERY_CHANGELOG_ENTRIES_SWR_KEY", () => {
    it("is a stable array key with no viewer in it, because the answer is public", () => {
        expect(QUERY_CHANGELOG_ENTRIES_SWR_KEY).toEqual(["QUERY_CHANGELOG_ENTRIES_SWR"])
    })
})

describe("useQueryChangelogEntriesSwr", () => {
    it("reads for a signed-out visitor, because nothing about it is private", async () => {
        const { result } = renderHook(() => useQueryChangelogEntriesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(entries))
        expect(mocks.queryChangelogEntries).toHaveBeenCalledTimes(1)
    })

    it("makes an absent payload an empty list rather than a null the section cannot render", async () => {
        mocks.queryChangelogEntries.mockResolvedValue({
            data: { changelogEntries: { success: false, message: "unavailable", error: "INTERNAL" } },
        })
        const { result } = renderHook(() => useQueryChangelogEntriesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(result.current.error).toBeUndefined()
    })

    it("makes a missing response body an empty list too", async () => {
        mocks.queryChangelogEntries.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryChangelogEntriesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
    })

    it("surfaces a transport failure as an error rather than as an empty changelog", async () => {
        mocks.queryChangelogEntries.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryChangelogEntriesSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })
})
