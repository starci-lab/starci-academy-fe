import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { CvDocument } from "@/modules/types/cv"
import { ProfileCvBuilderBase } from "./component"

const document: CvDocument = {
    id: "cv-1",
    label: "CV Backend Developer",
    blocks: [
        { id: "personal", type: "personal", title: "Thông tin cá nhân", order: 0, items: [{ id: "p-1", fields: { name: "Nguyễn Văn A", role: "Backend Developer", email: "a@example.test" } }] },
        { id: "summary", type: "summary", title: "Tóm tắt", order: 1, items: [{ id: "s-1", fields: { text: "Xây dựng API rõ ràng và tin cậy." } }] },
        { id: "experience", type: "experience", title: "Kinh nghiệm", order: 2, items: [{ id: "e-1", fields: {} }] },
        { id: "project", type: "project", title: "Dự án", order: 3, items: [{ id: "r-1", fields: {} }] },
        { id: "skills", type: "skills", title: "Kỹ năng", order: 4, items: [{ id: "k-1", fields: { name: "TypeScript" } }] },
        { id: "education", type: "education", title: "Học vấn", order: 5, items: [{ id: "d-1", fields: {} }] },
    ],
    style: { font: "inter", accent: "#7547FF", language: "vi", template: "classic" },
    pdfCdnKey: null,
    texSource: null,
    isPublic: false,
    createdAt: "2026-08-30T00:00:00.000Z",
    updatedAt: "2026-08-30T00:00:00.000Z",
}

const data = { document, mode: "blocks" as const, texDraft: "\\documentclass{article}", saveState: "saved" as const, completeness: 63, isCreating: false, isCompiling: false, isRewriting: false, isPublishing: false }

describe("ProfileCvBuilderBase", () => {
    it("offers an honest first-document action", () => {
        const create = vi.fn()
        render(<ProfileCvBuilderBase props={{ ...data, document: undefined }} on={{ create }} />)
        fireEvent.click(screen.getByRole("button", { name: "Tạo CV đầu tiên" }))
        expect(create).toHaveBeenCalledOnce()
    })

    it("renders the legacy field workflow and reports field changes", () => {
        const field = vi.fn()
        render(<ProfileCvBuilderBase props={data} on={{ field }} />)
        expect(screen.getByRole("heading", { name: "Thông tin cá nhân" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Điểm khác biệt" })).toBeInTheDocument()
        expect(screen.getByRole("progressbar", { name: "Mức hoàn thiện CV" })).toHaveAttribute("aria-valuenow", "63")
        fireEvent.change(screen.getByRole("textbox", { name: "Họ tên" }), { target: { value: "Nguyễn Văn B" } })
        expect(field).toHaveBeenCalledWith("personal", "name", "Nguyễn Văn B")
    })

    it("switches to LaTeX and exposes the compile outcome", () => {
        const mode = vi.fn()
        const compile = vi.fn()
        const { rerender } = render(<ProfileCvBuilderBase props={data} on={{ mode, compile }} />)
        fireEvent.click(screen.getByRole("tab", { name: "Mã LaTeX" }))
        expect(mode).toHaveBeenCalledWith("latex")
        rerender(<ProfileCvBuilderBase props={{ ...data, mode: "latex", previewUrl: "https://example.test/cv.pdf" }} on={{ mode, compile }} />)
        expect(screen.getByRole("textbox", { name: "Mã nguồn LaTeX" })).toHaveValue("\\documentclass{article}")
        expect(screen.getByRole("link", { name: /Mở PDF/ })).toHaveAttribute("href", "https://example.test/cv.pdf")
        fireEvent.click(screen.getByRole("button", { name: "Biên dịch PDF" }))
        expect(compile).toHaveBeenCalledOnce()
    })
})
