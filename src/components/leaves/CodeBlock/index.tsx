import type { LeafProps } from "@/components/contracts/props"

/** Plain code used outside authored Markdown documents. */
export type CodeBlockData = {
    readonly code: string
    readonly language?: string
}

/** Props for the plain code leaf. */
export type CodeBlockProps = LeafProps<CodeBlockData>

/** Draw one non-document code value without owning Markdown viewer chrome. */
export const CodeBlock = (input: CodeBlockProps) => (
    <div data-tier="leaf" data-component="CodeBlock" className="flex w-full min-w-0 flex-col gap-2 rounded-medium bg-surface p-4">
        {input.props.language === undefined ? null : <span className="text-xs leading-4 text-muted">{input.props.language}</span>}
        <pre className="w-full min-w-0 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-5 text-foreground"><code>{input.props.code}</code></pre>
    </div>
)

/** Source-level tier marker. */
export const meta = { shape: "leaf", world: "pure" } as const
