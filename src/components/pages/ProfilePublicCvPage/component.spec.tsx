import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ProfilePublicCvBase } from "@/components/blocks/profile/ProfilePublicCv/component"

describe("ProfilePublicCvPageBase", () => {
    it("keeps the document region stable while resting and ready", () => {
        const resting = render(<ProfilePublicCvBase state="pending" label="Public CV" message="" title="CV" editLabel="Edit CV" retryLabel="Retry" isSelf={false} />)
        expect(resting.container.querySelector("iframe[title='CV']")).toHaveAttribute("aria-busy", "true")
        resting.unmount()
        const ready = render(<ProfilePublicCvBase state="ready" label="Public CV" message="" title="CV" pdfUrl="https://example.com/cv.pdf" editLabel="Edit CV" retryLabel="Retry" isSelf />)
        expect(ready.container.querySelector("iframe[src='https://example.com/cv.pdf']")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Edit CV" })).toBeInTheDocument()
    })

    it("distinguishes no file from uncompiled without drawing an iframe", () => {
        const { rerender, container } = render(<ProfilePublicCvBase state="empty" label="Public CV" message="No public CV" title="CV" editLabel="Edit CV" retryLabel="Retry" isSelf={false} />)
        expect(screen.getByText("No public CV")).toBeInTheDocument()
        expect(container.querySelector("iframe")).toBeNull()
        rerender(<ProfilePublicCvBase state="uncompiled" label="Public CV" message="Not compiled" title="CV" editLabel="Edit CV" retryLabel="Retry" isSelf={false} />)
        expect(screen.getByText("Not compiled")).toBeInTheDocument()
    })
})
