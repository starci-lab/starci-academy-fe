import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"
import type { MutationParams } from "./types/params"
import type { CourseQaComment } from "../queries/query-course-qa-comments"

/** Exact course scope and authored body accepted by createComment. */
export interface CreateCourseQuestionRequest {
    readonly courseId: string
    readonly body: string
}

interface MutationCreateCourseQuestionResponse {
    readonly createComment: GraphQLResponse<CourseQaComment>
}

const mutation1 = gql`
    mutation CreateCourseQuestion($request: CreateCommentRequest!) {
        createComment(request: $request) {
            success
            message
            error
            data {
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
`

export enum MutationCreateCourseQuestion { Mutation1 = "mutation1" }

const mutationCreateCourseQuestionMap: Record<MutationCreateCourseQuestion, DocumentNode> = {
    [MutationCreateCourseQuestion.Mutation1]: mutation1,
}

/** Creates one top-level course-general question; it never sends a lesson scope. */
export const mutationCreateCourseQuestion = async ({
    mutation = MutationCreateCourseQuestion.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationCreateCourseQuestion, CreateCourseQuestionRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.mutate<MutationCreateCourseQuestionResponse>({
        mutation: mutationCreateCourseQuestionMap[mutation],
        variables: { request },
    })
}
