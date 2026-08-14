export type A2State = "pending" | "ready" | "empty" | "error"

export interface A2Task {
    id: string
    title: string
    type: string | null
    maxScore: number
    completed: boolean
    lastScore: number
}

export interface A2Milestone {
    id: string
    title: string
    orderIndex: number
    tasks: A2Task[]
}

export interface A2Outline {
    course: { id: string; title: string; displayId: string }
    milestones: A2Milestone[]
    progress: { tasksCompleted: number; tasksTotal: number; completionPercent: number }
    currentTask: { kind: string; id: string; milestoneId: string | null } | null
}

export interface A2Attempt {
    id: string
    attemptNumber: number
    passed: boolean
    score: number
    shortFeedback?: string | null
    processedAt?: string | null
    servedModel?: string | null
    servedProvider?: string | null
}

export interface A2Feedback {
    id: string
    message: string
    severity?: string | null
    sortIndex: number
    location?: string | null
    suggestion?: string | null
}
