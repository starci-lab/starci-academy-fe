import type { ReactNode } from "react"

export type MarkdownArticleProps = {
    readonly children: ReactNode
    readonly ariaLabel?: string
    readonly measure?: "reading" | "compact"
}

type FencedCodeBlockFrameProps = {
    readonly language?: string
    readonly action?: ReactNode
}

type AuthoredCodeProps = {
    readonly code: string
    readonly children?: never
}

type RenderedCodeProps = {
    readonly children: ReactNode
    readonly code?: never
}

export type FencedCodeBlockProps = FencedCodeBlockFrameProps & (AuthoredCodeProps | RenderedCodeProps)

export type MarkdownTableFrameProps = {
    readonly children: ReactNode
}

/** Own the business-neutral reading rhythm for one semantic Markdown document. */
export const MarkdownArticle = ({ children, ariaLabel, measure = "reading" }: MarkdownArticleProps) => (
    <div
        aria-label={ariaLabel}
        className="starci-core-markdown-article"
        data-component="MarkdownArticle"
        data-grammar-contract="core.markdown-article"
        data-grammar-markdown-article="true"
        data-grammar-markdown-measure={measure}
    >
        {children}
    </div>
)

/** Own bounded code overflow while allowing a caller-supplied neutral action such as Copy. */
export const FencedCodeBlock = (input: FencedCodeBlockProps) => {
    const body = "children" in input ? input.children : <pre><code>{input.code}</code></pre>
    return (
        <div
            className="starci-core-fenced-code-block"
            data-component="FencedCodeBlock"
            data-grammar-fenced-code-block="true"
        >
            {input.language === undefined && input.action === undefined ? null : (
                <div className="starci-core-fenced-code-header">
                    {input.language === undefined ? <span /> : <span>{input.language}</span>}
                    {input.action}
                </div>
            )}
            {body}
        </div>
    )
}

/** Keep a vendor-rendered table inside the same bounded reading frame as semantic tables. */
export const MarkdownTableFrame = ({ children }: MarkdownTableFrameProps) => (
    <div
        className="starci-core-markdown-table-frame"
        data-component="MarkdownTableFrame"
        data-grammar-markdown-table-frame="true"
    >
        {children}
    </div>
)

export const meta = { shape: "branch", grammar: "core", contract: "core.branch.markdown-article" } as const
