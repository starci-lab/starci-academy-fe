"use client"

import { useEffect, useRef, useState } from "react"
import { codeToHtml } from "shiki"
import type { LeafProps } from "@/components/contracts/props"

/**
 * BRANCH - `MarkdownCodeBlock`: a run of code inside an authored document, set apart from the prose.
 *
 * WHY IT IS A BRANCH AND `leaves/CodeBlock` IS NOT THIS. Two components draw code and they are not
 * the same component. `leaves/CodeBlock` is the plain leaf for one code VALUE outside a document -
 * closed JSON data, no chrome. This one belongs to the document viewer: it owns a header row, a
 * copy control and asynchronous highlighting, which is more than one intrinsic value and therefore
 * more than a leaf. An earlier revision of this file claimed the leaf's own path as its
 * materialization target; that path is occupied by a different component, and the claim is removed
 * rather than left to be discovered by whoever tries to honour it.
 *
 * IT IS HIGHLIGHTED, LAZILY. Shiki runs once the block is near the viewport and its theme follows
 * the document's. Until it answers, the same code renders unhighlighted rather than as a gap - a
 * lesson is readable before it is coloured.
 *
 * THE FRAME IS `SURFACE-IN-SURFACE-7`, RECESSED FORM. The host is the reading surface, so the block
 * recedes into it: `bg-background` under a surface reads as an inset well, where the same ground on
 * page ground would read as nothing at all. The frame is not a membership claim - a header row over
 * a code region is not a joined set of comparable members - it is where the scroll stops.
 *
 * IT SCROLLS RATHER THAN WRAPS, and the two must not be argued separately from the frame. Code that
 * wraps loses its meaning by the line: a command broken mid-string shows an opening quote and never
 * its close, and an indented block stops reading as its own structure. `OVERFLOW-5` and the frame
 * above are one decision, which is why the scroll sits on the region the frame encloses.
 *
 * THE LANGUAGE IS DRAWN WHEN IT IS KNOWN, because a fence in a lesson is usually shell, and a
 * reader about to paste a line needs to know which shell.
 */

/** What this leaf draws. */
export type CodeBlockData = {
    /** The code exactly as authored - never trimmed, never re-indented. */
    readonly code: string
    /** The fence's language, when the author wrote one. */
    readonly language?: string
    readonly copyLabel?: string
}

/** Props for {@link CodeBlock}. */
export type CodeBlockProps = LeafProps<CodeBlockData>

const FRAME_CLASSES = "w-full min-w-0 overflow-hidden rounded-xl border border-border bg-background shadow-none"
const HEADER_CLASSES = "flex items-center justify-between border-b border-separator px-3 py-2"
const LANGUAGE_CLASSES = "text-xs leading-4 text-muted"
const CODE_CLASSES = "w-full min-w-0 overflow-x-auto p-3 font-mono text-sm leading-5 text-foreground [&_pre]:!bg-transparent [&_pre]:!p-0"
const CODE_SCROLL = "[&_code]:!whitespace-pre [&_pre]:!whitespace-pre"

const LANGUAGE_LABELS: Readonly<Record<string, string>> = {
    bash: "Bash", csharp: "C#", cs: "C#", css: "CSS", dockerfile: "Dockerfile",
    go: "Go", html: "HTML", java: "Java", javascript: "JavaScript", js: "JavaScript",
    json: "JSON", markdown: "Markdown", md: "Markdown", python: "Python", py: "Python",
    shell: "Shell", sh: "Bash", sql: "SQL", ts: "TypeScript", tsx: "TSX",
    typescript: "TypeScript", yaml: "YAML", yml: "YAML",
}

/**
 * Draw a run of code.
 *
 * @param input - {@link CodeBlockProps}
 */
export const MarkdownCodeBlock = (input: CodeBlockProps) => {
    const hostRef = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)
    const [html, setHtml] = useState<string>()
    const language = input.props.language ?? "text"

    useEffect(() => {
        const host = hostRef.current
        if (host === null || visible) return
        if (typeof IntersectionObserver === "undefined") {
            setVisible(true)
            return
        }
        const observer = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting !== true) return
            setVisible(true)
            observer.disconnect()
        }, { rootMargin: "300px" })
        observer.observe(host)
        return () => observer.disconnect()
    }, [visible])

    useEffect(() => {
        if (!visible) return
        let active = true
        const theme = document.documentElement.classList.contains("dark")
            ? "material-theme-darker"
            : "material-theme-lighter"
        void codeToHtml(input.props.code, { lang: language, theme })
            .then((value) => { if (active) setHtml(value) })
            .catch(() => { if (active) setHtml(undefined) })
        return () => { active = false }
    }, [input.props.code, language, visible])

    const copy = () => { void navigator.clipboard?.writeText(input.props.code) }

    return (
        <div ref={hostRef} data-tier="branch" data-component="MarkdownCodeBlock" className={FRAME_CLASSES}>
            <div className={HEADER_CLASSES}>
                <span className={LANGUAGE_CLASSES}>{LANGUAGE_LABELS[language.toLowerCase()] ?? language}</span>
                <button type="button" className="text-xs text-muted hover:text-foreground" onClick={copy}>{input.props.copyLabel ?? "Copy"}</button>
            </div>
            {html === undefined
                ? <pre className={`${CODE_CLASSES} whitespace-pre`}><code>{input.props.code}</code></pre>
                : <div className={`${CODE_CLASSES} ${CODE_SCROLL}`} dangerouslySetInnerHTML={{ __html: html }} />}
        </div>
    )
}

/** Source-level tier marker. */
export const meta = { shape: "branch", world: "pure" } as const
