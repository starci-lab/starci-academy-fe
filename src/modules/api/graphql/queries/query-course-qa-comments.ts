import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams } from "../types"

interface CourseQaAuthor {
    readonly id: string
    readonly username: string
    readonly avatar: string | null
}

/** One course-general question or direct reply. */
export interface CourseQaComment {
    readonly id: string
    readonly body: string
    readonly isDeleted: boolean
    readonly editedAt: string | null
    readonly createdAt: string
    readonly parentCommentId: string | null
    readonly replyCount: number
    readonly isFounderAuthor: boolean
    readonly author: CourseQaAuthor
}

/** One page of course questions or direct replies. */
export interface CourseQaCommentsPage {
    readonly total: number
    readonly comments: ReadonlyArray<CourseQaComment>
}

interface QueryCourseQaCommentsRequest {
    readonly courseId?: string
    readonly parentCommentId?: string | null
    readonly page?: number
    readonly limit?: number
}

interface QueryCourseQaCommentsResponse {
    readonly contentComments: GraphQLResponse<CourseQaCommentsPage>
}

const query1 = gql`
    query CourseQaComments($request: ContentCommentsRequest!) {
        contentComments(request: $request) {
            success
            message
            error
            data {
                total
                comments {
                    id
                    body
                    isDeleted
                    editedAt
                    createdAt
                    parentCommentId
                    replyCount
                    isFounderAuthor
                    author { id username avatar }
                }
            }
        }
    }
`

export enum QueryCourseQaComments { Query1 = "query1" }

const queryCourseQaCommentsMap: Record<QueryCourseQaComments, DocumentNode> = {
    [QueryCourseQaComments.Query1]: query1,
}

/** Lists course-general questions or replies through the proven contentComments resolver. */
export const queryCourseQaComments = async ({
    query = QueryCourseQaComments.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryCourseQaComments, QueryCourseQaCommentsRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryCourseQaCommentsResponse>({
        query: queryCourseQaCommentsMap[query],
        variables: { request },
    })
}
