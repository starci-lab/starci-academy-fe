import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import { ContinuationHighlightCard } from "."

describe("ContinuationHighlightCard", () => {
    it("owns one accent-soft surface while the contract owns its interior", () => {
        const { container } = render(
            <ContinuationHighlightCard render={defineContractComponent("mock-interview-resume-panel", {
                identity: defineContractComponent("title-with-baseline-fact", {
                    title: defineLeafComponent("heading", {}, () => <Heading props={{ content: "Continue", level: 3 }} />),
                    fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: "In progress", size: "sm", tone: "muted" }} />),
                }),
                action: defineLeafComponent("button", {}, () => <Button props={{ label: "Resume" }} />),
            })} />,
        )

        expect(container.querySelectorAll("[data-node=mock-interview-resume-panel]")).toHaveLength(1)
        expect(container.querySelector("[data-component=SurfaceCardSurface]")).toBeTruthy()
        expect(container.querySelector("[data-node=mock-interview-resume-panel]")).toHaveClass("bg-accent-soft")
    })
})
