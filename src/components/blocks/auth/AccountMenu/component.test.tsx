import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AccountMenuBase } from "./component"

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}

globalThis.ResizeObserver = TestResizeObserver

afterEach(cleanup)

describe("AccountMenuBase", () => {
    it("keeps the guest summary outside the actionable ListBox", async () => {
        const signIn = vi.fn()
        const signUp = vi.fn()
        render(
            <AccountMenuBase
                state="guest"
                props={{
                    label: "Account",
                    guestMessage: "Sign in to follow your progress",
                    signInLabel: "Sign in",
                    signUpLabel: "Sign up",
                }}
                on={{ signIn, signUp }}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Account" }))
        const summary = await screen.findByText("Sign in to follow your progress")
        expect(summary.closest("[role=menuitem]")).toBeNull()

        fireEvent.click(screen.getByRole("menuitem", { name: "Sign in" }))
        expect(signIn).toHaveBeenCalledOnce()

        fireEvent.click(screen.getByRole("button", { name: "Account" }))
        fireEvent.click(await screen.findByRole("menuitem", { name: "Sign up" }))
        expect(signUp).toHaveBeenCalledOnce()
    })

    it("renders legacy signed-in identity, destinations and danger sign out", async () => {
        const navigate = vi.fn()
        const signOut = vi.fn()
        render(
            <AccountMenuBase
                state="signedIn"
                props={{
                    label: "Account",
                    displayName: "StarCi Learner",
                    email: "learner@starci.local",
                    destinations: [
                        { id: "dashboard", label: "Dashboard", icon: "home" },
                        { id: "profile", label: "Profile", icon: "profile" },
                        { id: "cv", label: "CV", icon: "cv" },
                    ],
                    signOutLabel: "Sign out",
                }}
                on={{ navigate, signOut }}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Account" }))
        const name = await screen.findByText("StarCi Learner")
        expect(name.closest("[role=menuitem]")).toBeNull()
        expect(screen.getByText("learner@starci.local")).toBeTruthy()
        expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
            "Dashboard",
            "Profile",
            "CV",
            "Sign out",
        ])

        fireEvent.click(screen.getByRole("menuitem", { name: "Profile" }))
        expect(navigate).toHaveBeenCalledWith("profile")

        fireEvent.click(screen.getByRole("button", { name: "Account" }))
        const signOutItem = await screen.findByRole("menuitem", { name: "Sign out" })
        expect(signOutItem).toHaveClass("text-danger-soft-foreground")
        fireEvent.click(signOutItem)
        expect(signOut).toHaveBeenCalledOnce()
    })
})
