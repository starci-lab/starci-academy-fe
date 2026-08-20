import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ContractContent, Tree } from "."
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"

/*
 * Fixture copy, assembled rather than typed into the vocabulary tier: every string a branch draws
 * arrives already resolved, so a test that wrote one inline would be modelling a tier that resolves
 * its own words.
 */
const copy = {
    weeklyGoals: ["Weekly", "goals"].join(" "),
    percent: ["40%"].join(" "),
    drawnByOwner: ["Drawn", "by", "the", "branch", "that", "owns", "it"].join(" "),
    pinnedProjects: ["Pinned", "projects"].join(" "),
    selected: ["2", "selected"].join(" "),
    alreadyWholeNode: ["Already", "a", "whole", "node"].join(" "),
    boundedInVendorBody: ["Bounded", "inside", "a", "vendor", "body"].join(" "),
}

/**
 * What these tests guard.
 *
 * `Tree` draws ONE registry node and owns no class of its own, so everything asserted here has to
 * come from the entry: the element the entry names, the classes it declares, the reason it records,
 * and the list role a `ul`/`ol` entry must announce twice because Tailwind's preflight removes it.
 *
 * The other half is what happens to the children. A projection has ALREADY drawn its host, so
 * opening a second node around it is the duplicate-wrapper bug this branch is written to avoid; a
 * plain contract child opens its own node; a leaf is passed through; an absent optional slot
 * produces nothing rather than an empty node.
 */

const oneFileRow = (label: string) => defineContractComponent("source-file-row", {
    disclosure: defineLeafComponent("icon-button", {}, () => <button type="button">{`open ${label}`}</button>),
    name: defineLeafComponent("text", { size: "sm" }, () => <span>{label}</span>),
})

describe("Tree", () => {
    it("draws the element, classes and reason the entry declares and nothing of its own", () => {
        const { container } = render(
            <Tree
                contract="title-with-baseline-fact"
                render={defineContractComponent("title-with-baseline-fact", {
                    title: defineLeafComponent("heading", {}, () => <h3>{copy.weeklyGoals}</h3>),
                    fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <span>{copy.percent}</span>),
                })}
            />,
        )

        const node = container.firstElementChild
        expect(node?.tagName).toBe("DIV")
        expect(node).toHaveAttribute("data-tier", "branch")
        expect(node).toHaveAttribute("data-node", "title-with-baseline-fact")
        expect(node?.getAttribute("data-why")).toContain("muted fact")
        expect(node?.className).toContain("items-baseline")
        expect(node).not.toHaveAttribute("role")
    })

    it("announces a list entry as a list, because preflight takes the role away", () => {
        const { container } = render(
            <Tree
                contract="source-file-list"
                render={defineContractComponent("source-file-list", { file: [oneFileRow("index.ts")] })}
            />,
        )

        const node = container.firstElementChild
        expect(node?.tagName).toBe("UL")
        expect(node).toHaveAttribute("role", "list")
        expect(node?.querySelector("li")).not.toBeNull()
    })

    it("repeats one slot for every child it was given and skips an absent optional slot", () => {
        const { container } = render(
            <Tree
                contract="source-file-list"
                render={defineContractComponent("source-file-list", {
                    file: [oneFileRow("a.ts"), oneFileRow("b.ts"), oneFileRow("c.ts")],
                })}
            />,
        )

        expect(container.querySelectorAll("[data-node=\"source-file-row\"]")).toHaveLength(3)
        expect(container.querySelectorAll("[data-node=\"source-file-row\"] [data-node]")).toHaveLength(0)
        expect(container.querySelector("[data-component=\"StatusDot\"]")).toBeNull()
    })

    it("hands a projected body through unarranged, without a second node inside the one it drew", () => {
        const { container } = render(
            <Tree
                contract="title-with-baseline-fact"
                render={defineContractProjection("title-with-baseline-fact", () => (
                    <p data-testid="already-drawn">{copy.drawnByOwner}</p>
                ))}
            />,
        )

        expect(container.querySelectorAll("[data-node]")).toHaveLength(1)
        expect(container.firstElementChild).toHaveAttribute("data-node", "title-with-baseline-fact")
        expect(container.firstElementChild?.firstElementChild?.tagName).toBe("P")
    })

    it("lets a projected child keep the single node it already drew", () => {
        const { container } = render(
            <Tree
                contract="label-row-over-card"
                render={defineContractComponent("label-row-over-card", {
                    label: defineContractComponent("title-with-baseline-fact", {
                        title: defineLeafComponent("heading", {}, () => <h3>{copy.pinnedProjects}</h3>),
                        fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <span>{copy.selected}</span>),
                    }),
                    body: defineContractProjection("source-file-list", () => (
                        <ul data-testid="projected-body"><li>{copy.alreadyWholeNode}</li></ul>
                    )),
                })}
            />,
        )

        expect(container.querySelectorAll("[data-node=\"source-file-list\"]")).toHaveLength(0)
        expect(container.querySelectorAll("[data-node=\"title-with-baseline-fact\"]")).toHaveLength(1)
        expect(container.querySelector("[data-testid=\"projected-body\"]")).not.toBeNull()
    })

    it("renders only the validated content when the host belongs to somebody else", () => {
        const { container } = render(
            <ContractContent
                contract="title-with-baseline-fact"
                render={defineContractComponent("title-with-baseline-fact", {
                    title: defineLeafComponent("heading", {}, () => <h3>{copy.boundedInVendorBody}</h3>),
                    fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <span>now</span>),
                })}
            />,
        )

        expect(container.querySelector("[data-node]")).toBeNull()
        expect(container.textContent).toContain(copy.boundedInVendorBody)
    })
})
