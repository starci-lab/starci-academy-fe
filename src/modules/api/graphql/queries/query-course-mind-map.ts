import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams } from "../types"

/** One backend-resolved cross-link from a concept node to a learning surface. */
export type MindMapLink = { readonly kind: string; readonly entityId: string | null; readonly moduleId: string | null; readonly displayId: string | null }
/** One server-positioned concept graph node. */
export type MindMapNode = { readonly id: string; readonly type: string | null; readonly position: { readonly x: number; readonly y: number }; readonly data: { readonly label: string; readonly kind: string; readonly entityId: string | null; readonly moduleId: string | null; readonly displayId: string | null; readonly desc: string | null; readonly popularity: string | null; readonly links: ReadonlyArray<MindMapLink> } }
/** One directed relationship between concept graph nodes. */
export type MindMapEdge = { readonly id: string; readonly source: string; readonly target: string; readonly type: string | null; readonly animated: boolean | null }
/** Complete backend-computed graph for a course. */
export type CourseMindMap = { readonly nodes: ReadonlyArray<MindMapNode>; readonly edges: ReadonlyArray<MindMapEdge> }
/** Course identity accepted by the mind-map query. */
export type CourseMindMapRequest = { readonly courseId: string }
type QueryCourseMindMapResponse = { readonly courseMindMap: GraphQLResponse<CourseMindMap> }
const document = gql`query CourseMindMap($request: CourseMindMapRequest!) { courseMindMap(request: $request) { success message error data { nodes { id type position { x y } data { label kind entityId moduleId displayId desc popularity links { kind entityId moduleId displayId } } } edges { id source target type animated } } } }`
export enum QueryCourseMindMap { Query1 = "query1" }

/** Read the server-positioned concept graph for a course id or display slug. */
export const queryCourseMindMap = async ({ request, headers, signal, debug }: LookupQueryParams<QueryCourseMindMap, CourseMindMapRequest>) =>
    createApolloClient({ headers, signal, debug }).query<QueryCourseMindMapResponse>({ query: document, variables: { request } })
