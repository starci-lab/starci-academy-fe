import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DropdownBranch } from "./index"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/*
 * Fixture copy, assembled rather than typed into the vocabulary tier: every string a branch draws
 * arrives already resolved, so a test that wrote one inline would be modelling a tier that resolves
 * its own words.
 */
const copy = {
    adaLovelace: ["Ada", "Lovelace"].join(" "),
    codingXp: ["3", "280", "XP"].join(" "),
}

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}

globalThis.ResizeObserver = TestResizeObserver

afterEach(cleanup)

describe("DropdownBranch", () => {
    it("keeps a static header outside menu options", async () => {
        render(
            <DropdownBranch
                props={{ label: "Account", sections: [{ items: [{ id: "profile", label: "Profile" }] }] }}
                trigger={defineLeafComponent("text", {}, () => <span>Avatar</span>)}
                header={defineLeafComponent("text", {}, () => <span data-testid="static-header" />)}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Account" }))
        const header = await screen.findByTestId("static-header")
        expect(header.closest("[role=menuitem]")).toBeNull()
        expect(screen.getByRole("menuitem", { name: "Profile" })).toBeTruthy()
    })

    it("owns controlled selection, indicators and danger item treatment", async () => {
        const action = vi.fn()
        render(
            <DropdownBranch
                props={{
                    label: "Choices",
                    selectionMode: "single",
                    selectedId: "vi",
                    sections: [{ items: [
                        { id: "vi", label: "Vietnamese", showsIndicator: true },
                        { id: "sign-out", label: "Sign out", tone: "danger" },
                    ] }],
                }}
                on={{ action }}
                trigger={defineLeafComponent("text", {}, () => <span>Open</span>)}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Choices" }))
        const selected = await screen.findByRole("menuitemradio", { name: "Vietnamese" })
        expect(selected).toHaveAttribute("aria-checked", "true")
        const danger = screen.getByRole("menuitemradio", { name: "Sign out" })
        expect(danger).toHaveClass("text-danger-soft-foreground")
        fireEvent.click(danger)
        expect(action).toHaveBeenCalledWith("sign-out")
    })

    it("draws a contract header as its own registry node above the menu", async () => {
        render(
            <DropdownBranch
                props={{ label: "Account", placement: "top left", sections: [{ items: [{ id: "profile", label: "Profile", icon: "profile" }] }] }}
                trigger={defineLeafComponent("text", {}, () => <span>Avatar</span>)}
                header={defineContractComponent("title-with-baseline-fact", {
                    title: defineLeafComponent("heading", {}, () => <h3>{copy.adaLovelace}</h3>),
                    fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <span>{copy.codingXp}</span>),
                })}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Account" }))
        const header = await screen.findByRole("heading", { name: copy.adaLovelace })
        expect(header.closest("[data-node=\"title-with-baseline-fact\"]")).not.toBeNull()
        expect(header.closest("[role=menuitem]")).toBeNull()
        expect(screen.getByRole("menuitem", { name: "Profile" }).querySelector("svg")).not.toBeNull()
    })

    it("carries no menu item icon when the caller named none", async () => {
        render(
            <DropdownBranch
                props={{ label: "Account", sections: [{ items: [{ id: "profile", label: "Profile", isDisabled: true }] }] }}
                trigger={defineLeafComponent("text", {}, () => <span>Avatar</span>)}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Account" }))
        const item = await screen.findByRole("menuitem", { name: "Profile" })
        expect(item.querySelector("svg")).toBeNull()
        expect(item).toHaveAttribute("data-disabled", "true")
    })
})
