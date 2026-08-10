import { type GraphQLResponse } from "../../types"

/**
 * What the route index is asked.
 *
 * ONE OPAQUE ID AND NOTHING ELSE. A caller holding a lesson knows its `globalId` and no more -
 * not which course it belongs to, not which module. That is the point: the shape of a URL is the
 * server's to decide and to change, and a client that assembled one out of parts it happened to
 * have would break the day a segment moved.
 */
export interface ResolveRouteRequest {
    /** Opaque global id, as it arrives on any reference row. */
    globalId: string
}

/** What the route index answers. */
export interface ResolveRouteData {
    /**
     * The locale-agnostic path, which the caller prefixes with its own locale. `null` when the
     * entity has no page - which is a real answer, not a failure, and the reason a caller must
     * check rather than navigate to whatever came back.
     */
    path: string | null
}

/** The response shape of the `resolveRoute` query, envelope included. */
export interface QueryResolveRouteResponse {
    /** The top-level field, wrapping the standard envelope. */
    resolveRoute: GraphQLResponse<ResolveRouteData>
}
