import type { LeafProps } from "~candidate/components/contracts/props"

/**
 * LEAF - `CodeBlock`: a run of code, set apart from the prose around it.
 *
 * Target path on materialization: `src/components/leaves/CodeBlock/index.tsx`.
 *
 * THE FOLDER WAS ALREADY THERE AND EMPTY. `src/components/leaves/CodeBlock/` exists in the target,
 * carries no file, and is named by nothing but one unrelated test - a name somebody reserved and
 * never filled. A coding academy whose article leaf drew code as a paragraph would lose the part of
 * the lesson the reader came for, so this fills the name rather than inventing a second one.
 *
 * IT IS NOT HIGHLIGHTED, AND THAT IS RECORDED RATHER THAN HIDDEN. Legacy colours code with shiki, a
 * dependency and a theme decision of its own; this draws mono type on the house's raised ground so
 * the block is unmistakably code, and highlighting is an open question the record carries.
 *
 * IT WRAPS RATHER THAN SCROLLS. A command is read to decide whether to run it, and a line that
 * leaves the card takes its own ending with it - the reader sees an opening quote and a host, and
 * never the closing quote. Horizontal scroll inside a reading column asks for a gesture nobody makes
 * while reading prose, so the line breaks and stays whole.
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
}

/** Props for {@link CodeBlock}. */
export type CodeBlockProps = LeafProps<CodeBlockData>

const FRAME_CLASSES = "flex w-full min-w-0 flex-col gap-2 rounded-medium bg-surface p-4"
const LANGUAGE_CLASSES = "text-xs leading-4 text-muted"
const CODE_CLASSES = "w-full min-w-0 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-5 text-foreground"

/**
 * Draw a run of code.
 *
 * @param input - {@link CodeBlockProps}
 */
export const CodeBlock = ({ props }: CodeBlockProps) => (
    <div data-tier="leaf" data-component="CodeBlock" className={FRAME_CLASSES}>
        {props.language === undefined ? null : <span className={LANGUAGE_CLASSES}>{props.language}</span>}
        <pre className={CODE_CLASSES}><code>{props.code}</code></pre>
    </div>
)

/** Source-level tier marker. */
export const meta = { shape: "leaf", world: "pure" } as const
