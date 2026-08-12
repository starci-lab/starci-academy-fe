import type { GraphQLResponse } from "../../types"
import type { ReactionType } from "./reactions"

/** Activity kinds returned by the dashboard feed. */
export enum ActivityType {
    LessonRead = "lessonRead",
    LessonBookmarked = "lessonBookmarked",
    ChallengePassed = "challengePassed",
    CodingSolved = "codingSolved",
    MilestonePassed = "milestonePassed",
    AiLabPassed = "aiLabPassed",
    CourseEnrolled = "courseEnrolled",
    DiscussionCommented = "discussionCommented",
    UserFollowed = "userFollowed",
}

/** One activity in the viewer's dashboard feed. */
export interface QueryMyFeedItemData {
    readonly id: string
    readonly actorGlobalId: string
    readonly actorUsername: string
    readonly actorAvatar: string | null
    readonly type: ActivityType
    readonly targetGlobalId: string | null
    readonly targetLabel: string | null
    readonly at: string
    readonly reactionCount: number
    readonly myReaction: ReactionType | null
    readonly isMine: boolean
}

/** Which dashboard feed the viewer is reading. */
export enum MyFeedTab {
    ForYou = "forYou",
    Following = "following",
}

/** Category filter applied to the dashboard feed. */
export enum MyFeedCategory {
    All = "all",
    Courses = "courses",
    Achievements = "achievements",
    People = "people",
}

/** Cursor request accepted by the dashboard feed. */
export interface MyFeedRequest {
    readonly tab: MyFeedTab
    readonly cursor?: string
    readonly limit?: number
    readonly category?: MyFeedCategory
}

/** One cursor page returned by the dashboard feed. */
export interface QueryMyFeedResponseData {
    readonly items: Array<QueryMyFeedItemData>
    readonly nextCursor: string | null
}

/** Standard response envelope returned by `myFeed`. */
export interface QueryMyFeedResponse {
    readonly myFeed: GraphQLResponse<QueryMyFeedResponseData>
}

