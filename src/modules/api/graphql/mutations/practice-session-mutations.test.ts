import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { mutationSubmitCodingSolution } from "./mutation-submit-coding-solution"
import { mutationStartPlaygroundSession } from "./mutation-start-playground-session"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.mutate.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ mutate: mocks.mutate })
})

const sentDocument = (index = 0) => print(mocks.mutate.mock.calls[index][0].mutation)

describe("mutationSubmitCodingSolution", () => {
    it("selects the asynchronous judge identities and no verdict field", async () => {
        await mutationSubmitCodingSolution({ slug: "two-sum", language: "ts", sourceCode: "export {}" })
        const document = sentDocument()
        expect(document).toContain("submitCodingSolution(request: $request)")
        expect(document).toContain("submissionId")
        expect(document).toContain("jobId")
        expect(document).not.toContain("verdict")
    })

    it("submits source without telemetry on an authenticated client when options are omitted", async () => {
        await mutationSubmitCodingSolution({ slug: "two-sum", language: "ts", sourceCode: "export {}" })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: { slug: "two-sum", language: "ts", sourceCode: "export {}" },
        })
    })

    it("carries the honesty telemetry and merges transport options when supplied", async () => {
        const signal = new AbortController().signal
        const telemetry = { pasteCount: 2, pasteSizeMax: 120, keystrokeCount: 900, tabBlurCount: 1, elapsedMs: 60_000 }
        await mutationSubmitCodingSolution(
            { slug: "two-sum", language: "py", sourceCode: "pass", telemetry },
            { headers: { "x-trace": "judge" }, signal, debug: true },
        )
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: { slug: "two-sum", language: "py", sourceCode: "pass", telemetry },
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-trace": "judge" },
            signal,
            debug: true,
        })
    })

    it("returns the job envelope the socket listener keys on", async () => {
        mocks.mutate.mockResolvedValue({
            data: { submitCodingSolution: { success: true, message: "queued", data: { submissionId: "s-1", jobId: "j-1" } } },
        })
        await expect(
            mutationSubmitCodingSolution({ slug: "two-sum", language: "ts", sourceCode: "export {}" }),
        ).resolves.toEqual({
            data: { submitCodingSolution: { success: true, message: "queued", data: { submissionId: "s-1", jobId: "j-1" } } },
        })
    })

    it("propagates a rejected submission", async () => {
        mocks.mutate.mockRejectedValue(new Error("offline"))
        await expect(
            mutationSubmitCodingSolution({ slug: "two-sum", language: "ts", sourceCode: "export {}" }),
        ).rejects.toThrow("offline")
    })
})

describe("mutationStartPlaygroundSession", () => {
    it("selects the pairing code and the ordered step hints the live route walks", async () => {
        await mutationStartPlaygroundSession({ request: { playgroundId: "pg-1" } })
        const document = sentDocument()
        expect(document).toContain("createPlaygroundSession(request: $request)")
        expect(document).toContain("pairingCode")
        expect(document).toContain("sortIndex")
        expect(document).toContain("commandHint")
        expect(document).toContain("actionHint")
    })

    it("starts an unscaffolded session on an authenticated client with no transport overrides", async () => {
        await mutationStartPlaygroundSession({ request: { playgroundId: "pg-1" } })
        expect(mocks.createApolloClient.mock.calls[0][0]).toEqual({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request: { playgroundId: "pg-1" } })
    })

    it("carries the guided mode and every transport option through", async () => {
        const signal = new AbortController().signal
        await mutationStartPlaygroundSession({
            request: { playgroundId: "pg-2", mode: "guided" },
            headers: { "x-trace": "playground" },
            signal,
            debug: true,
        })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: { playgroundId: "pg-2", mode: "guided" },
        })
        expect(mocks.createApolloClient.mock.calls[0][0]).toEqual({
            withAuth: true,
            headers: { "x-trace": "playground" },
            signal,
            debug: true,
        })
    })

    it("returns the session envelope and propagates an enrollment refusal", async () => {
        mocks.mutate.mockResolvedValue({
            data: {
                createPlaygroundSession: {
                    success: true,
                    message: "ok",
                    data: { id: "s-1", pairingCode: "ABC123", mode: "free", steps: [] },
                },
            },
        })
        await expect(mutationStartPlaygroundSession({ request: { playgroundId: "pg-1", mode: "free" } })).resolves.toEqual({
            data: {
                createPlaygroundSession: {
                    success: true,
                    message: "ok",
                    data: { id: "s-1", pairingCode: "ABC123", mode: "free", steps: [] },
                },
            },
        })
        mocks.mutate.mockRejectedValue(new Error("not enrolled"))
        await expect(mutationStartPlaygroundSession({ request: { playgroundId: "pg-1" } })).rejects.toThrow("not enrolled")
    })
})
