import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { ProfileEvidenceKind, ProfileEvidenceResponse } from "./types/profile-evidence"

const documents: Record<ProfileEvidenceKind, DocumentNode> = {
    "job-readiness": gql`query ProfileJobReadiness($userId: ID!) { userJobReadiness(userId: $userId) { success message error data { foundation { codingPercentile cvScore } tracks { courseId courseTitle courseSlug capstoneScore interviewScore cvScore depthScore band isQualified } } } }`,
    courses: gql`query ProfileCourses($userId: ID!) { userCourses(userId: $userId) { success message error data { globalId path label thumbnailUrl contentCompleted contentTotal challengeCompleted challengeTotal completed total completionPercent isEnrolled } } }`,
    contributions: gql`query ProfileContributions($userId: ID!, $year: Int) { userContributionCalendar(userId: $userId, year: $year) { success message error data { date contents challenges milestones total } } }`,
    "pinned-projects": gql`query ProfilePinnedProjects($userId: ID!) { userPinnedProjects(userId: $userId) { success message error data { id type title description url techStack orderIndex isVerified } } }`,
    capstones: gql`query ProfileCapstones($userId: ID!) { userCapstoneProgress(userId: $userId) { success message error data { courseGlobalId courseTitle totalMilestones completedMilestones totalTasks completedTasks milestones { milestoneGlobalId title position totalTasks passedTasks tasks { taskGlobalId title passed score passedAt } } } } }`,
    "solved-challenges": gql`query ProfileSolvedChallenges($userId: ID!) { userSolvedChallenges(userId: $userId) { success message error data { id title submissionUrl submissionType selectedLang passedAt difficulty score courseTitle courseGlobalId courseSlug } } }`,
    "challenge-strength": gql`query ProfileChallengeStrength($userId: ID!) { userChallengeStrength(userId: $userId) { success message error data { percentile rank xp } } }`,
    "coding-skills": gql`query ProfileCodingSkills($userId: ID!) { userCodingSkills(userId: $userId) { success message error data { byLanguage { key solved } byDifficulty { key solved } byDomain { key solved } } } }`,
    "coding-history": gql`query ProfileCodingHistory($userId: ID!) { userCodingHistory(userId: $userId) { success message error data { problemTitle slug difficulty domain languages firstSolvedAt } } }`,
    "coding-progress": gql`query ProfileCodingProgress($userId: ID!) { userCodingProgress(userId: $userId) { success message error data { solvedProblemIds attemptedProblemIds revealedProblemIds totalPoints } } }`,
    "coding-rank": gql`query ProfileCodingRank($userId: ID!) { userCodingRank(userId: $userId) { success message error data { rank percentile } } }`,
    "coding-xp": gql`query ProfileCodingXp($userId: ID!) { userXp(userId: $userId) { success message error data { codingXp } } }`,
    achievements: gql`query ProfileAchievements($userId: ID!) { userAchievements(userId: $userId) { success message error data { slug name description iconKey criteriaType threshold earned earnedAt currentValue tierReached rarityPercent } } }`,
    activity: gql`query ProfileActivity($request: UserFeedRequest!) { userFeed(request: $request) { success message error data { items { id actorGlobalId actorUsername actorAvatar type targetGlobalId targetLabel at reactionCount myReaction isMine } nextCursor } } }`,
    "challenge-detail": gql`query ProfileChallengeDetail($request: UserSolvedChallengeDetailRequest!) { userSolvedChallengeDetail(request: $request) { success message error data { id title submissionUrl submissionType selectedLang difficulty score courseTitle passedAt feedbacks { message detail severity location suggestion } attempts { attemptNumber score submissionUrl shortFeedback processedAt } } } }`,
    "coding-detail": gql`query ProfileCodingDetail($request: UserCodingProblemDetailRequest!) { userCodingProblemDetail(request: $request) { success message error data { problem { id slug title statement difficulty points domain tags testcases { id input expectedOutput isSample sortIndex } starterCodes { id language code } } submission { languages verdict passedCount totalCount firstSolvedAt } } } }`,
}

const fieldNames: Record<ProfileEvidenceKind, string> = {
    "job-readiness": "userJobReadiness", courses: "userCourses", contributions: "userContributionCalendar",
    "pinned-projects": "userPinnedProjects", capstones: "userCapstoneProgress", "solved-challenges": "userSolvedChallenges",
    "challenge-strength": "userChallengeStrength", "coding-skills": "userCodingSkills", "coding-history": "userCodingHistory",
    "coding-progress": "userCodingProgress", "coding-rank": "userCodingRank", "coding-xp": "userXp",
    achievements: "userAchievements", activity: "userFeed", "challenge-detail": "userSolvedChallengeDetail", "coding-detail": "userCodingProblemDetail",
}

/** Execute one independently cached public-profile evidence request. */
export const queryProfileEvidence = async (kind: ProfileEvidenceKind, variables: Readonly<Record<string, unknown>>) => {
    // Every profile evidence resolver in this module is public by design. Keeping the anonymous
    // chain is what lets signed-out visitors inspect an unlocked profile without an auth failure.
    const apollo = createApolloClient({ withAuth: false })
    const result = await apollo.query<ProfileEvidenceResponse>({ query: documents[kind], variables, fetchPolicy: "no-cache" })
    return result.data?.[fieldNames[kind]]?.data
}
