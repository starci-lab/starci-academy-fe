import type { GraphQLResponse } from "../../types"

/** Public-profile evidence query families supported by the backend. */
export type ProfileEvidenceKind =
    | "job-readiness" | "courses" | "contributions" | "pinned-projects" | "capstones"
    | "solved-challenges" | "challenge-strength" | "coding-skills" | "coding-history"
    | "coding-progress" | "coding-rank" | "coding-xp"
    | "achievements" | "activity" | "challenge-detail" | "coding-detail"

/** One joined course and its public completion dimensions. */
export type ProfileCourse = { readonly globalId: string, readonly path: string, readonly label: string, readonly thumbnailUrl?: string | null, readonly contentCompleted: number, readonly contentTotal: number, readonly challengeCompleted: number, readonly challengeTotal: number, readonly completed: number, readonly total: number, readonly completionPercent: number, readonly isEnrolled: boolean }
/** One public contribution-calendar day. */
export type ProfileContribution = { readonly date: string, readonly contents: number, readonly challenges: number, readonly milestones: number, readonly total: number }
/** One owner-selected portfolio project. */
export type ProfilePinnedProject = { readonly id: string, readonly type: string, readonly title: string, readonly description?: string | null, readonly url?: string | null, readonly techStack: ReadonlyArray<string>, readonly orderIndex: number, readonly isVerified: boolean }
/** One verified course capstone and its ordered roadmap. */
export type ProfileCapstone = { readonly courseGlobalId: string, readonly courseTitle: string, readonly totalMilestones: number, readonly completedMilestones: number, readonly totalTasks: number, readonly completedTasks: number, readonly milestones: ReadonlyArray<{ readonly milestoneGlobalId: string, readonly title: string, readonly position: number, readonly totalTasks: number, readonly passedTasks: number, readonly tasks: ReadonlyArray<{ readonly taskGlobalId: string, readonly title: string, readonly passed: boolean, readonly score?: number | null, readonly passedAt?: string | null }> }> }
/** One passed challenge submission exposed as profile proof. */
export type ProfileSolvedChallenge = { readonly id: string, readonly title: string, readonly submissionUrl?: string | null, readonly submissionType?: string | null, readonly selectedLang?: string | null, readonly passedAt: string, readonly difficulty?: string | null, readonly score?: number | null, readonly courseTitle?: string | null, readonly courseGlobalId?: string | null, readonly courseSlug?: string | null }
/** One key and solved-count pair in a coding breakdown. */
export type ProfileBreakdown = { readonly key: string, readonly solved: number }
/** One solved problem in the public coding history. */
export type ProfileCodingHistory = { readonly problemTitle: string, readonly slug: string, readonly difficulty?: string | null, readonly domain?: string | null, readonly languages: ReadonlyArray<string>, readonly firstSolvedAt: string }
/** Coding evidence grouped by language, difficulty and domain. */
export type ProfileCodingSkills = { readonly byLanguage: ReadonlyArray<ProfileBreakdown>, readonly byDifficulty: ReadonlyArray<ProfileBreakdown>, readonly byDomain: ReadonlyArray<ProfileBreakdown> }
/** Public coding-problem completion identifiers and points. */
export type ProfileCodingProgress = { readonly solvedProblemIds: ReadonlyArray<string>, readonly attemptedProblemIds: ReadonlyArray<string>, readonly revealedProblemIds: ReadonlyArray<string>, readonly totalPoints: number }
/** Public coding rank and percentile. */
export type ProfileCodingRank = { readonly rank?: number | null, readonly percentile?: number | null }
/** Public coding XP total. */
export type ProfileCodingXp = { readonly codingXp: number }
/** One public achievement and its earned/progress facts. */
export type ProfileAchievement = { readonly slug: string, readonly name: string, readonly description?: string | null, readonly iconKey?: string | null, readonly earned: boolean, readonly earnedAt?: string | null, readonly currentValue: number, readonly threshold: number, readonly tierReached?: string | null, readonly rarityPercent?: number | null }
/** One chronological public activity record. */
export type ProfileActivity = { readonly id: string, readonly actorGlobalId: string, readonly actorUsername: string, readonly actorAvatar?: string | null, readonly type: string, readonly targetGlobalId?: string | null, readonly targetLabel?: string | null, readonly at: string, readonly reactionCount: number, readonly myReaction?: string | null, readonly isMine: boolean }

/** GraphQL response envelope keyed by evidence family. */
export type ProfileEvidenceResponse = Readonly<Record<string, GraphQLResponse<unknown>>>
