"use client"

import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import { querySandboxRepoUrl } from "@/modules/api/graphql/queries/query-sandbox-repo-url"
import {
    parseSandboxRepoSnapshot,
    publicSandboxRepoUrl,
    sandboxRepoName,
    type SandboxRepoSnapshot,
} from "@/modules/code/sandbox-repo"

/** Stable SWR prefix for synchronized lesson source snapshots. */
export const REPO_SANDPACK_FILES_SWR_KEY = "REPO_SANDPACK_FILES_SWR"

/** Identity and entitlement facts needed to load one synchronized snapshot. */
export type UseRepoSandpackFilesParams = {
    readonly contentId?: string | null
    readonly githubBaseUrl?: string | null
    readonly githubDir?: string | null
    readonly isPremium?: boolean | null
    /** Source remains lazy until the lesson's Source face is selected. */
    readonly enabled?: boolean
}

const fetchSnapshot = async (url: string): Promise<SandboxRepoSnapshot> => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Sandbox repository snapshot failed with ${response.status}`)
    return parseSandboxRepoSnapshot(await response.json() as unknown)
}

const fetchPremiumSnapshot = async (contentId: string): Promise<SandboxRepoSnapshot> => {
    const result = await querySandboxRepoUrl({ request: { contentId } })
    const presignedUrl = result.data?.sandboxRepoUrl
    if (!presignedUrl) throw new Error("Sandbox repository URL was not returned")
    return fetchSnapshot(presignedUrl)
}

const fetchPublicSnapshot = async (
    githubBaseUrl: string,
    githubDir: string,
): Promise<SandboxRepoSnapshot> => fetchSnapshot(publicSandboxRepoUrl({
    minioUrl: process.env.NEXT_PUBLIC_MINIO_URL || "http://localhost:9000",
    bucket: process.env.NEXT_PUBLIC_MINIO_BUCKET || "starci-academy",
    repoName: sandboxRepoName(githubBaseUrl),
    githubDir,
}))

/**
 * Load the backend-synchronized Sandpack snapshot.
 *
 * Public lessons read the anonymous MinIO object used by legacy. Premium lessons first ask the
 * backend for a short-lived URL, so the browser never bypasses enrollment and never talks to
 * GitHub. Premium cache identity includes the viewer fingerprint to prevent a later viewer in the
 * same tab receiving an earlier learner's entitled snapshot.
 */
export const useRepoSandpackFiles = ({
    contentId,
    githubBaseUrl,
    githubDir,
    isPremium = false,
    enabled = true,
}: UseRepoSandpackFilesParams = {}) => {
    const viewer = useViewerKey()
    const hasIdentity = Boolean(contentId && githubBaseUrl && githubDir)
    const canFetch = enabled && hasIdentity && (!isPremium || viewer !== undefined)
    const key = canFetch ? [
        REPO_SANDPACK_FILES_SWR_KEY,
        contentId,
        githubBaseUrl,
        githubDir,
        isPremium ? viewer : "public",
    ] : null

    const result = useSWR<SandboxRepoSnapshot>(
        key,
        () => isPremium
            ? fetchPremiumSnapshot(contentId as string)
            : fetchPublicSnapshot(githubBaseUrl as string, githubDir as string),
        { revalidateOnFocus: false, revalidateOnReconnect: false },
    )

    return {
        ...result,
        files: result.data?.files ?? {},
        dependencies: result.data?.dependencies ?? {},
    }
}
