import { type GraphQLHeaders } from "../../types"

/**
 * The options every mutation helper accepts.
 *
 * This is deliberately NOT `QueryParams` with a different name. A query is a read that may be
 * repeated, so its variables are optional and its default variant answers a caller with no
 * opinion; a mutation is a write, and there is no such thing as a sensible default argument
 * for one - `request` is required here for that reason alone. The rest of the shape mirrors
 * the query side so that one operation reads the same whichever direction it travels in.
 */
export interface MutationParams<TMutation, TRequest> {
    /** Which document variant of this mutation to send; each module names its own default. */
    mutation?: TMutation
    /** The variables object sent as the single `request` argument. Required: a write has no default. */
    request: TRequest
    /** Extra headers for this operation only. */
    headers?: GraphQLHeaders
    /** Abort signal forwarded to the underlying `fetch`. */
    signal?: AbortSignal
    /** When true, the link chain logs what it does for this operation. */
    debug?: boolean
}
