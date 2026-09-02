import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { Button } from "./index.js"

describe("Core Button", () => {
    it("owns visible pending feedback and blocks duplicate presses", () => {
        const markup = renderToStaticMarkup(
            <Button variant="primary" isPending onPress={() => undefined}>
                Sign in
            </Button>,
        )

        expect(markup).toContain("data-component=\"Button\"")
        expect(markup).toContain("data-action-pending=\"true\"")
        expect(markup).toContain("aria-busy=\"true\"")
        expect(markup).toContain("disabled=\"\"")
        expect(markup).toContain("data-slot=\"spinner\"")
        expect(markup).toContain("Sign in")
    })

    it("binds explicit disabled state without claiming pending", () => {
        const markup = renderToStaticMarkup(<Button isDisabled>Unavailable</Button>)

        expect(markup).toContain("disabled=\"\"")
        expect(markup).toContain("data-action-pending=\"false\"")
        expect(markup).not.toContain("aria-busy")
        expect(markup).not.toContain("data-slot=\"spinner\"")
    })

    it("accepts app-owned leading and trailing content without owning product icon names", () => {
        const markup = renderToStaticMarkup(
            <Button startContent={<i data-start />} endContent={<i data-end />}>Continue</Button>,
        )

        expect(markup).toContain("data-start=\"true\"")
        expect(markup).toContain("data-end=\"true\"")
        expect(markup.indexOf("data-start")).toBeLessThan(markup.indexOf("Continue"))
        expect(markup.indexOf("data-end")).toBeGreaterThan(markup.indexOf("Continue"))
    })

    it("keeps initial loading geometry separate from action pending", () => {
        const markup = renderToStaticMarkup(
            <Button startContent={<i data-start />} endContent={<i data-end />} isSkeleton>Load action</Button>,
        )

        expect(markup).toContain("data-loading=\"true\"")
        expect(markup).toContain("data-action-pending=\"false\"")
        expect(markup).toContain("disabled=\"\"")
        expect(markup).toContain("text-transparent")
        expect(markup).toContain("Load action")
        expect(markup).not.toContain("data-start")
        expect(markup).not.toContain("data-end")
        expect(markup).not.toContain("data-slot=\"spinner\"")
    })
})
