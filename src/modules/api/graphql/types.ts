/**
 * The vocabulary every GraphQL call in this app shares.
 *
 * The back end never returns a bare payload: every resolver answers with the same envelope,
 * so unwrapping is one shape rather than one shape per query. Keeping that envelope here -
 * and not beside any single query - is what stops each new query inventing its own.
 */

/**
 * The envelope every resolver wraps its payload in.
 *
 * `data` is optional on purpose: a failed operation still answers with `success: false` and
 * a `message`, so a caller that reads `data` without checking gets `undefined`, never a
 * half-built object.
 */
export interface GraphQLResponse<TData = undefined> {
    /** Whether the operation succeeded on the server. */
    success: boolean
    /** Human-readable outcome, safe to show to a reader. */
    message: string
    /** Machine-readable failure code; absent when the operation succeeded. */
    error?: string
    /** The payload, present only when the operation succeeded. */
    data?: TData
}

/** Extra HTTP headers merged into a single operation. Undefined values are dropped before the request. */
export type GraphQLHeaders = Record<string, string | undefined>

/**
 * The options every query helper accepts.
 *
 * `signal` is what makes a query cancellable: SWR hands one down when a component unmounts
 * mid-flight, and the HTTP link forwards it to `fetch` so the socket is actually released
 * rather than left to resolve into a discarded render.
 */
export interface QueryParams<TQuery, TRequest = undefined> {
    /** Which document variant of this query to send; each query module names its own default. */
    query?: TQuery
    /** The variables object sent as the single `request` argument. */
    request?: TRequest
    /** Extra headers for this operation only. */
    headers?: GraphQLHeaders
    /** Abort signal forwarded to the underlying `fetch`. */
    signal?: AbortSignal
    /** When true, the link chain logs what it does for this operation. */
    debug?: boolean
    /**
     * When true, the development bearer token from the environment is attached.
     * See {@link ApiEnv.bearerToken} - this is a pass-through, not a session.
     */
    withAuth?: boolean
}

/** A lookup has no meaningful request without the identity being looked up. */
export interface LookupQueryParams<TQuery, TRequest> extends Omit<QueryParams<TQuery, TRequest>, "request"> {
    readonly request: TRequest
}

/** The `request` variable wrapper the back end expects; every operation takes exactly one argument. */
export interface QueryVariables<TRequest> {
    /** The single argument object the resolver declares. */
    request: TRequest
}

/** Sort keys the paginated list endpoints accept, spelled as the GraphQL enum spells them. */
export enum SortBy {
    /** Alphabetical by title. */
    Title = "title",
    /** Newest or oldest first, by creation time. */
    CreatedAt = "createdAt",
    /** By last modification time. */
    UpdatedAt = "updatedAt",
}

/** Sort direction, spelled as the GraphQL enum spells it. */
export enum SortOrder {
    /** Ascending. */
    Asc = "ASC",
    /** Descending. */
    Desc = "DESC",
}

/** One sort clause: which key, which direction. */
export interface SortInput<TSortBy extends string> {
    /** The key to sort on. */
    by: TSortBy
    /** The direction to sort in. */
    order: SortOrder
}

/** Page window and sort clauses for a paginated list query. */
export interface PaginationFilters<TSortBy extends string> {
    /** Zero-based page index; the server defaults it when absent. */
    pageNumber?: number
    /** Rows per page; the server defaults it when absent. */
    limit?: number
    /** Ordered sort clauses, applied left to right. */
    sorts: Array<SortInput<TSortBy>>
    /** Server-side full-text search term. */
    search?: string
}
