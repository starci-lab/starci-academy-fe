import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SolutionEditorBase } from "./component"
describe("SolutionEditor", () => {
    it("renders the submit control", () => {
        render(<SolutionEditorBase state="ready" props={{ languages: [{ id: "ts", label: "TypeScript" }], language: "ts", source: "const x = 1", labels: { editor: "Solution", languageField: "Language", run: "Run", submit: "Submit", submitting: "Submitting" } }} />)
        expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument()
    })
})
