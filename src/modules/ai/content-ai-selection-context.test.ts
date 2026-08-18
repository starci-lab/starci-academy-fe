import { describe, expect, it } from "vitest"
import {
    buildContentAiQuestion,
    CONTENT_AI_SELECTION_MAX,
    CONTENT_AI_SELECTION_MIN,
    formatContentAiContextSummary,
    normalizeContentAiSelection,
    parseContentAiQuestion,
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

    it("accepts a selection sitting exactly on either boundary", () => {
        expect(normalizeContentAiSelection({
            kind: "prose",
            quote: "a".repeat(CONTENT_AI_SELECTION_MIN),
        })).toMatchObject({ quote: "aaa" })
        expect(normalizeContentAiSelection({
            kind: "prose",
            quote: "b".repeat(CONTENT_AI_SELECTION_MAX),
        })?.quote).toHaveLength(CONTENT_AI_SELECTION_MAX)
    })

    it("drops every absent optional field rather than carrying an empty one", () => {
        expect(normalizeContentAiSelection({ kind: "prose", quote: "  a sentence  " })).toEqual({
            kind: "prose",
            quote: "a sentence",
            path: undefined,
            startLine: undefined,
            endLine: undefined,
            hasLocalEdit: undefined,
            runtimeError: undefined,
        })
    })

    it("blanks whitespace-only path and runtime error, and refuses a false local edit", () => {
        expect(normalizeContentAiSelection({
            kind: "code",
            quote: "const a = 1",
            path: "   ",
            runtimeError: "   ",
            hasLocalEdit: false,
        })).toMatchObject({ path: undefined, runtimeError: undefined, hasLocalEdit: undefined })
    })

    it("keeps a trimmed runtime error and an acknowledged local edit", () => {
        expect(normalizeContentAiSelection({
            kind: "code",
            quote: "const a = 1",
            runtimeError: "  TypeError: a is not a function  ",
            hasLocalEdit: true,
        })).toMatchObject({
            runtimeError: "TypeError: a is not a function",
            hasLocalEdit: true,
        })
    })

    it("closes an open range on its own start line and widens a genuine one", () => {
        expect(normalizeContentAiSelection({ kind: "code", quote: "let x", startLine: 7 }))
            .toMatchObject({ startLine: 7, endLine: 7 })
        expect(normalizeContentAiSelection({ kind: "code", quote: "let x", startLine: 7, endLine: 19 }))
            .toMatchObject({ startLine: 7, endLine: 19 })
    })

    it("discards a line number that is not a positive integer, and the range with it", () => {
        expect(normalizeContentAiSelection({ kind: "code", quote: "let x", startLine: 0, endLine: 9 }))
            .toMatchObject({ startLine: undefined, endLine: undefined })
        expect(normalizeContentAiSelection({ kind: "code", quote: "let x", startLine: 1.5 }))
            .toMatchObject({ startLine: undefined, endLine: undefined })
        expect(normalizeContentAiSelection({ kind: "code", quote: "let x", startLine: 4, endLine: 2.5 }))
            .toMatchObject({ startLine: 4, endLine: 4 })
    })

    it("summarizes a scope with no id and no selection as the bare route", () => {
        expect(formatContentAiContextSummary({ scope: "global", path: "/dashboard" })).toBe("global")
        expect(formatContentAiContextSummary(
            { scope: "course", id: "fullstack", path: "/courses/fullstack" },
        )).toBe("course:fullstack")
    })

    it("prints a multi-line range and omits absent parts of the summary", () => {
        expect(formatContentAiContextSummary(
            { scope: "content", id: "lesson-1", path: "/contents/lesson-1" },
            { kind: "code", quote: "x", path: "src/a.ts", startLine: 14, endLine: 21 },
        )).toBe("content:lesson-1 · src/a.ts · L14-21")
        expect(formatContentAiContextSummary(
            { scope: "content", id: "lesson-1", path: "/contents/lesson-1" },
            { kind: "prose", quote: "x" },
        )).toBe("content:lesson-1")
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

    it("sends a question without grounding as the trimmed question alone", () => {
        expect(buildContentAiQuestion("  Why abort here?  ")).toBe("Why abort here?")
    })

    it("labels prose as text and pathless code as code", () => {
        expect(buildContentAiQuestion("Explain", { kind: "prose", quote: "A claim" }))
            .toBe("Explain\n\nQuoted selection:\n```text\nA claim\n```")
        expect(buildContentAiQuestion("Explain", { kind: "code", quote: "a()" }))
            .toContain("```code\na()\n```")
    })

    it("omits the line range when the path carries no line numbers", () => {
        const question = buildContentAiQuestion("Explain", {
            kind: "code",
            quote: "a()",
            path: "src/a.ts",
        })
        expect(question).toContain("\nSource: src/a.ts\n")
        expect(question).not.toContain("src/a.ts:")
    })

    it("closes an open range and appends the runtime error the learner saw", () => {
        const question = buildContentAiQuestion("Why does this throw?", {
            kind: "code",
            quote: "a()",
            path: "src/a.ts",
            startLine: 12,
            runtimeError: "TypeError: a is not a function",
        })
        expect(question).toContain("Source: src/a.ts:12-12")
        expect(question).toContain("\nRuntime error:\nTypeError: a is not a function")
    })
})

describe("parseContentAiQuestion", () => {
    it("round-trips persisted code evidence into a visible quote", () => {
        const persisted = buildContentAiQuestion("Why abort here?", {
            kind: "code",
            quote: "controller.abort()",
            path: "src/useTodos.ts",
            startLine: 20,
            endLine: 20,
        })
        expect(parseContentAiQuestion(persisted)).toEqual({
            question: "Why abort here?",
            quoteLanguage: "ts",
            selection: {
                kind: "code",
                quote: "controller.abort()",
                path: "src/useTodos.ts",
                startLine: 20,
                endLine: 20,
                runtimeError: undefined,
            },
        })
    })

    it("keeps malformed and legacy questions as plain text", () => {
        const legacy = "Why does this work?"
        expect(parseContentAiQuestion(legacy)).toEqual({ question: legacy })
    })

    it("keeps a marker whose fence never closes as plain text", () => {
        const broken = "Why?\n\nQuoted selection:\n```ts\ncontroller.abort()"
        expect(parseContentAiQuestion(broken)).toEqual({ question: broken })
    })

    it("restores a prose quote and reports no language of its own", () => {
        const persisted = buildContentAiQuestion("What is claimed?", {
            kind: "prose",
            quote: "The reducer owns the transition.",
        })
        expect(parseContentAiQuestion(persisted)).toEqual({
            question: "What is claimed?",
            quoteLanguage: "text",
            selection: {
                kind: "prose",
                quote: "The reducer owns the transition.",
                path: undefined,
                startLine: undefined,
                endLine: undefined,
                runtimeError: undefined,
            },
        })
    })

    it("treats an unlabelled fence as code with no reported language", () => {
        expect(parseContentAiQuestion("Why?\n\nQuoted selection:\n```\na()\n```")).toEqual({
            question: "Why?",
            quoteLanguage: undefined,
            selection: {
                kind: "code",
                quote: "a()",
                path: undefined,
                startLine: undefined,
                endLine: undefined,
                runtimeError: undefined,
            },
        })
    })

    it("reads a source without line numbers as a whole-file path", () => {
        const persisted = buildContentAiQuestion("Why?", {
            kind: "code",
            quote: "a()",
            path: "src/a.ts",
        })
        expect(parseContentAiQuestion(persisted)).toMatchObject({
            question: "Why?",
            selection: { path: "src/a.ts", startLine: undefined, endLine: undefined },
        })
    })

    it("round-trips the runtime error alongside the quoted code", () => {
        const persisted = buildContentAiQuestion("Why does this throw?", {
            kind: "code",
            quote: "a()",
            path: "src/a.ts",
            startLine: 3,
            endLine: 5,
            runtimeError: "TypeError: a is not a function",
        })
        expect(parseContentAiQuestion(persisted)).toEqual({
            question: "Why does this throw?",
            quoteLanguage: "ts",
            selection: {
                kind: "code",
                quote: "a()",
                path: "src/a.ts",
                startLine: 3,
                endLine: 5,
                runtimeError: "TypeError: a is not a function",
            },
        })
    })
})
