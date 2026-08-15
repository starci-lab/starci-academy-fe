import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type {
    QueryAutocompleteGlobalSearchRequest,
    QueryAutocompleteGlobalSearchResponse,
} from "./types/global-search"

/** Optional-auth GraphQL document selecting every approved search bucket and hit field. */
export const AUTOCOMPLETE_GLOBAL_SEARCH_DOCUMENT = gql`
    query AutocompleteGlobalSearch($request: AutocompleteGlobalSearchRequest!) {
        autocompleteGlobalSearch(request: $request) {
            success
            message
            error
            data {
                courses { id displayId title texts path isEnrolled isFree parentPath { course { id displayId } module { id displayId } content { id displayId } challenge { id displayId } task { id displayId } } }
                modules { id displayId title texts path parentPath { course { id displayId } module { id displayId } content { id displayId } challenge { id displayId } task { id displayId } } }
                contents { id displayId title texts path isPremium parentPath { course { id displayId } module { id displayId } content { id displayId } challenge { id displayId } task { id displayId } } }
                challenges { id displayId title texts path parentPath { course { id displayId } module { id displayId } content { id displayId } challenge { id displayId } task { id displayId } } }
                flashcardDecks { id displayId title texts path parentPath { course { id displayId } module { id displayId } content { id displayId } challenge { id displayId } task { id displayId } } }
                milestones { id displayId title texts path parentPath { course { id displayId } module { id displayId } content { id displayId } challenge { id displayId } task { id displayId } } }
                milestoneTasks { id displayId title texts path parentPath { course { id displayId } module { id displayId } content { id displayId } challenge { id displayId } task { id displayId } } }
                foundations { id displayId title texts path parentPath { course { id displayId } module { id displayId } content { id displayId } challenge { id displayId } task { id displayId } } }
            }
        }
    }
`

/** Optional-auth global autocomplete. Guests and signed-in learners share this path. */
export const queryAutocompleteGlobalSearch = async (
    request: QueryAutocompleteGlobalSearchRequest,
) => {
    const apollo = createApolloClient({ withAuth: true })
    return apollo.query<QueryAutocompleteGlobalSearchResponse>({
        query: AUTOCOMPLETE_GLOBAL_SEARCH_DOCUMENT,
        variables: { request },
        fetchPolicy: "no-cache",
    })
}
