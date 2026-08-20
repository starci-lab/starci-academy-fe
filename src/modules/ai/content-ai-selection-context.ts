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

/** Untrusted selection data accepted at the normalization seam. */
export type ContentAiSelectionInput = ContentAiSelectionContext

/** A persisted user question split back into visible copy and its quoted grounding. */
export type ParsedContentAiQuestion = {
    readonly question: string
    readonly selection?: ContentAiSelectionContext
    readonly quoteLanguage?: string
}

/** Smallest excerpt that produces a useful grounded question. */
export const CONTENT_AI_SELECTION_MIN = 3
/** Largest excerpt retained in one grounded question. */
export const CONTENT_AI_SELECTION_MAX = 600

const finitePositiveInteger = (value?: number): number | undefined =>
    value !== undefined && Number.isInteger(value) && value > 0 ? value : undefined

const lineSummaryOf = (selection: ContentAiSelectionContext): string | undefined => {
    if (selection.startLine === undefined) return undefined
    if (selection.endLine === selection.startLine) return `L${selection.startLine}`
    return `L${selection.startLine}-${selection.endLine}`
}

const sourceLocationOf = (selection: ContentAiSelectionContext): string => {
    if (selection.path === undefined) return ""
    if (selection.startLine === undefined) return `\nSource: ${selection.path}`
    return `\nSource: ${selection.path}:${selection.startLine}-${selection.endLine ?? selection.startLine}`
}

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
    const lines = lineSummaryOf(selection)
    return [route, selection.path, lines, selection.hasLocalEdit ? "local" : undefined]
        .filter((part): part is string => part !== undefined)
        .join(" · ")
}

/** Embed exact selection evidence in the request while keeping it separately renderable in the turn. */
export const buildContentAiQuestion = (question: string, selection?: ContentAiSelectionContext): string => {
    if (selection === undefined) return question.trim()
    const language = selection.kind === "code" ? selection.path?.split(".").pop() ?? "code" : "text"
    const location = sourceLocationOf(selection)
    const runtime = selection.runtimeError === undefined ? "" : `\nRuntime error:\n${selection.runtimeError}`
    return `${question.trim()}${location}\n\nQuoted selection:\n\`\`\`${language}\n${selection.quote}\n\`\`\`${runtime}`
}

/** Restore the visible quote from persisted questions while leaving legacy or malformed text intact. */
export const parseContentAiQuestion = (content: string): ParsedContentAiQuestion => {
    const marker = "\n\nQuoted selection:\n"
    const markerIndex = content.lastIndexOf(marker)
    if (markerIndex < 0) return { question: content }
    const fenced = content.slice(markerIndex + marker.length).match(
        /^```([^\n]*)\n([\s\S]*?)\n```(?:\nRuntime error:\n([\s\S]*))?$/u,
    )
    if (fenced === null) return { question: content }

    let question = content.slice(0, markerIndex)
    let path: string | undefined
    let startLine: number | undefined
    let endLine: number | undefined
    const sourceIndex = question.lastIndexOf("\nSource: ")
    if (sourceIndex >= 0) {
        const source = question.slice(sourceIndex + "\nSource: ".length)
        question = question.slice(0, sourceIndex)
        const lines = source.match(/^(.*):(\d+)-(\d+)$/u)
        path = lines?.[1] ?? source
        startLine = lines === null ? undefined : Number(lines[2])
        endLine = lines === null ? undefined : Number(lines[3])
    }

    const quoteLanguage = fenced[1] || undefined
    return {
        question,
        quoteLanguage,
        selection: {
            kind: quoteLanguage === "text" ? "prose" : "code",
            quote: fenced[2],
            path,
            startLine,
            endLine,
            runtimeError: fenced[3],
        },
    }
}
