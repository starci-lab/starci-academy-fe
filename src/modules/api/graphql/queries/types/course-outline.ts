import type { GraphQLResponse } from "../../types"

/** One challenge in the viewer-specific course outline. */
export type CourseOutlineChallenge = {
    readonly id: string
    readonly title: string
    readonly difficulty: string
    readonly maxScore: number
    readonly status: string
    readonly lastScore: number
    readonly completed: boolean
}

/** One lesson and its practice challenges in authored order. */
export type CourseOutlineLesson = {
    readonly id: string
    readonly displayId: string
    readonly title: string
    readonly minutesRead: number
    readonly difficulty: string | null
    readonly isPremium: boolean
    readonly isRead: boolean
    readonly challenges: ReadonlyArray<CourseOutlineChallenge>
}

/** One authored module in the course map. */
export type CourseOutlineModule = {
    readonly id: string
    readonly title: string
    readonly orderIndex: number
    readonly isPremium: boolean
    readonly lessons: ReadonlyArray<CourseOutlineLesson>
}

/** One capstone task carried by the shared outline response. */
export type CourseOutlineTask = {
    readonly id: string
    readonly title: string
    readonly type: string | null
    readonly maxScore: number
    readonly completed: boolean
    readonly lastScore: number
    readonly numAttempts: number
}

/** One capstone milestone carried by the shared outline response. */
export type CourseOutlineMilestone = {
    readonly id: string
    readonly title: string
    readonly orderIndex: number
    readonly tasks: ReadonlyArray<CourseOutlineTask>
}

/** A backend-authored pointer to the viewer's next course work. */
export type CourseOutlineTarget = {
    readonly kind: "lesson" | "challenge" | "milestoneTask"
    readonly id: string
    readonly milestoneId: string | null
}

/** Viewer-specific course tree, aggregate progress and resume pointers. */
export type CourseOutline = {
    readonly course: {
        readonly id: string
        readonly title: string
        readonly displayId: string
    }
    readonly modules: ReadonlyArray<CourseOutlineModule>
    readonly milestones: ReadonlyArray<CourseOutlineMilestone>
    readonly progress: {
        readonly lessonsRead: number
        readonly lessonsTotal: number
        readonly challengesCompleted: number
        readonly challengesTotal: number
        readonly tasksCompleted: number
        readonly tasksTotal: number
        readonly completionPercent: number
    }
    readonly currentTask: CourseOutlineTarget | null
    readonly nextContentTask: CourseOutlineTarget | null
}

/** GraphQL envelope returned by the viewer-specific outline query. */
export type QueryCourseOutlineResponse = {
    readonly myCourseOutline: GraphQLResponse<CourseOutline>
}
