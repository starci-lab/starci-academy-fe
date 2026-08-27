import assert from "node:assert/strict"
import test from "node:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import {
    CORE_COMPONENT_CONTRACTS,
    PRESENTATION_STATES,
    CORE_LAYOUT_CLASS_NAMES,
    FencedCodeBlock,
    MarkdownArticle,
    MarkdownTableFrame,
    LeadingNumber,
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    StateMark,
    StaticStateRow,
    SurfaceListCard,
    coreGrammar,
    markdownArticleContract,
    surfaceCardContract,
    surfaceAccordionCardContract,
    surfaceListCardContract,
    visualTreatmentContract,
} from "../../dist/core/index.js"

test("core exposes one closed neutral presentation vocabulary", () => {
    assert.deepEqual(PRESENTATION_STATES, [
        "neutral",
        "informative",
        "affirmative",
        "cautionary",
        "negative",
        "pending",
        "unavailable",
    ])
    assert.equal(coreGrammar.contractList.length, Object.keys(CORE_COMPONENT_CONTRACTS).length)
})

test("core exports product-neutral leaf, composite and layout capabilities", () => {
    assert.equal(typeof StateMark, "function")
    assert.equal(typeof StaticStateRow, "function")
    assert.equal(typeof MarkdownArticle, "function")
    assert.equal(typeof FencedCodeBlock, "function")
    assert.equal(typeof MarkdownTableFrame, "function")
    assert.equal(typeof LeadingNumber, "function")
    assert.equal(typeof defineCompositeComponent, "function")
    assert.equal(typeof defineContractComponent, "function")
    assert.equal(typeof defineContractProjection, "function")
    assert.equal(typeof defineLeafComponent, "function")
    assert.ok(CORE_LAYOUT_CLASS_NAMES.includes("flex"))
    assert.ok(CORE_LAYOUT_CLASS_NAMES.includes("[&>*]:w-full"))
    assert.ok(CORE_LAYOUT_CLASS_NAMES.includes("[&>*]:max-w-md"))
    assert.ok(!CORE_LAYOUT_CLASS_NAMES.some((name) => name.includes("app-") || name.includes("data-node")))
})

test("core owns business-neutral component and contract builders", () => {
    const leaf = defineLeafComponent("text", { size: "sm" }, () => "copy")
    const composite = defineCompositeComponent("row", {}, () => "row")
    const slots = defineContractComponent("example-row", { label: leaf })
    const projection = defineContractProjection("example-panel", () => composite())

    assert.deepEqual(leaf.meta, { shape: "leaf", name: "text", props: { size: "sm" } })
    assert.deepEqual(composite.meta, { shape: "composite", name: "row", props: {} })
    assert.equal(slots.meta.contract, "example-row")
    assert.equal(projection.meta.contract, "example-panel")
})

test("surface list hosts one existing contract component without inventing a row schema", () => {
    const Content = defineContractComponent("example-list", ({ copy }) => createElement(
        "ul",
        null,
        createElement("li", null, copy),
    ))
    const html = renderToStaticMarkup(createElement(SurfaceListCard, {
        label: "Examples",
        render: Content,
        props: { copy: "One" },
    }))

    assert.match(html, /data-grammar-list-mode="contract"/)
    assert.match(html, /data-grammar-list-contract="example-list"/)
    assert.match(html, /<li>One<\/li>/)
})

test("core locks difficult surface anatomy and opens only declared visual axes", () => {
    assert.ok(surfaceCardContract.spec.closedInvariants.includes("label-outside-surface"))
    assert.ok(surfaceListCardContract.spec.closedInvariants.includes("one-collection-one-shell"))
    assert.ok(surfaceListCardContract.spec.closedInvariants.includes("nested-border-xor-shadow"))
    assert.ok(surfaceListCardContract.spec.closedInvariants.includes("row-separators-full-bleed"))
    assert.ok(surfaceListCardContract.spec.closedInvariants.includes("static-row-hover-invariant"))
    assert.ok(markdownArticleContract.spec.closedInvariants.includes("inline-code-uses-neutral-chip-treatment"))
    assert.ok(markdownArticleContract.spec.closedInvariants.includes("table-has-bounded-overflow"))
    assert.ok(surfaceAccordionCardContract.spec.closedInvariants.includes("row-separators-full-bleed"))
    assert.ok(surfaceAccordionCardContract.spec.closedInvariants.includes("neutral-trigger-hover-invariant"))
    assert.ok(surfaceCardContract.spec.variableAxes.includes("frame-mode"))
    assert.ok(surfaceListCardContract.spec.variableAxes.includes("row-mode"))
    assert.ok(CORE_COMPONENT_CONTRACTS["core.rail"].spec.variableAxes.includes("collapse-mode"))
    assert.deepEqual(visualTreatmentContract.spec.extensionPolicy.allowedAxes, [
        "palette",
        "display-type",
        "outline-shadow",
        "floating-composition",
        "motion",
    ])
})
