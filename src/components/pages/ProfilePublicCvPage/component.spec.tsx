import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProfilePublicCvBase } from "@/components/blocks/profile/ProfilePublicCv/component"

describe("ProfilePublicCvPageBase", () => {
    const baseProps = {
        label: "Public CV",
        title: "Professional profile",
        description: "A public, read-only CV.",
        statusLabel: "Ready",
        noticeTitle: "State title",
        noticeDescription: "State description",
        openLabel: "Open CV",
        editLabel: "Manage CV",
        retryLabel: "Try again",
        isSelf: false,
    } as const

    it("keeps a document-shaped region while loading and mounts the iframe only when ready", () => {
        const resting = render(<ProfilePublicCvBase {...baseProps} state="pending" statusLabel="Loading" />)
        expect(resting.container.querySelector("[data-state='pending']")).toBeInTheDocument()
        expect(resting.container.querySelector("iframe")).toBeNull()
        resting.unmount()
        const ready = render(<ProfilePublicCvBase {...baseProps} state="ready" pdfUrl="https://example.com/cv.pdf" updatedLabel="Updated Aug 30, 2026" />)
        expect(ready.container.querySelector("iframe[src='https://example.com/cv.pdf']")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Open CV" })).toHaveAttribute("href", "https://example.com/cv.pdf")
        expect(screen.getByText("Updated Aug 30, 2026")).toBeInTheDocument()
    })

    it("distinguishes no file from a public CV that is still being prepared", () => {
        const { rerender, container } = render(<ProfilePublicCvBase {...baseProps} state="empty" statusLabel="Not published" noticeTitle="No public CV yet" noticeDescription="Nothing has been published." />)
        expect(screen.getByRole("heading", { name: "No public CV yet" })).toBeInTheDocument()
        expect(container.querySelector("iframe")).toBeNull()
        rerender(<ProfilePublicCvBase {...baseProps} state="uncompiled" statusLabel="Preparing" noticeTitle="The CV is being prepared" noticeDescription="The public document is not ready." />)
        expect(screen.getByRole("heading", { name: "The CV is being prepared" })).toBeInTheDocument()
        expect(container.querySelector("iframe")).toBeNull()
    })

    it("keeps recovery inside the CV owner and prevents duplicate retry", () => {
        const retry = vi.fn()
        render(<ProfilePublicCvBase {...baseProps} state="error" statusLabel="Unavailable" noticeTitle="Could not load CV" noticeDescription="Try again." retryPending on={{ retry }} />)
        expect(screen.getByRole("alert")).toHaveTextContent("Could not load CV")
        expect(screen.getByRole("button", { name: "Try again" })).toBeDisabled()
    })
})
