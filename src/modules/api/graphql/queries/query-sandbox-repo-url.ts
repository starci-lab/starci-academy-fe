import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import {
    type QuerySandboxRepoUrlResponse,
    type SandboxRepoUrlRequest,
} from "./types/sandbox-repo-url"

const query1 = gql`
    query SandboxRepoUrl($request: SandboxRepoUrlRequest!) {
        sandboxRepoUrl(request: $request)
    }
`

/** The document variants for resolving a sandbox snapshot URL. */
export enum QuerySandboxRepoUrl {
    /** Resolve the one enrollment-gated URL scalar. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const querySandboxRepoUrlMap: Record<QuerySandboxRepoUrl, DocumentNode> = {
    [QuerySandboxRepoUrl.Query1]: query1,
}

/** Ask the backend for a short-lived MinIO URL after it checks lesson access. */
export const querySandboxRepoUrl = async ({
    query = QuerySandboxRepoUrl.Query1,
    request,
    headers,
    signal,
    debug,
}: QueryParams<QuerySandboxRepoUrl, SandboxRepoUrlRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QuerySandboxRepoUrlResponse>({
        query: querySandboxRepoUrlMap[query],
        variables: { request },
    })
}
