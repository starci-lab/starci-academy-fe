"use client"

import { Fragment, useState, type ReactNode } from "react"
import Image from "next/image"
import remarkDirective from "remark-directive"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { MarkdownArticle, MarkdownTableFrame } from "@starci/grammar/core"
import { Heading } from "@/components/leaves/Heading"
import { MarkdownCodeBlock } from "@/components/branches/MarkdownCodeBlock"
import { TableBranch } from "@/components/branches/TableBranch"
import { MermaidDiagram } from "@/components/branches/MermaidDiagram"
import { Badge } from "@/components/leaves/Badge"
import * as articleClasses from "./classNames"

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
    /** Reading-page rhythm, or compact 14px prose when Markdown is embedded in another surface. */
    readonly measure?: "reading" | "compact"
}

/** Props for {@link Article}. */
export type ArticleProps = { readonly props: ArticleData; readonly isLoading?: boolean }

/** How many lines rest while the body is in flight, and how wide each one is. */
const RESTING_WIDTHS = [
    { id: "resting-1", width: "w-3/4" },
    { id: "resting-2", width: "w-full" },
    { id: "resting-3", width: "w-full" },
    { id: "resting-4", width: "w-5/6" },
    { id: "resting-5", width: "w-2/3" },
] as const

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
    readonly id: string
    readonly type: string
    readonly start?: number
    readonly end?: number
    readonly value?: string
    readonly depth?: number
    readonly lang?: string
    readonly url?: string
    readonly alt?: string
    readonly ordered?: boolean
    readonly name?: string
    readonly attributes?: Readonly<Record<string, string>>
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
const stringRecordAt = (record: Record<string, unknown>, key: string): Readonly<Record<string, string>> | undefined => {
    const value = record[key]
    if (!isRecord(value)) return undefined
    return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
}
const offsetAt = (record: Record<string, unknown>, side: "start" | "end"): number | undefined => {
    const position = record["position"]
    if (!isRecord(position)) return undefined
    const point = position[side]
    return isRecord(point) ? numberAt(point, "offset") : undefined
}

/**
 * Turn what the parser returned into nodes this leaf can draw.
 *
 * Narrowed with checks the compiler follows rather than asserted through `unknown`: the seam
 * where a value crosses from outside the program to inside it is exactly the seam worth checking,
 * and a node with no `type` is not a node - it is dropped rather than drawn as an empty line.
 */
const toNode = (value: unknown, id = "node"): MarkdownNode | undefined => {
    if (!isRecord(value)) return undefined
    const type = stringAt(value, "type")
    if (type === undefined) return undefined
    const rawParts = value["children"]
    return {
        id,
        type,
        start: offsetAt(value, "start"),
        end: offsetAt(value, "end"),
        value: stringAt(value, "value"),
        depth: numberAt(value, "depth"),
        lang: stringAt(value, "lang"),
        url: stringAt(value, "url"),
        alt: stringAt(value, "alt"),
        ordered: flagAt(value, "ordered"),
        name: stringAt(value, "name"),
        attributes: stringRecordAt(value, "attributes"),
        parts: Array.isArray(rawParts)
            ? rawParts.map((part, index) => toNode(part, `${id}-${index}`)).filter((part): part is MarkdownNode => part !== undefined)
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
    nodes.map((node) => {
        const key = node.id
        switch (node.type) {
        case "strong":
            return <strong key={key}>{inline(node.parts)}</strong>
        case "emphasis":
            return <em key={key}>{inline(node.parts)}</em>
        case "inlineCode":
            return <code key={key}>{node.value}</code>
        case "link":
            return <a key={key} href={node.url} target={node.url?.startsWith("/") || node.url?.startsWith("#") ? undefined : "_blank"} rel={node.url?.startsWith("/") || node.url?.startsWith("#") ? undefined : "noopener noreferrer"}>{inline(node.parts)}</a>
        case "break":
            return <br key={key} />
        default:
            return <Fragment key={key}>{node.value ?? inline(node.parts)}</Fragment>
        }
    })

const slugify = (text: string): string => text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d") // vn-ok: stable heading ids transliterate the Vietnamese letter
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

type DirectiveTabsProps = { readonly preview: ReactNode, readonly code: ReactNode }
const DirectiveTabs = (props: DirectiveTabsProps) => {
    const [selected, setSelected] = useState<"preview" | "code">("preview")
    return (
        <div className={articleClasses.articleStackClassName}>
            <div role="tablist" className={articleClasses.articleTabsClassName}>
                <button type="button" role="tab" aria-selected={selected === "preview"} className={articleClasses.articleTabClassName} onClick={() => setSelected("preview")}>Preview</button>
                <button type="button" role="tab" aria-selected={selected === "code"} className={articleClasses.articleTabClassName} onClick={() => setSelected("code")}>Code</button>
            </div>
            <div className={selected === "preview" ? articleClasses.articlePreviewClassName : undefined}>{selected === "preview" ? props.preview : props.code}</div>
        </div>
    )
}

/**
 * The accessible name of one table, taken from the table's own header.
 *
 * A table needs a name to be reachable by row, and there is no honest place to get one except the
 * content: an invented label would be untranslated copy living in a component that owns none. The
 * header cells already say what the columns are, so joining them names the table in the document's
 * own language. A source table with no header falls back to its first row for the same reason.
 */
const tableLabel = (header: MarkdownNode | undefined, bodyRows: ReadonlyArray<MarkdownNode>): string => {
    const naming = header ?? bodyRows[0]
    const columns = (naming?.parts ?? []).map(plainText).map((text) => text.trim()).filter(Boolean)
    return columns.join(", ")
}

type BlockContext = {
    readonly mermaidCaptions: Readonly<Record<string, string>>
}

/** Draw one block of the document. */
const block = (node: MarkdownNode, key: string, context: BlockContext): ReactNode => {
    switch (node.type) {
    case "heading": {
        // Two levels, not six: the page owns level 1, and a lesson that nests past a subsection is
        // a lesson that should have been two.
        const heading = plainText(node)
        const id = slugify(heading)
        const level = (node.depth ?? 2) <= 2 ? 2 : 3
        /*
         * THE ANCHOR IS NAMED BY ITS OWN HEADING, not by a sentence written here. `aria-label="Link
         * to this section"` was copy hardcoded in a tier that receives every word it renders, and it
         * was also the WORSE name: a reader listing the links on a lesson would hear the same six
         * words at every heading and learn nothing about which section each one reaches.
         * The name is the heading's own text, so the link is announced with the section's real
         * title, in the document's own language, with nothing to translate.
         *
         * THE `data-toc` ATTRIBUTES ARE GONE, and they were dead rather than merely unused: nothing
         * in the repository read `data-toc`, `data-toc-level` or `data-toc-label`, and the outline
         * rail is built from `CourseLearnContentPage`'s own `outline` model. They were the residue
         * of an outline that rescanned the DOM - the exact thing the document grammar refuses.
         */
        return (
            <div key={key} id={id} className={articleClasses.articleHeadingClassName}>
                <Heading props={{ content: heading, level }} />
                <a href={`#${id}`} aria-label={heading} className={articleClasses.articleAnchorClassName}>#</a>
            </div>
        )
    }
    case "paragraph":
        return <p key={key}>{inline(node.parts)}</p>
    case "code":
        return node.lang?.toLowerCase() === "mermaid"
            ? <MermaidDiagram key={key} props={{ source: node.value ?? "", caption: context.mermaidCaptions[(node.value ?? "").trim()] }} />
            : <MarkdownCodeBlock key={key} props={{ code: node.value ?? "", language: node.lang }} />
    case "blockquote":
        return (
            <blockquote key={key}>
                {(node.parts).map((child) => block(child, `${key}-${child.id}`, context))}
            </blockquote>
        )
    case "list": {
        const items = (node.parts).map((item) => (
            <li key={`${key}-${item.id}`}>
                {(item.parts).map((child) => (
                    child.type === "paragraph"
                        ? <Fragment key={`${key}-${item.id}-${child.id}`}>{inline(child.parts)}</Fragment>
                        : block(child, `${key}-${item.id}-${child.id}`, context)
                ))}
            </li>
        ))
        return node.ordered === true
            ? <ol key={key}>{items}</ol>
            : <ul key={key}>{items}</ul>
    }
    case "table": {
        const rows = node.parts.filter((part) => part.type === "tableRow")
        const header = rows[0]
        const bodyRows = rows.slice(1)
        return (
            <MarkdownTableFrame key={key}>
                <TableBranch
                    ariaLabel={tableLabel(header, bodyRows)}
                    columns={header === undefined ? [] : header.parts.map((cell) => ({ id: cell.id, content: inline(cell.parts) }))}
                    rows={bodyRows.map((row) => ({
                        id: row.id,
                        cells: row.parts.map((cell) => ({ id: cell.id, content: inline(cell.parts) })),
                    }))}
                />
            </MarkdownTableFrame>
        )
    }
    case "thematicBreak":
        return <hr key={key} />
    case "image":
        return node.alt === undefined || node.alt === ""
            ? <Image key={key} src={node.url ?? "/starci.svg"} alt="" width={1200} height={675} unoptimized className={articleClasses.articleImageClassName} />
            : (
                <figure key={key} className={articleClasses.articleFigureClassName}>
                    <Image src={node.url ?? "/starci.svg"} alt={node.alt} width={1200} height={675} unoptimized className={articleClasses.articleImageClassName} />
                    <figcaption className={articleClasses.articleCaptionClassName}>{node.alt}</figcaption>
                </figure>
            )
    case "containerDirective": {
        if (node.name === "panel") {
            return (
                <details key={key} className={articleClasses.articleDetailsClassName} open>
                    <summary className={articleClasses.articleSummaryClassName}>{node.attributes?.["title"] ?? "Details"}</summary>
                    <div className={articleClasses.articleDetailsBodyClassName}>
                        {node.parts.map((child) => block(child, `${key}-${child.id}`, context))}
                    </div>
                </details>
            )
        }
        if (node.name === "accordion") {
            return <div key={key} className={articleClasses.articleColumnClassName}>{node.parts.map((child) => block(child, `${key}-${child.id}`, context))}</div>
        }
        if (node.name === "muted") {
            return <div key={key} className={articleClasses.articleMutedClassName}>{node.parts.map((child) => block(child, `${key}-${child.id}`, context))}</div>
        }
        if (node.name === "chip") {
            return <div key={key} className={articleClasses.articleTagRunClassName}>{plainText(node).split(/[\n·]+/).map((item) => item.trim()).filter(Boolean).map((item) => <Badge key={item} props={{ content: item, tone: "neutral" }} />)}</div>
        }
        if (node.name === "tab") {
            const preview = node.parts.find((part) => part.name === "preview")
            const code = node.parts.find((part) => part.name === "code")
            return <DirectiveTabs key={key} preview={preview?.parts.map((child) => block(child, `${key}-preview-${child.id}`, context))} code={code?.parts.map((child) => block(child, `${key}-code-${child.id}`, context))} />
        }
        return <div key={key} className={articleClasses.articleCompactColumnClassName}>{node.parts.map((child) => block(child, `${key}-${child.id}`, context))}</div>
    }
    case "textDirective":
    case "leafDirective":
        return node.name === "muted"
            ? <span key={key} className={articleClasses.articleMutedInlineClassName}>{inline(node.parts)}</span>
            : <Fragment key={key}>{inline(node.parts)}</Fragment>
    default:
        // A node this leaf has no shape for keeps its words rather than disappearing: losing a
        // paragraph silently is worse than drawing it plainly.
        return <p key={key}>{plainText(node)}</p>
    }
}

const MERMAID_CAPTION = /```mermaid[ \t]*\r?\n([\s\S]*?)\r?\n```[ \t]*\r?\n+[ \t]*([^\r\n]+)/g
const prepareMarkdown = (markdown: string): { readonly source: string, readonly captions: Readonly<Record<string, string>> } => {
    const lines = markdown.split("\n")
    let lastOpen = -1
    for (let index = 0; index < lines.length; index += 1) {
        if (/^```mermaid[ \t]*$/.test(lines[index]?.trimEnd() ?? "")) lastOpen = index
    }
    const stable = lastOpen >= 0 && !lines.slice(lastOpen + 1).some((line) => line.trim() === "```")
        ? lines.slice(0, lastOpen).join("\n").trimEnd()
        : markdown
    const captions: Record<string, string> = {}
    MERMAID_CAPTION.lastIndex = 0
    for (let match = MERMAID_CAPTION.exec(stable); match; match = MERMAID_CAPTION.exec(stable)) {
        const caption = match[2]?.trim().replace(/^\*+|\*+$/g, "").trim() ?? ""
        if (/^(Hình|Figure)\b/i.test(caption)) captions[(match[1] ?? "").trim()] = caption // vn-ok: authored figure prefix
    }
    MERMAID_CAPTION.lastIndex = 0
    const source = stable.replace(MERMAID_CAPTION, (whole, _code, caption: string) => {
        const clean = caption.trim().replace(/^\*+|\*+$/g, "").trim()
        return /^(Hình|Figure)\b/i.test(clean) ? whole.slice(0, whole.lastIndexOf(caption)) : whole // vn-ok: authored figure prefix
    })
    return { source, captions }
}

/** One semantic surface target extracted from an authored Markdown brief. */
export type ArticleSurfaceSection = {
    readonly id: string
    readonly label?: string
    readonly kind: "body" | "peer-list" | "accordion"
    readonly body?: string
    readonly items: ReadonlyArray<{ readonly id: string, readonly title?: string, readonly body: string }>
}

const sourceFor = (source: string, nodes: ReadonlyArray<MarkdownNode>): string => {
    const start = nodes[0]?.start
    const end = nodes[nodes.length - 1]?.end
    return start === undefined || end === undefined ? "" : source.slice(start, end).trim()
}

const sectionLabel = (node: MarkdownNode): string | undefined => {
    if (node.type === "heading") return plainText(node).trim()
    if (node.type === "containerDirective" && node.name === "muted") return plainText(node).trim()
    return undefined
}

/**
 * Classify authored top-level sections without flattening their Markdown.
 *
 * Source offsets preserve inline code, emphasis, links and nested blocks for the semantic owner
 * that eventually draws each body. The classifier chooses no component; it reports only whether
 * the authored section is one body, a peer list or a local-disclosure collection.
 */
export const segmentArticleSurfaces = (markdown?: string): ReadonlyArray<ArticleSurfaceSection> => {
    if (markdown === undefined || markdown.trim() === "") return []
    const prepared = prepareMarkdown(markdown)
    const root = toNode(parser.parse(prepared.source))
    const groups: Array<{ label?: string, nodes: Array<MarkdownNode> }> = []
    let current: { label?: string, nodes: Array<MarkdownNode> } = { nodes: [] }
    for (const node of root?.parts ?? []) {
        const label = sectionLabel(node)
        if (label === undefined) current.nodes.push(node)
        else {
            if (current.label !== undefined || current.nodes.length > 0) groups.push(current)
            current = { label, nodes: [] }
        }
    }
    if (current.label !== undefined || current.nodes.length > 0) groups.push(current)

    return groups.map((group, sectionIndex) => {
        const only = group.nodes.length === 1 ? group.nodes[0] : undefined
        if (only?.type === "list") {
            return {
                id: `section-${sectionIndex}`,
                ...(group.label === undefined ? {} : { label: group.label }),
                kind: "peer-list" as const,
                items: only.parts.map((item, itemIndex) => ({
                    id: `section-${sectionIndex}-item-${itemIndex}`,
                    body: sourceFor(prepared.source, item.parts),
                })),
            }
        }
        if (only?.type === "containerDirective" && only.name === "accordion") {
            return {
                id: `section-${sectionIndex}`,
                ...(group.label === undefined ? {} : { label: group.label }),
                kind: "accordion" as const,
                items: only.parts.filter((item) => item.type === "containerDirective" && item.name === "panel")
                    .map((item, itemIndex) => ({
                        id: `section-${sectionIndex}-item-${itemIndex}`,
                        title: item.attributes?.["title"] ?? plainText(item).trim(),
                        body: sourceFor(prepared.source, item.parts),
                    })),
            }
        }
        return {
            id: `section-${sectionIndex}`,
            ...(group.label === undefined ? {} : { label: group.label }),
            kind: "body" as const,
            body: sourceFor(prepared.source, group.nodes),
            items: [],
        }
    })
}

/**
 * Draw one content body.
 *
 * @param props - {@link ArticleProps}
 */
export const Article = (props: ArticleProps) => {
    const selectable = props.props.aiSelectable === true ? { "data-ai-selectable": "true" } : {}
    const measure = props.props.measure ?? "reading"
    if (props.isLoading === true || props.props.body === undefined) {
        return (
            <div {...selectable} data-measure={measure} data-resting="true">
                <MarkdownArticle measure={measure}>
                    {RESTING_WIDTHS.map((line) => (
                        <span key={line.id} className={articleClasses.getArticleRestingLineClassName(line.width)} />
                    ))}
                </MarkdownArticle>
            </div>
        )
    }
    const prepared = prepareMarkdown(props.props.body)
    const root = toNode(parser.parse(prepared.source))
    return (
        <div {...selectable} data-measure={measure}>
            <MarkdownArticle measure={measure}>
                {(root?.parts ?? []).map((node) => block(node, node.id, { mermaidCaptions: prepared.captions }))}
            </MarkdownArticle>
        </div>
    )
}
