import type { ContentAiRouteAnchor } from "./content-ai-route-context"

/** The exact learner-owned excerpt attached to the next Content AI turn. */
export type ContentAiSelectionContext = {
    readonly kind: "prose" | "code"
    readonly quote: string
    readonly path?: string
    readonly startLine?: number
    readonly endLine?: number
    readonly hasLocalEdit?: boolean
    readonly runtimeError?: string
}

export type ContentAiSelectionInput = ContentAiSelectionContext

export const CONTENT_AI_SELECTION_MIN = 3
export const CONTENT_AI_SELECTION_MAX = 600

const finitePositiveInteger = (value?: number): number | undefined =>
    value !== undefined && Number.isInteger(value) && value > 0 ? value : undefined

/** Validate and canonicalize one prose/code selection without changing code whitespace. */
export const normalizeContentAiSelection = (
    input: ContentAiSelectionInput,
): ContentAiSelectionContext | null => {
    const quote = input.quote.trim()
    if (quote.length < CONTENT_AI_SELECTION_MIN || quote.length > CONTENT_AI_SELECTION_MAX) return null
    const startLine = finitePositiveInteger(input.startLine)
    const requestedEnd = finitePositiveInteger(input.endLine)
    const endLine = startLine === undefined
        ? undefined
        : Math.max(startLine, requestedEnd ?? startLine)
    return {
        kind: input.kind,
        quote,
        path: input.path?.trim() || undefined,
        startLine,
        endLine,
        hasLocalEdit: input.hasLocalEdit === true ? true : undefined,
        runtimeError: input.runtimeError?.trim() || undefined,
    }
}

/** Compact single-line grounding; transcript quotes remain separate from this summary. */
export const formatContentAiContextSummary = (
    anchor: ContentAiRouteAnchor,
    selection?: ContentAiSelectionContext,
): string => {
    const route = anchor.id === undefined ? anchor.scope : `${anchor.scope}:${anchor.id}`
    if (selection === undefined) return route
    const lines = selection.startLine === undefined
        ? undefined
        : selection.endLine === selection.startLine
            ? `L${selection.startLine}`
            : `L${selection.startLine}-${selection.endLine}`
    return [route, selection.path, lines, selection.hasLocalEdit ? "local" : undefined]
        .filter((part): part is string => part !== undefined)
        .join(" · ")
}

/** Embed exact selection evidence in the request while keeping it separately renderable in the turn. */
export const buildContentAiQuestion = (question: string, selection?: ContentAiSelectionContext): string => {
    if (selection === undefined) return question.trim()
    const language = selection.kind === "code" ? selection.path?.split(".").pop() ?? "code" : "text"
    const location = selection.path === undefined
        ? ""
        : `\nSource: ${selection.path}${selection.startLine === undefined ? "" : `:${selection.startLine}-${selection.endLine ?? selection.startLine}`}`
    const runtime = selection.runtimeError === undefined ? "" : `\nRuntime error:\n${selection.runtimeError}`
    return `${question.trim()}${location}\n\nQuoted selection:\n\`\`\`${language}\n${selection.quote}\n\`\`\`${runtime}`
}
