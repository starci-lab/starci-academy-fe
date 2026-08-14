import { describe, expect, it } from "vitest"
import {
    buildContentAiQuestion,
    formatContentAiContextSummary,
    normalizeContentAiSelection,
} from "./content-ai-selection-context"

describe("content-ai-selection-context", () => {
    it("rejects selections outside the 3-600 character boundary", () => {
        expect(normalizeContentAiSelection({ kind: "prose", quote: "ab" })).toBeNull()
        expect(normalizeContentAiSelection({ kind: "code", quote: "x".repeat(601) })).toBeNull()
    })

    it("normalizes line order and keeps a compact one-line summary", () => {
        const selection = normalizeContentAiSelection({
            kind: "code",
            quote: "  const answer = 42  ",
            path: "src/answer.ts",
            startLine: 14,
            endLine: 12,
            hasLocalEdit: true,
        })
        expect(selection).not.toBeNull()
        expect(formatContentAiContextSummary(
            { scope: "content", id: "lesson-1", path: "/contents/lesson-1" },
            selection ?? undefined,
        )).toBe("content:lesson-1 · src/answer.ts · L14 · local")
    })

    it("quotes exact code and location in the outgoing question", () => {
        const question = buildContentAiQuestion("Why abort here?", {
            kind: "code",
            quote: "controller.abort()",
            path: "src/useTodos.ts",
            startLine: 20,
            endLine: 20,
        })
        expect(question).toContain("Source: src/useTodos.ts:20-20")
        expect(question).toContain("```ts\ncontroller.abort()\n```")
    })
})
