import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GlobalSearchBucket } from "@/modules/search/global-search"

/** Identity carried from one autocomplete hit into its canonical detail query. */
export type QueryGlobalSearchDetailRequest = {
    readonly bucket: GlobalSearchBucket
    readonly id: string
    readonly displayId: string
}

/** Common learner-facing fields every searchable detail operation exposes. */
export type GlobalSearchDetail = {
    readonly id: string
    readonly title: string
    readonly description?: string | null
}

type QueryGlobalSearchDetailResponse = {
    readonly detail?: { readonly data?: GlobalSearchDetail | null } | null
}

const requestDocument = (operation: string, field: string, requestType: string) => gql`
    query ${operation}($request: ${requestType}!) {
        detail: ${field}(request: $request) {
            data { id title description }
        }
    }
`

const documents: Record<GlobalSearchBucket, DocumentNode> = {
    courses: requestDocument("GlobalSearchCourseDetail", "course", "CourseRequest"),
    modules: requestDocument("GlobalSearchModuleDetail", "module", "ModuleRequest"),
    contents: requestDocument("GlobalSearchContentDetail", "content", "ContentRequest"),
    challenges: requestDocument("GlobalSearchChallengeDetail", "challenge", "ChallengeRequest"),
    flashcardDecks: gql`
        query GlobalSearchFlashcardDeckDetail($id: ID!) {
            detail: flashcardDeck(flashcardDeckId: $id) {
                data { id title description }
            }
        }
    `,
    milestones: requestDocument("GlobalSearchMilestoneDetail", "milestone", "MilestoneRequest"),
    milestoneTasks: requestDocument("GlobalSearchTaskDetail", "task", "TaskRequest"),
    foundations: requestDocument("GlobalSearchFoundationDetail", "foundation", "FoundationRequest"),
}

/** Fetch one selected hit from its existing canonical detail operation. */
export const queryGlobalSearchDetail = async (request: QueryGlobalSearchDetailRequest) => {
    const apollo = createApolloClient({ withAuth: true })
    const variables = request.bucket === "flashcardDecks"
        ? { id: request.id }
        : request.bucket === "courses"
            ? { request: { displayId: request.displayId } }
            : { request: { id: request.id } }
    const response = await apollo.query<QueryGlobalSearchDetailResponse>({
        query: documents[request.bucket],
        variables,
        fetchPolicy: "no-cache",
    })
    return response.data?.detail?.data ?? null
}

