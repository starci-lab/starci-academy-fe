/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { _QuickActions } from "./component"

describe("_QuickActions", () => {
    it("renders resolved shortcuts without locale or router providers", () => {
        render(
            <_QuickActions
                props={{
                    label: "Quick access",
                    items: [{ id: "course", icon: "course", label: "Browse courses" }],
                }}
            />,
        )
        expect(screen.getByText("Quick access")).toBeTruthy()
        expect(screen.getByText("Browse courses")).toBeTruthy()
        expect(document.querySelector("[data-node=glyph-compact-action-fact-row]")).toBeTruthy()
    })
})
