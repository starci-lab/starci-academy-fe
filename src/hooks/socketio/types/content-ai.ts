import type { CourseAdvisorMetadata } from "@/modules/ai/course-advisor-response"

/** Observable lifecycle of the authenticated `/content_ai` namespace. */
export type ContentAiSocketState = "idle" | "connecting" | "connected" | "reconnecting" | "failed"

/** One prior turn replayed to the model, oldest first. */
export interface ContentAiStreamHistoryTurn {
    readonly role: "user" | "assistant"
    readonly content: string
}

/** Grounding fields accepted independently for each ask. */
export interface ContentAiStreamAnchor {
    readonly contentId?: string | null
    readonly taskId?: string | null
    readonly challengeId?: string | null
    readonly quizId?: string | null
    readonly foundationId?: string | null
    readonly courseId?: string | null
}

/** One streamed ask. Quota is deliberately absent: backend model serving and debit are authoritative. */
export interface AskContentAiStreamParams extends ContentAiStreamAnchor {
    readonly sessionId: string
    readonly question: string
    readonly history?: ReadonlyArray<ContentAiStreamHistoryTurn>
    readonly model?: string | null
    readonly provider?: string | null
    readonly experience?: "learn_companion" | "course_advisor" | null
    readonly onDelta: (delta: string) => void
    readonly onDone: (error?: string, courseAdvisor?: CourseAdvisorMetadata) => void
}

/** Server chunk inside the common Socket.IO success envelope. */
export interface ContentAiStreamChunk {
    readonly streamId: string
    readonly delta: string
    readonly done: boolean
    readonly error?: string
    readonly courseAdvisor?: CourseAdvisorMetadata
}

/** Shape emitted by the backend `WsResponseService`. */
export interface ContentAiStreamChunkMessage {
    readonly success?: boolean
    readonly message?: string
    readonly data?: ContentAiStreamChunk
}

/** Client publication envelope expected by the backend gateway. */
export interface AskContentAiStreamMessage {
    readonly locale: string
    readonly data: ContentAiStreamAnchor & {
        readonly streamId: string
        readonly sessionId: string
        readonly question: string
        readonly history?: ReadonlyArray<ContentAiStreamHistoryTurn>
        readonly model?: string | null
        readonly provider?: string | null
        readonly experience?: "learn_companion" | "course_advisor" | null
    }
}

/** Client publication envelope used to stop one active stream. */
export interface AbortContentAiStreamMessage {
    readonly locale: string
    readonly data: { readonly streamId: string }
}
