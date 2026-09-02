import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { Heading } from "./index.js"

describe("Core Heading", () => {
    it("binds outline level to the semantic heading element", () => {
        const markup = renderToStaticMarkup(<Heading level={3}>Evidence</Heading>)

        expect(markup).toContain("<h3")
        expect(markup).toContain("data-level=\"3\"")
        expect(markup).toContain("data-scale=\"standard\"")
        expect(markup).toContain("Evidence")
    })

    it("changes display emphasis without changing outline semantics", () => {
        const markup = renderToStaticMarkup(<Heading level={1} scale="display">Overview</Heading>)

        expect(markup).toContain("<h1")
        expect(markup).toContain("data-scale=\"display\"")
        expect(markup).toContain("text-4xl")
    })

    it("supports a semantic visually-hidden heading and skeleton state", () => {
        const markup = renderToStaticMarkup(<Heading isSkeleton isVisuallyHidden>Loading title</Heading>)

        expect(markup).toContain("aria-hidden=\"true\"")
        expect(markup).toContain("data-loading=\"true\"")
        expect(markup).toContain("sr-only")
    })
})
