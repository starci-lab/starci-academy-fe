import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { Link } from "./index.js"

describe("Core Link", () => {
    it("always owns a real browser destination", () => {
        const markup = renderToStaticMarkup(<Link href="/courses" isCurrent startContent={<i data-icon />}>Courses</Link>)
        expect(markup).toContain('href="/courses"')
        expect(markup).toContain('aria-current="page"')
        expect(markup).toContain('data-icon="true"')
    })

    it("secures new browsing contexts by default", () => {
        const markup = renderToStaticMarkup(<Link href="https://example.com" target="_blank">Docs</Link>)
        expect(markup).toContain('target="_blank"')
        expect(markup).toContain('rel="noopener noreferrer"')
    })

    it("offers button appearance without changing anchor semantics", () => {
        const markup = renderToStaticMarkup(<Link href="/checkout" appearance="button" buttonVariant="primary" buttonSize="lg">Checkout</Link>)

        expect(markup).toContain("<a")
        expect(markup).toContain('href="/checkout"')
        expect(markup).toContain('data-appearance="button"')
        expect(markup).not.toContain("<button")
    })
})
