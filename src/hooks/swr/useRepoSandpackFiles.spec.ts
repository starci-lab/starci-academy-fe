/** @vitest-environment jsdom */
import { createElement, type PropsWithChildren } from "react"
import { act, renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    REPO_SANDPACK_FILES_SWR_KEY,
    useRepoSandpackFiles,
} from "./useRepoSandpackFiles"

const mocks = vi.hoisted(() => ({
    querySandboxRepoUrl: vi.fn(),
}))

vi.mock("../../modules/api/graphql/queries/query-sandbox-repo-url", () => ({
    querySandboxRepoUrl: mocks.querySandboxRepoUrl,
}))

const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

const params = {
    contentId: "content-1",
    githubBaseUrl: "https://github.com/StarCi-Academy/course-source",
    githubDir: "lesson/frontend",
}

const snapshot = {
    "/src/App.tsx": { code: "export default function App() {}" },
    "/package.json": { code: JSON.stringify({ dependencies: { react: "^19.0.0" } }) },
}

beforeEach(() => {
    vi.unstubAllEnvs()
    vi.stubEnv("NEXT_PUBLIC_MINIO_URL", "https://cdn.example.com")
    vi.stubEnv("NEXT_PUBLIC_MINIO_BUCKET", "academy")
    setSessionToken(undefined)
    mocks.querySandboxRepoUrl.mockReset()
    mocks.querySandboxRepoUrl.mockResolvedValue({ data: { sandboxRepoUrl: "https://signed.example.com/repo" } })
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => snapshot }))
})

describe("useRepoSandpackFiles", () => {
    it("keeps one stable source cache prefix", () => {
        expect(REPO_SANDPACK_FILES_SWR_KEY).toBe("REPO_SANDPACK_FILES_SWR")
    })

    it("loads a public synchronized MinIO snapshot without a GraphQL presign", async () => {
        const { result } = renderHook(() => useRepoSandpackFiles(params), { wrapper })

        await waitFor(() => expect(result.current.files["/src/App.tsx"]).toBeDefined())
        expect(fetch).toHaveBeenCalledWith(
            "https://cdn.example.com/academy/repo/course-source/lesson/frontend.json",
        )
        expect(mocks.querySandboxRepoUrl).not.toHaveBeenCalled()
        expect(result.current.dependencies).toEqual({ react: "^19.0.0" })
    })

    it("waits for a viewer before requesting a premium URL", async () => {
        const { result } = renderHook(
            () => useRepoSandpackFiles({ ...params, isPremium: true }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(false)
        expect(mocks.querySandboxRepoUrl).not.toHaveBeenCalled()
        expect(fetch).not.toHaveBeenCalled()
    })

    it("uses the backend presign for an authenticated premium lesson", async () => {
        setSessionToken("test-token")
        const { result } = renderHook(
            () => useRepoSandpackFiles({ ...params, isPremium: true }),
            { wrapper },
        )

        await waitFor(() => expect(result.current.files["/src/App.tsx"]).toBeDefined())
        expect(mocks.querySandboxRepoUrl).toHaveBeenCalledWith({ request: { contentId: "content-1" } })
        expect(fetch).toHaveBeenCalledWith("https://signed.example.com/repo")
    })

    it("does not fetch before Source is selected or configuration is complete", () => {
        renderHook(() => useRepoSandpackFiles({ ...params, enabled: false }), { wrapper })
        renderHook(() => useRepoSandpackFiles({ contentId: "content-1" }), { wrapper })

        expect(fetch).not.toHaveBeenCalled()
        expect(mocks.querySandboxRepoUrl).not.toHaveBeenCalled()
    })

    it("surfaces a failed snapshot rather than returning an empty ready state", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503 } as Response)
        const { result } = renderHook(() => useRepoSandpackFiles(params), { wrapper })

        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.files).toEqual({})
    })

    it("falls back to the local object store when neither MinIO variable is configured", async () => {
        vi.stubEnv("NEXT_PUBLIC_MINIO_URL", "")
        vi.stubEnv("NEXT_PUBLIC_MINIO_BUCKET", "")
        const { result } = renderHook(() => useRepoSandpackFiles(params), { wrapper })

        await waitFor(() => expect(result.current.files["/src/App.tsx"]).toBeDefined())
        expect(fetch).toHaveBeenCalledWith(
            "http://localhost:9000/starci-academy/repo/course-source/lesson/frontend.json",
        )
    })

    it("fails a premium lesson whose presign came back empty, rather than fetching nothing", async () => {
        setSessionToken("test-token")
        mocks.querySandboxRepoUrl.mockResolvedValue({ data: { sandboxRepoUrl: null } })
        const { result } = renderHook(
            () => useRepoSandpackFiles({ ...params, isPremium: true }),
            { wrapper },
        )

        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.error?.message).toBe("Sandbox repository URL was not returned")
        // The browser never talks to GitHub as a consolation prize: no URL means no request.
        expect(fetch).not.toHaveBeenCalled()
        expect(result.current.files).toEqual({})
    })

    it("keys a premium snapshot by viewer, so no learner reads another's entitled source", async () => {
        setSessionToken("first-viewer")
        const { result } = renderHook(
            () => useRepoSandpackFiles({ ...params, isPremium: true }),
            { wrapper },
        )
        await waitFor(() => expect(result.current.files["/src/App.tsx"]).toBeDefined())
        expect(mocks.querySandboxRepoUrl).toHaveBeenCalledTimes(1)

        act(() => setSessionToken("second-viewer"))
        await waitFor(() => expect(mocks.querySandboxRepoUrl).toHaveBeenCalledTimes(2))
    })
})
