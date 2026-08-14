import { Fragment, type ReactNode } from "react"
import { skeletonVariants } from "@heroui/react"
import remarkDirective from "remark-directive"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { Heading } from "@/components/leaves/Heading"
import { CodeBlock } from "@/components/leaves/CodeBlock"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `Article`: the body of one content, as its author wrote it.
 *
 * Target path on materialization: `src/components/leaves/Article/index.tsx`.
 *
 * WHY THE BODY IS ONE LEAF AND NOT A TREE OF THEM. `ContentEntity.body` is markdown - the entity
 * says so in as many words - and markdown's paragraphs contain INLINE children: a bolded phrase, a
 * piece of code inside a sentence, a link mid-clause. Every text leaf in this house takes
 * `content: string`, which holds a sentence but not a sentence with a link in the middle of it. A
 * body assembled from those leaves would have to flatten every paragraph to plain text, and the
 * first thing lost is the inline code a programming lesson is written in.
 *
 * Revision 1.5 modelled the body as `sections: { title, paragraphs[] }`. Nothing the server returns
 * can produce that shape without dropping code blocks, lists, tables and images, and this is a
 * coding academy: that is not lost decoration, it is lost content.
 *
 * WHY IT WALKS AN AST RATHER THAN HANDING A VENDOR A COMPONENT MAP. The first attempt used
 * `react-markdown` and gave it a table of replacements, and canon refused it twice in one file:
 * every replacement takes `children` - markup already built, whose shape nothing can check - and
 * each heading replacement wrote a raw `<h2>`, which splits the outline tag from the visible size.
 * Both refusals are right. So the markdown is parsed to `mdast` here and THIS leaf decides what
 * each node becomes: headings go through the heading component, which owns tag and size together,
 * and nothing in the file receives a children slot.
 *
 * THE HEADINGS START AT LEVEL 2. The page's own title is the document's `h1`; an article that
 * opened another one would give the page two, and the outline rail scans exactly these headings.
 *
 * WHAT IT DELIBERATELY DOES NOT DO: colour the code (see `CodeBlock`), and draw remark DIRECTIVES
 * as components. The directive plugin is present so a `:::accordion` fence does not spill its
 * markers into the prose; giving directives their own vocabulary is a case of its own.
 */

/** What this leaf draws. */
export type ArticleData = {
    /** The markdown body exactly as the server returned it - already truncated when premium. */
    readonly body?: string
    /** Whether this exact article is an allowed prose-grounding root for StarCi AI selection. */
    readonly aiSelectable?: boolean
}

/** Props for {@link Article}. */
export type ArticleProps = LeafProps<ArticleData>

/** The house type scale, one entry per node this admits. */
const NODE_CLASSES = {
    root: "flex w-full min-w-0 flex-col gap-4",
    paragraph: "text-base leading-6 text-foreground",
    list: "flex w-full min-w-0 flex-col gap-2 pl-5",
    item: "list-disc text-base leading-6 text-foreground",
    strong: "font-semibold",
    emphasis: "italic",
    inlineCode: "rounded bg-surface px-1 font-mono text-sm text-foreground",
    link: "text-accent-soft-foreground underline underline-offset-4",
    quote: "border-l-2 border-separator pl-4 text-base leading-6 text-muted",
} as const

/** How many lines rest while the body is in flight, and how wide each one is. */
const RESTING_WIDTHS = ["w-3/4", "w-full", "w-full", "w-5/6", "w-2/3"] as const
const RESTING_LINE = skeletonVariants({ animationType: "shimmer" }).base({
    className: "h-6 select-none rounded text-transparent",
})

/**
 * One node of the document, in THIS house's words.
 *
 * It is not the parser's own node type, and the difference is the point. `mdast` calls a node's
 * contents `children`, and a type member by that name is the one thing this tier may never take:
 * `children` means markup somebody else already built, whose shape nothing can check. What comes
 * out of a parser is not markup, it is DATA - so it crosses into the program through a converter
 * that renames it to what it actually is, the same way a fixture is narrowed at its boundary.
 */
type MarkdownNode = {
    readonly type: string
    readonly value?: string
    readonly depth?: number
    readonly lang?: string
    readonly url?: string
    readonly ordered?: boolean
    /** The nodes inside this one, already converted. */
    readonly parts: ReadonlyArray<MarkdownNode>
}

/** Whether a value from outside the program is an object at all. */
const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null

/** Read one optional field of a known primitive type, or nothing. */
const stringAt = (record: Record<string, unknown>, key: string): string | undefined =>
    typeof record[key] === "string" ? record[key] : undefined
const numberAt = (record: Record<string, unknown>, key: string): number | undefined =>
    typeof record[key] === "number" ? record[key] : undefined
const flagAt = (record: Record<string, unknown>, key: string): boolean | undefined =>
    typeof record[key] === "boolean" ? record[key] : undefined

/**
 * Turn what the parser returned into nodes this leaf can draw.
 *
 * Narrowed with checks the compiler follows rather than asserted through `unknown`: the seam
 * where a value crosses from outside the program to inside it is exactly the seam worth checking,
 * and a node with no `type` is not a node - it is dropped rather than drawn as an empty line.
 */
const toNode = (value: unknown): MarkdownNode | undefined => {
    if (!isRecord(value)) return undefined
    const type = stringAt(value, "type")
    if (type === undefined) return undefined
    const rawParts = value["children"]
    return {
        type,
        value: stringAt(value, "value"),
        depth: numberAt(value, "depth"),
        lang: stringAt(value, "lang"),
        url: stringAt(value, "url"),
        ordered: flagAt(value, "ordered"),
        parts: Array.isArray(rawParts)
            ? rawParts.map(toNode).filter((part): part is MarkdownNode => part !== undefined)
            : [],
    }
}

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkDirective)

/** Every word under a node, with its marks dropped - what a heading component can accept. */
const plainText = (node: MarkdownNode): string =>
    node.value ?? (node.parts).map(plainText).join("")

/**
 * Draw the marked-up words inside one block.
 *
 * The array is built HERE rather than received, which is the difference between composing a
 * sentence and accepting somebody's markup: every node is read, and one of a closed set of shapes
 * comes back.
 */
const inline = (nodes: ReadonlyArray<MarkdownNode>): ReactNode =>
    nodes.map((node, index) => {
        const key = `${node.type}-${index}`
        switch (node.type) {
        case "strong":
            return <strong key={key} className={NODE_CLASSES.strong}>{inline(node.parts)}</strong>
        case "emphasis":
            return <em key={key} className={NODE_CLASSES.emphasis}>{inline(node.parts)}</em>
        case "inlineCode":
            return <code key={key} className={NODE_CLASSES.inlineCode}>{node.value}</code>
        case "link":
            return <a key={key} className={NODE_CLASSES.link} href={node.url}>{inline(node.parts)}</a>
        case "break":
            return <br key={key} />
        default:
            return <Fragment key={key}>{node.value ?? inline(node.parts)}</Fragment>
        }
    })

/** Draw one block of the document. */
const block = (node: MarkdownNode, key: string): ReactNode => {
    switch (node.type) {
    case "heading":
        // Two levels, not six: the page owns level 1, and a lesson that nests past a subsection is
        // a lesson that should have been two.
        return <Heading key={key} props={{ content: plainText(node), level: (node.depth ?? 2) <= 2 ? 2 : 3 }} />
    case "paragraph":
        return <p key={key} className={NODE_CLASSES.paragraph}>{inline(node.parts)}</p>
    case "code":
        return <CodeBlock key={key} props={{ code: node.value ?? "", language: node.lang }} />
    case "blockquote":
        return (
            <blockquote key={key} className={NODE_CLASSES.quote}>
                {(node.parts).map((child, index) => block(child, `${key}-${index}`))}
            </blockquote>
        )
    case "list": {
        const items = (node.parts).map((item, index) => (
            <li key={`${key}-${index}`} className={NODE_CLASSES.item}>
                {(item.parts).map((child, childIndex) => (
                    child.type === "paragraph"
                        ? <Fragment key={`${key}-${index}-${childIndex}`}>{inline(child.parts)}</Fragment>
                        : block(child, `${key}-${index}-${childIndex}`)
                ))}
            </li>
        ))
        return node.ordered === true
            ? <ol key={key} className={NODE_CLASSES.list}>{items}</ol>
            : <ul key={key} className={NODE_CLASSES.list}>{items}</ul>
    }
    default:
        // A node this leaf has no shape for keeps its words rather than disappearing: losing a
        // paragraph silently is worse than drawing it plainly.
        return <p key={key} className={NODE_CLASSES.paragraph}>{plainText(node)}</p>
    }
}

/**
 * Draw one content body.
 *
 * @param input - {@link ArticleProps}
 */
export const Article = ({ props, isLoading = false }: ArticleProps) => {
    const selectable = props.aiSelectable === true ? { "data-ai-selectable": "true" } : {}
    if (isLoading || props.body === undefined) {
        return (
            <div {...selectable} data-tier="leaf" data-component="Article" data-resting="true" className={NODE_CLASSES.root}>
                {RESTING_WIDTHS.map((width, index) => (
                    <span key={`resting-${index + 1}`} className={`${RESTING_LINE} ${width}`} />
                ))}
            </div>
        )
    }
    const root = toNode(parser.parse(props.body))
    return (
        <div {...selectable} data-tier="leaf" data-component="Article" className={NODE_CLASSES.root}>
            {(root?.parts ?? []).map((node, index) => block(node, `${node.type}-${index}`))}
        </div>
    )
}

/** Source-level tier marker. */
export const meta = { shape: "leaf", world: "pure" } as const
