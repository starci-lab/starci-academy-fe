import { describe, expect, it } from "vitest"
import { buildContentAiQuestion, formatContentAiContextSummary, normalizeContentAiSelection, parseContentAiQuestion } from "../../modules/ai/content-ai-selection-context"

describe("content AI selection coverage", () => {
    it("normalizes, formats and parses a grounded code excerpt", () => {
        const selection = normalizeContentAiSelection({ kind: "code", quote: "  const value = 1  ", path: "src/a.ts", startLine: 3, endLine: 2, hasLocalEdit: true, runtimeError: "boom" })
        expect(selection?.endLine).toBe(3)
        expect(formatContentAiContextSummary({ scope: "content", id: "c", path: "/courses/c/learn/content" }, selection ?? undefined)).toContain("L3")
        const question = buildContentAiQuestion("Why?", selection ?? undefined)
        expect(parseContentAiQuestion(question).selection?.runtimeError).toBe("boom")
        expect(normalizeContentAiSelection({ kind: "prose", quote: "no" })).toBeNull()
    })
})
