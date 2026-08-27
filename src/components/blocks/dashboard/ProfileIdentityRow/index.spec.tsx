import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useQueryMeSwr } from "@/hooks"
import { ProfileIdentityRow } from "./index"

const push = vi.fn()

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({ useQueryMeSwr: vi.fn() }))

const stub = (over: Record<string, unknown>) => {
    vi.mocked(useQueryMeSwr).mockReturnValue({
        data: undefined,
        error: undefined,
        ...over,
    } as never)
}

const row = (root: HTMLElement) =>
    root.querySelector("button")

afterEach(() => {
    vi.clearAllMocks()
})

describe("ProfileIdentityRow", () => {
    it("anchors the dashboard on the signed-in name over its handle", () => {
        stub({ data: { id: "1", username: "ada", displayName: "Ada Lovelace", email: "ada@example.com", avatar: null } })
        const { container } = render(<ProfileIdentityRow />)
        expect(row(container)?.textContent).toBe("Ada Lovelace@ada")
        expect(container.querySelector("[data-loading=\"true\"]")).toBeNull()
    })

    it("opens the viewer's own profile from the row", () => {
        stub({ data: { id: "1", username: "ada", displayName: "Ada Lovelace" } })
        render(<ProfileIdentityRow />)
        fireEvent.click(screen.getByRole("button", { name: "Ada Lovelace" }))
        expect(push).toHaveBeenCalledExactlyOnceWith("/profile/ada")
    })

    it("derives the handle from the email of a person who never chose one", () => {
        stub({ data: { id: "1", username: null, email: "grace@example.com", displayName: "Grace Hopper" } })
        const { container } = render(<ProfileIdentityRow />)
        expect(row(container)?.textContent).toBe("Grace Hopper@grace")
        fireEvent.click(screen.getByRole("button", { name: "Grace Hopper" }))
        expect(push).toHaveBeenCalledExactlyOnceWith("/profile/grace")
    })

    it("falls back to the handle when the display name is blank rather than absent", () => {
        stub({ data: { id: "1", username: "linus", displayName: "   " } })
        const { container } = render(<ProfileIdentityRow />)
        expect(row(container)?.textContent).toBe("linus@linus")
    })

    it("falls back to the handle when there is no display name at all", () => {
        stub({ data: { id: "1", username: "linus", displayName: null } })
        const { container } = render(<ProfileIdentityRow />)
        expect(row(container)?.textContent).toBe("linus@linus")
    })

    it("rests the anchor while the identity is in flight", () => {
        stub({})
        const { container } = render(<ProfileIdentityRow />)
        expect(row(container)).toBeInTheDocument()
        expect(container.querySelector("[data-loading=\"true\"]")).toBeInTheDocument()
    })

    it("draws no anchor at all when the identity request failed", () => {
        stub({ error: new Error("down") })
        const { container } = render(<ProfileIdentityRow />)
        expect(container.firstElementChild).toBeNull()
    })

    it("draws no anchor for a session the server answers with nobody", () => {
        stub({ data: null })
        const { container } = render(<ProfileIdentityRow />)
        expect(container.firstElementChild).toBeNull()
    })

    it("draws no anchor for a person with neither a handle nor an email to derive one from", () => {
        stub({ data: { id: "1", username: null, email: null, displayName: "Nobody" } })
        const { container } = render(<ProfileIdentityRow />)
        expect(container.firstElementChild).toBeNull()
    })

    it("treats a cleared error as no error at all", () => {
        stub({ error: null, data: { id: "1", username: "ada", displayName: "Ada Lovelace" } })
        const { container } = render(<ProfileIdentityRow />)
        expect(row(container)?.textContent).toBe("Ada Lovelace@ada")
    })

    it("draws the viewer's own portrait when the account has one", () => {
        stub({ data: { id: "1", username: "ada", displayName: "Ada Lovelace", avatar: "https://example.com/ada.png" } })
        render(<ProfileIdentityRow />)
        expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBeInTheDocument()
    })
})
