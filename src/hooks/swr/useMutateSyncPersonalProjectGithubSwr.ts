import useSWRMutation from "swr/mutation"
import { mutateSyncPersonalProjectGithub } from "@/modules/api/graphql/queries/query-course-personal-project"
import type { SyncPersonalProjectGithubRequest } from "@/modules/api/graphql/queries/types/course-personal-project"

type SyncPersonalProjectGithubTrigger = { readonly arg: SyncPersonalProjectGithubRequest }

/** Stable mutation identity for enrollment-owned GitHub grading settings. */
export const MUTATE_SYNC_PERSONAL_PROJECT_GITHUB_SWR_KEY =
    "MUTATE_SYNC_PERSONAL_PROJECT_GITHUB_SWR"

/** Persists one enrollment-owned repository settings patch and rejects incomplete envelopes. */
export const useMutateSyncPersonalProjectGithubSwr = () => useSWRMutation(
    MUTATE_SYNC_PERSONAL_PROJECT_GITHUB_SWR_KEY,
    async (_key: string, { arg }: SyncPersonalProjectGithubTrigger) => {
        const result = await mutateSyncPersonalProjectGithub(arg)
        const response = result.data?.syncPersonalProjectGithub
        if (response?.success !== true) {
            throw new Error(response?.message ?? "Personal-project repository settings could not be saved.")
        }
        return true
    },
)
