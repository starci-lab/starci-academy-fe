import type { GraphQLResponse } from "../../types"

/** Public identity and profile-chrome facts returned by `userProfile`. */
export type UserProfileData = {
    readonly id: string
    readonly username: string
    readonly displayName?: string | null
    readonly bio?: string | null
    readonly avatar?: string | null
    readonly githubUsername?: string | null
    readonly createdAt: string
    readonly followerCount: number
    readonly followingCount: number
    readonly isFollowedByMe: boolean
    readonly profileLocked: boolean
    readonly openToWork: boolean
    readonly featuredAchievementSlug?: string | null
    readonly roleTitle?: string | null
    readonly location?: string | null
    readonly workMode?: string | null
    readonly linkedinUrl?: string | null
    readonly websiteUrl?: string | null
}

/** Public profile GraphQL envelope. */
export type QueryUserProfileResponse = {
    readonly userProfile: GraphQLResponse<UserProfileData | null>
}

/** One public CV summary; `pdfUrl` stays null until compilation succeeds. */
export type PublicUserCvData = {
    readonly id: string
    readonly label?: string | null
    readonly pdfUrl?: string | null
    readonly updatedAt: string
}

/** Public CV GraphQL envelope. */
export type QueryPublicUserCvResponse = {
    readonly publicUserCv: GraphQLResponse<PublicUserCvData | null>
}
