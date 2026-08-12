import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { LookupQueryParams } from "../types"
import type { QueryUserProfileResponse } from "./types/user-profile"

/** Public username lookup variables. */
export type UserProfileRequest = { readonly username: string }

const query1 = gql`
    query UserProfile($username: String!) {
        userProfile(username: $username) {
            success
            message
            error
            data {
                id username displayName bio avatar githubUsername createdAt
                followerCount followingCount isFollowedByMe profileLocked openToWork
                featuredAchievementSlug roleTitle location workMode linkedinUrl websiteUrl
            }
        }
    }
`

export enum QueryUserProfile { Query1 = "query1" }

/** Supported public-profile documents. */
export const queryUserProfileMap: Record<QueryUserProfile, DocumentNode> = {
    [QueryUserProfile.Query1]: query1,
}

/** Resolve one public profile by canonical or legacy username. */
export const queryUserProfile = async ({
    query = QueryUserProfile.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryUserProfile, UserProfileRequest>) => {
    const apollo = createApolloClient({ withAuth: false, headers, signal, debug })
    return apollo.query<QueryUserProfileResponse, UserProfileRequest>({
        query: queryUserProfileMap[query],
        variables: request,
        fetchPolicy: "no-cache",
    })
}
