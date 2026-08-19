import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CoursePriceDetailBase } from "./component"

const reckoning = [
    { id: "list", label: "List price", value: "1.290.000 ₫" },
    { id: "phase", label: "Early bird", value: "990.000 ₫" },
    { id: "loyalty", label: "Loyalty reduction", value: "-100.000 ₫" },
    { id: "payable", label: "You pay", value: "890.000 ₫" },
] as const

/** One row of the reckoning, as the shared standing-figure row draws it. */
const rows = (root: HTMLElement) => root.querySelectorAll("[data-node=\"glyph-title-fact-row\"]")

/** The mark each row wears, as markup - two rows wearing one mark draw the same glyph. */
const marks = (root: HTMLElement) =>
    Array.from(rows(root), (row) => row.querySelector("svg")?.outerHTML)

/** The sentences under the reckoning; the rows themselves speak at other steps. */
const sentences = (root: HTMLElement) =>
    Array.from(root.querySelectorAll("[data-component=\"Text\"][data-size=\"sm\"]"), (text) => text.textContent)

describe("CoursePriceDetailBase", () => {
    it("reads the reckoning top to bottom, ending with what the learner owes", () => {
        const { container } = render(<CoursePriceDetailBase
            state="ready"
            props={{ title: "Backend basics", lines: [...reckoning] }}
        />)
        expect(container.querySelector("[data-component=\"Heading\"]")?.textContent).toBe("Backend basics")
        expect(Array.from(rows(container), (row) => row.textContent)).toEqual([
            "List price1.290.000 ₫",
            "Early bird990.000 ₫",
            "Loyalty reduction-100.000 ₫",
            "You pay890.000 ₫",
        ])
    })

    it("marks the two prices alike, the reduction differently and the payable line as settled", () => {
        const { container } = render(<CoursePriceDetailBase state="ready" props={{ lines: [...reckoning] }} />)
        const [list, phase, loyalty, payable] = marks(container)
        expect(phase).toBe(list)
        expect(loyalty).not.toBe(list)
        expect(payable).toContain("text-success-soft-foreground")
        expect(list).not.toContain("text-success-soft-foreground")
    })

    it("falls back to the price mark for a line the product has not named", () => {
        const { container } = render(<CoursePriceDetailBase state="ready" props={{ lines: [
            { id: "list", label: "List price", value: "1.290.000 ₫" },
            { id: "referral", label: "Referral", value: "-50.000 ₫" },
        ] }} />)
        const [list, referral] = marks(container)
        expect(referral).toBe(list)
    })

    it("draws an empty reckoning rather than a hole when no lines arrived", () => {
        const { container } = render(<CoursePriceDetailBase state="ready" props={{ title: "Backend basics" }} />)
        expect(rows(container)).toHaveLength(0)
        expect(container.querySelector("[data-node=\"stacked-stat-rows\"]")).toBeInTheDocument()
    })

    it("omits the reason and the forward look when neither applies", () => {
        const { container } = render(<CoursePriceDetailBase state="ready" props={{ lines: [...reckoning] }} />)
        expect(sentences(container)).toEqual([])
    })

    it("reads the reason and the forward look as sentences under the reckoning", () => {
        const { container } = render(<CoursePriceDetailBase
            state="ready"
            props={{
                lines: [...reckoning],
                reason: "Your loyalty tier takes 100.000 ₫ off",
                forwardLook: "3 seats left before the price rises",
            }}
        />)
        expect(sentences(container)).toEqual([
            "Your loyalty tier takes 100.000 ₫ off",
            "3 seats left before the price rises",
        ])
    })

    it("replaces the whole reckoning with a notice when the price cannot be personalised", () => {
        const { container } = render(<CoursePriceDetailBase
            state="unavailable"
            props={{ title: "Backend basics", lines: [...reckoning], unavailableMessage: "Sign in to see your price" }}
        />)
        expect(rows(container)).toHaveLength(0)
        expect(container.querySelector("[data-node=\"stacked-stat-rows\"]")).toBeNull()
        expect(sentences(container)).toEqual(["Sign in to see your price"])
    })

    it("rests the title, every amount and the reason while the reckoning is in flight", () => {
        const { container } = render(<CoursePriceDetailBase
            state="pending"
            props={{ lines: [...reckoning], reason: "Loyalty applies" }}
        />)
        expect(container.querySelector("[data-component=\"Heading\"]")).toHaveAttribute("data-loading", "true")
        expect(rows(container)).toHaveLength(4)
        expect(container.querySelectorAll("[data-component=\"Text\"][data-size=\"xs\"][data-loading=\"true\"]"))
            .toHaveLength(4)
        expect(container.querySelector("[data-component=\"Text\"][data-size=\"sm\"]"))
            .toHaveAttribute("data-loading", "true")
    })
})
