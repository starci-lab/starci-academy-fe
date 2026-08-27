import { render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Article, segmentArticleSurfaces } from "./index"

/**
 * The tree the article is handed, when a test needs one the markdown parser would never produce.
 *
 * `toNode` exists precisely because the parser sits OUTSIDE the program, and the leaf documents
 * what it does with a malformed answer: a node with no type is dropped rather than drawn as an
 * empty line. Only the parser seam can state that answer, so only the parser seam is replaced -
 * every other test below still runs the real remark pipeline through this same shim.
 */
const parserSeam = vi.hoisted(() => ({ isForced: false, tree: undefined as unknown }))

/** Hand the leaf one exact tree in place of whatever the markdown would have parsed to. */
const forceTree = (tree: unknown) => {
    parserSeam.isForced = true
    parserSeam.tree = tree
}

type MermaidDiagramFixtureProps = { readonly props: { readonly source: string } }

vi.mock("unified", async (importOriginal) => {
    const actual = await importOriginal<typeof import("unified")>()
    return {
        ...actual,
        unified: () => {
            const real = actual.unified()
            const shim = {
                use: (plugin: unknown) => {
                    real.use(plugin as Parameters<typeof real.use>[0])
                    return shim
                },
                parse: (document: string) => parserSeam.isForced ? parserSeam.tree : real.parse(document),
            }
            return shim
        },
    }
})

vi.mock("@/components/branches/MermaidDiagram", () => ({
    MermaidDiagram: (input: MermaidDiagramFixtureProps) => (
        <div data-component="MermaidDiagram">{input.props.source}</div>
    ),
}))

afterEach(() => {
    parserSeam.isForced = false
    parserSeam.tree = undefined
})

const headings = (root: HTMLElement) =>
    Array.from(root.querySelectorAll("[data-component=\"Heading\"]"), (heading) => [
        heading.tagName,
        heading.getAttribute("data-level"),
        heading.textContent,
    ])

describe("Article", () => {
    it("classifies labelled bodies, peer lists and accordion panels without flattening Markdown", () => {
        const sections = segmentArticleSurfaces(":::muted\nGoal\n:::\n\nProtect `GET /me`.\n\n## Common errors\n\n- **Trusting userId:** never trust input.\n- Keep `exp`.\n\n## Steps\n\n::::accordion\n:::panel{title=\"Step 1\"}\nVerify **the token**.\n:::\n::::")

        expect(sections).toEqual([
            expect.objectContaining({ label: "Goal", kind: "body", body: "Protect `GET /me`." }),
            expect.objectContaining({
                label: "Common errors",
                kind: "peer-list",
                items: [
                    expect.objectContaining({ body: "**Trusting userId:** never trust input." }),
                    expect.objectContaining({ body: "Keep `exp`." }),
                ],
            }),
            expect.objectContaining({
                label: "Steps",
                kind: "accordion",
                items: [expect.objectContaining({ title: "Step 1", body: "Verify **the token**." })],
            }),
        ])
    })

    it("opts a grounded article into the shared AI selection boundary", () => {
        const { container } = render(<Article props={{ body: "Lesson body", aiSelectable: true }} />)
        expect(container.firstElementChild).toHaveAttribute("data-ai-selectable", "true")
    })

    it("leaves ordinary article call sites outside AI selection by default", () => {
        const { container } = render(<Article props={{ body: "Lesson body" }} />)
        expect(container.firstElementChild).not.toHaveAttribute("data-ai-selectable")
    })

    it("rests five lines while a body is in flight, without drawing any of it", () => {
        const { container } = render(<Article props={{ body: "Lesson body" }} isLoading />)
        const root = container.querySelector("[data-component=\"Article\"]")
        const grammar = container.querySelector("[data-component=\"MarkdownArticle\"]")
        expect(root).toHaveAttribute("data-resting", "true")
        expect(grammar?.children).toHaveLength(5)
        expect(root?.textContent).toBe("")
        expect(container.querySelector("p")).toBeNull()
    })

    it("rests the same way for a content whose body the server has not sent at all", () => {
        const { container } = render(<Article props={{ aiSelectable: true }} />)
        const root = container.querySelector("[data-component=\"Article\"]")
        const grammar = container.querySelector("[data-component=\"MarkdownArticle\"]")
        expect(root).toHaveAttribute("data-resting", "true")
        expect(root).toHaveAttribute("data-ai-selectable", "true")
        expect(grammar?.children).toHaveLength(5)
    })

    it("draws an empty body as an article with nothing in it rather than as a rest", () => {
        const { container } = render(<Article props={{ body: "" }} />)
        const root = container.querySelector("[data-component=\"Article\"]")
        const grammar = container.querySelector("[data-component=\"MarkdownArticle\"]")
        expect(root).not.toHaveAttribute("data-resting")
        expect(grammar).toHaveAttribute("data-grammar-contract", "core.markdown-article")
        expect(grammar?.children).toHaveLength(0)
    })

    it("folds the author's six heading levels onto the two the page has room for", () => {
        const { container } = render(<Article props={{
            body: "# Chapter\n\n## Section\n\n### Subsection\n\n#### Deeper still\n",
        }} />)
        expect(headings(container)).toEqual([
            ["H2", "2", "Chapter"],
            ["H2", "2", "Section"],
            ["H3", "3", "Subsection"],
            ["H3", "3", "Deeper still"],
        ])
    })

    it("keeps a heading's own inline marks out of the outline it hands the heading leaf", () => {
        const { container } = render(<Article props={{ body: "## A `useState` **hook**\n" }} />)
        expect(headings(container)).toEqual([["H2", "2", "A useState hook"]])
        expect(container.querySelector("[data-component=\"Heading\"] code")).toBeNull()
    })

    it("keeps every inline mark of a paragraph rather than flattening it to plain words", () => {
        const { container } = render(<Article props={{
            body: "Read the **rule**, then the *note*, then `useState`, then [the docs](https://example.com).\n",
        }} />)
        const paragraph = container.querySelector("p")
        expect(paragraph?.querySelector("strong")?.textContent).toBe("rule")
        expect(paragraph?.querySelector("em")?.textContent).toBe("note")
        const inlineCode = paragraph?.querySelector("code")
        expect(inlineCode?.textContent).toBe("useState")
        expect(inlineCode).not.toHaveAttribute("class")
        expect(container.querySelector("[data-grammar-contract=\"core.markdown-article\"]")).not.toBeNull()
        const link = paragraph?.querySelector("a")
        expect(link).toHaveAttribute("href", "https://example.com")
        expect(link?.textContent).toBe("the docs")
    })

    it("uses the compact 14px measure when Markdown is embedded in another surface", () => {
        const { container } = render(<Article props={{
            body: "Compact paragraph.\n\n- Compact item\n\n> Compact quote\n",
            measure: "compact",
        }} />)
        const root = container.querySelector("[data-component=Article]")
        const grammar = container.querySelector("[data-component=MarkdownArticle]")

        expect(root).toHaveAttribute("data-measure", "compact")
        expect(grammar).toHaveAttribute("data-grammar-markdown-measure", "compact")
        expect(grammar?.querySelector(":scope > p")).not.toHaveAttribute("class")
        expect(grammar?.querySelector("li")).not.toHaveAttribute("class")
        expect(grammar?.querySelector("blockquote")).not.toHaveAttribute("class")
    })

    it("keeps a hard break as a break rather than joining the two lines", () => {
        const { container } = render(<Article props={{ body: "first line\\\nsecond line\n" }} />)
        expect(container.querySelectorAll("p")).toHaveLength(1)
        expect(container.querySelector("p br")).toBeInTheDocument()
        expect(container.querySelector("p")?.textContent).toBe("first linesecond line")
    })

    it("keeps the words of an inline mark it has no shape for", () => {
        const { container } = render(<Article props={{ body: "a ~~withdrawn~~ claim\n" }} />)
        expect(container.querySelector("p")?.textContent).toBe("a withdrawn claim")
    })

    it("draws a fenced block through the document code branch, with and without a declared language", () => {
        const { container } = render(<Article props={{
            body: "```ts\nconst a = 1\n```\n\n```\nplain text\n```\n",
        }} />)
        const blocks = container.querySelectorAll("[data-component=\"MarkdownCodeBlock\"]")
        expect(blocks).toHaveLength(2)
        expect(blocks[0]?.textContent).toBe("TypeScriptCopyconst a = 1")
        expect(blocks[1]?.textContent).toBe("textCopyplain text")
    })

    it("draws an unordered list of items and an ordered list as different elements", () => {
        const { container } = render(<Article props={{
            body: "- alpha\n- beta\n\n1. first\n2. second\n",
        }} />)
        expect(Array.from(container.querySelectorAll("ul > li"), (item) => item.textContent))
            .toEqual(["alpha", "beta"])
        expect(Array.from(container.querySelectorAll("ol > li"), (item) => item.textContent))
            .toEqual(["first", "second"])
    })

    it("keeps a list item's marks inline and draws a nested list as its own block", () => {
        const { container } = render(<Article props={{
            body: "- outer **item**\n    - inner item\n",
        }} />)
        const outer = container.querySelector("ul > li")
        expect(outer?.querySelector("strong")?.textContent).toBe("item")
        expect(Array.from(outer?.querySelectorAll("ul > li") ?? [], (item) => item.textContent))
            .toEqual(["inner item"])
    })

    it("walks into a quote and draws each block inside it in its own right", () => {
        const { container } = render(<Article props={{
            body: "> ## quoted title\n>\n> quoted words\n",
        }} />)
        const quote = container.querySelector("blockquote")
        expect(quote?.querySelector("[data-component=\"Heading\"]")?.textContent).toBe("quoted title")
        expect(quote?.querySelector("p")?.textContent).toBe("quoted words")
    })

    it("renders a GFM table through the vendor table branch, named by its own header", () => {
        const { container } = render(<Article props={{
            body: "| left | right |\n| --- | --- |\n| one | two |\n",
        }} />)
        // VENDOR-15: the vendor draws the anatomy, so this reads the vendor's own contract - the
        // accessible name it owns and the column headers it builds - rather than the tag names a
        // hand-built table would have shared with it.
        const grid = container.querySelector("[aria-label]")
        expect(grid).not.toBeNull()
        // The accessible name comes from the table's own header, never from invented copy.
        expect(grid?.getAttribute("aria-label")).toBe("left, right")
        expect(container.querySelectorAll("[role=\"columnheader\"]")).toHaveLength(2)
        expect(container.textContent).toContain("one")
    })

    it("frames a wide table as a recessed well that scrolls inside itself", () => {
        const { container } = render(<Article props={{
            body: "| left | right |\n| --- | --- |\n| one | two |\n",
        }} />)
        // SURFACE-IN-SURFACE-7 recessed form and its OVERFLOW-5 scroll sit on the same node,
        // because the frame and the scroll are one decision.
        const frame = container.querySelector("[data-grammar-markdown-table-frame=\"true\"]")
        expect(frame).not.toBeNull()
        expect(frame?.className).not.toContain("shadow")
        expect(frame?.querySelector("[role=\"grid\"], [role=\"table\"]")).not.toBeNull()
    })

    it("renders authored accordion panels instead of flattening directive markers", () => {
        const { container } = render(<Article props={{ body: "::::accordion\n:::panel{title=\"DI flow\"}\nhidden away\n:::\n::::\n" }} />)
        expect(container.textContent).not.toContain(":::")
        expect(container.querySelector("details summary")?.textContent).toBe("DI flow")
        expect(container.textContent).toContain("hidden away")
    })

    it("renders the legacy muted, chip and preview/code directives", () => {
        const { container, getByRole } = render(<Article props={{ body: ":::muted\nquiet context\n:::\n\n:::chip\nready · reviewed\n:::\n\n::::tab\n:::preview\nvisible preview\n:::\n:::code\n```ts\nconst ready = true\n```\n:::\n::::\n" }} />)
        expect(container.textContent).toContain("quiet context")
        expect(container.textContent).toContain("ready")
        expect(container.textContent).toContain("reviewed")
        expect(getByRole("tab", { name: "Preview" })).toHaveAttribute("aria-selected", "true")
        expect(getByRole("tab", { name: "Code" })).toHaveAttribute("aria-selected", "false")
    })

    it("routes a mermaid fence through the diagram leaf", () => {
        const { container } = render(<Article props={{ body: "```mermaid\nflowchart LR\nA-->B\n```\n" }} />)
        expect(container.querySelector("[data-component=MermaidDiagram]")).not.toBeNull()
        expect(container.querySelector("[data-component=MarkdownCodeBlock]")).toBeNull()
    })

    it("draws an empty article when the parser answers with something that is not a document", () => {
        forceTree(null)
        const { container } = render(<Article props={{ body: "# Chapter\n" }} />)
        const root = container.querySelector("[data-component=\"Article\"]")
        const grammar = container.querySelector("[data-component=\"MarkdownArticle\"]")
        expect(root).not.toHaveAttribute("data-resting")
        expect(grammar?.children).toHaveLength(0)
    })

    it("drops a node that carries no type instead of drawing it as an empty line", () => {
        forceTree({
            type: "root",
            children: [
                { value: "orphan" },
                { type: "paragraph", children: [{ type: "text", value: "kept" }] },
            ],
        })
        const { container } = render(<Article props={{ body: "ignored" }} />)
        const root = container.querySelector("[data-component=\"Article\"]")
        const grammar = container.querySelector("[data-component=\"MarkdownArticle\"]")
        expect(grammar?.children).toHaveLength(1)
        expect(root?.textContent).toBe("kept")
    })

    it("falls back to the shallower outline level and to an empty fence when neither is stated", () => {
        forceTree({
            type: "root",
            children: [
                { type: "heading", children: [{ type: "text", value: "Untitled" }] },
                { type: "code" },
            ],
        })
        const { container } = render(<Article props={{ body: "ignored" }} />)
        expect(headings(container)).toEqual([["H2", "2", "Untitled"]])
        expect(container.querySelector("[data-component=\"MarkdownCodeBlock\"]")?.textContent).toBe("textCopy")
    })
})
