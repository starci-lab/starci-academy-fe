/** Course-fit intent validated by the backend before it reaches the UI. */
export type CourseAdvisorIntent = "answer" | "clarify" | "recommend"
/** Fit confidence is evidence strength, never an outcome guarantee. */
export type CourseAdvisorConfidence = "low" | "medium" | "high"

/** Model-owned fit evidence. Platform-owned course facts are hydrated separately. */
export type CourseAdvisorRecommendation = {
    readonly courseDisplayId: string
    readonly reason: string
    readonly fitGap?: string | null
    readonly confidence: CourseAdvisorConfidence
}

/** Typed terminal metadata emitted by the Course Advisor stream. */
export type CourseAdvisorMetadata = {
    readonly intent: CourseAdvisorIntent
    readonly clarificationQuestion?: string | null
    readonly recommendations: ReadonlyArray<CourseAdvisorRecommendation>
}

/** Visible assistant copy plus any durable advisor envelope restored from history. */
export type ParsedCourseAdvisorResponse = {
    readonly body: string
    readonly courseAdvisor?: CourseAdvisorMetadata
}

const ENVELOPE_PREFIX = "<!--starci-course-advisor:"
const ENVELOPE_SUFFIX = "-->"
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null
const isConfidence = (value: unknown): value is CourseAdvisorConfidence => value === "low" || value === "medium" || value === "high"

const parseRecommendations = (value: unknown): ReadonlyArray<CourseAdvisorRecommendation> => {
    if (!Array.isArray(value)) return []
    return value.slice(0, 2).flatMap((item) => {
        if (!isRecord(item)) return []
        const courseDisplayId = typeof item.courseDisplayId === "string" ? item.courseDisplayId.trim() : ""
        const reason = typeof item.reason === "string" ? item.reason.trim() : ""
        if (courseDisplayId === "" || reason === "" || !isConfidence(item.confidence)) return []
        return [{
            courseDisplayId,
            reason,
            fitGap: typeof item.fitGap === "string" ? item.fitGap.trim() : null,
            confidence: item.confidence,
        }]
    })
}

/** Strip the machine envelope and restore validated advisor metadata from persisted messages. */
export const parseCourseAdvisorResponse = (content: string): ParsedCourseAdvisorResponse => {
    const start = content.lastIndexOf(ENVELOPE_PREFIX)
    const end = start < 0 ? -1 : content.indexOf(ENVELOPE_SUFFIX, start + ENVELOPE_PREFIX.length)
    if (start < 0 || end < 0) return { body: content }
    const body = content.slice(0, start).trim()
    try {
        const value: unknown = JSON.parse(content.slice(start + ENVELOPE_PREFIX.length, end))
        if (!isRecord(value) || (value.intent !== "answer" && value.intent !== "clarify" && value.intent !== "recommend")) {
            return { body }
        }
        return {
            body,
            courseAdvisor: {
                intent: value.intent,
                clarificationQuestion: typeof value.clarificationQuestion === "string" ? value.clarificationQuestion.trim() : null,
                recommendations: value.intent === "recommend" ? parseRecommendations(value.recommendations) : [],
            },
        }
    } catch {
        return { body }
    }
}
