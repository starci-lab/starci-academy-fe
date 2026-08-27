import { codeBlockClassName, codeBlockLanguageClassName, codeBlockPreClassName } from "./classNames"

/** Plain code used outside authored Markdown documents. */
export type CodeBlockData = {
    readonly code: string
    readonly language?: string
}

/** Props for the plain code leaf. */
export type CodeBlockProps = { readonly props: CodeBlockData; readonly isLoading?: boolean }

/** Draw one non-document code value without owning Markdown viewer chrome. */
export const CodeBlock = (props: CodeBlockProps) => (
    <div className={codeBlockClassName}>
        {props.props.language === undefined ? null : <span className={codeBlockLanguageClassName}>{props.props.language}</span>}
        <pre className={codeBlockPreClassName}><code>{props.props.code}</code></pre>
    </div>
)
