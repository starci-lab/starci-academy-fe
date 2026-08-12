import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { _ProfilePublicCvPage } from "./component"

describe("_ProfilePublicCvPage", () => {
    it("uses the same paper contract while resting and ready", () => {
        const resting = render(<_ProfilePublicCvPage state="pending" props={{ label: "Public CV", message: "", title: "CV", editLabel: "Edit CV", retryLabel: "Retry", isSelf: false }} />)
        expect(resting.container.querySelector("[data-node='profile-cv-paper']")).toBeInTheDocument()
        resting.unmount()
        const ready = render(<_ProfilePublicCvPage state="ready" props={{ label: "Public CV", message: "", title: "CV", pdfUrl: "https://example.com/cv.pdf", editLabel: "Edit CV", retryLabel: "Retry", isSelf: true }} />)
        expect(ready.container.querySelector("iframe[src='https://example.com/cv.pdf']")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Edit CV" })).toBeInTheDocument()
    })

    it("distinguishes no file from uncompiled without drawing an iframe", () => {
        const { rerender, container } = render(<_ProfilePublicCvPage state="empty" props={{ label: "Public CV", message: "No public CV", title: "CV", editLabel: "Edit CV", retryLabel: "Retry", isSelf: false }} />)
        expect(screen.getByText("No public CV")).toBeInTheDocument()
        expect(container.querySelector("iframe")).toBeNull()
        rerender(<_ProfilePublicCvPage state="uncompiled" props={{ label: "Public CV", message: "Not compiled", title: "CV", editLabel: "Edit CV", retryLabel: "Retry", isSelf: false }} />)
        expect(screen.getByText("Not compiled")).toBeInTheDocument()
    })
})
