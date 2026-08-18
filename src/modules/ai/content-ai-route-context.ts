import type { QueryContentAiSessionsRequest } from "@/modules/api/graphql/queries/types/content-ai-sessions"
import { isLiveAssessmentRoute } from "@/modules/learn/is-live-assessment-route"

/** The product scope grounding one Content AI conversation. */
export type ContentAiScope = "content" | "task" | "challenge" | "foundation" | "course" | "global"

/** Stable route evidence attached to the next AI question. */
export type ContentAiRouteAnchor = {
    readonly scope: ContentAiScope
    readonly id?: string
    readonly path: string
}

/** Drop query/hash/locale so every caller compares the same path identity. */
export const normalizeContentAiPath = (pathname: string): string => {
    const clean = pathname.split(/[?#]/u, 1)[0]
    const segments = clean.split("/").filter(Boolean)
    const withoutLocale = segments[0] === "en" || segments[0] === "vi" ? segments.slice(1) : segments
    return `/${withoutLocale.join("/")}`.replace(/\/$/u, "") || "/"
}

/** Resolve the narrowest supported grounding id from a product route. */
export const resolveContentAiRouteAnchor = (pathname: string): ContentAiRouteAnchor => {
    const path = normalizeContentAiPath(pathname)
    const segments = path.split("/").filter(Boolean)

    const challengeIndex = segments.lastIndexOf("challenges")
    const challengeId = challengeIndex < 0 ? undefined : segments[challengeIndex + 1]
    if (challengeId !== undefined) return { scope: "challenge", id: challengeId, path }

    const taskIndex = segments.lastIndexOf("tasks")
    const taskId = taskIndex < 0 ? undefined : segments[taskIndex + 1]
    if (taskId !== undefined) return { scope: "task", id: taskId, path }

    const contentIndex = segments.lastIndexOf("contents")
    const contentId = contentIndex < 0 ? undefined : segments[contentIndex + 1]
    if (contentId !== undefined) return { scope: "content", id: contentId, path }

    const foundationIndex = segments.lastIndexOf("foundations")
    const foundationId = foundationIndex < 0 ? undefined : segments[foundationIndex + 2]
    if (foundationId !== undefined) return { scope: "foundation", id: foundationId, path }

    const courseIndex = segments.lastIndexOf("courses")
    const courseDisplayId = courseIndex < 0 ? undefined : segments[courseIndex + 1]
    if (courseDisplayId !== undefined) return { scope: "course", id: courseDisplayId, path }

    return { scope: "global", path }
}

/** Convert route evidence to the backend request, resolving the course slug to its UUID first. */
export const resolveContentAiAnchorRequest = (
    anchor: ContentAiRouteAnchor,
    courseId?: string,
): QueryContentAiSessionsRequest | null => {
    if (anchor.scope === "global" || anchor.id === undefined) return { scope: "global" }
    if (anchor.scope === "course") return courseId === undefined ? null : { scope: "course", courseId }
    if (anchor.scope === "content") return { scope: "content", contentId: anchor.id }
    if (anchor.scope === "task") return { scope: "task", taskId: anchor.id }
    if (anchor.scope === "challenge") return { scope: "challenge", challengeId: anchor.id }
    return { scope: "foundation", foundationId: anchor.id }
}

/** Auth and focused live-evaluation routes do not mount the global assistant. */
export const isContentAiRouteHidden = (pathname: string): boolean => {
    const path = normalizeContentAiPath(pathname)
    if (path === "/authentication" || path.startsWith("/authentication/")) return true
    return isLiveAssessmentRoute(path)
}

/** Route navigation changes grounding when either its scope, id or normalized path changes. */
export const isSameContentAiAnchor = (left: ContentAiRouteAnchor, right: ContentAiRouteAnchor): boolean =>
    left.scope === right.scope && left.id === right.id && left.path === right.path
