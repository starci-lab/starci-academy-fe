import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SolutionEditorBase, type SolutionEditorData, type TestcaseOutcome } from "./component"

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}

globalThis.ResizeObserver = TestResizeObserver

const labels = {
    editor: "Solution source",
    languageField: "Language",
    run: "Run",
    submit: "Submit",
    submitting: "Submitting",
}

const props: SolutionEditorData = {
    languages: [
        { id: "python", label: "Python" },
        { id: "cpp", label: "C++" },
    ],
    language: "python",
    source: "def solve():\n    return 0\n",
    labels,
}

const testcases: ReadonlyArray<TestcaseOutcome> = [
    { id: "1", label: "#1", passed: true },
    { id: "2", label: "#2", passed: false },
    { id: "3", label: "#3 hidden" },
]

const consoleTray = () => document.querySelector("[data-node=\"judge-console\"]")

const editorHost = () => document.querySelector("[data-component=\"CodeEditor\"]")

const writingSurface = () => document.querySelector(".cm-content")

const chosenLanguage = () => document.querySelector("[data-slot=\"select-value\"]")

/** The native mirror the select keeps, which is what a change event reaches in a test. */
const languageField = () => {
    const field = document.querySelector("select")
    if (field === null) throw new Error("the language field is not rendered")
    return field
}

const toneOf = (text: string) => screen.getByText(text).closest("[data-component=\"Badge\"]")

describe("SolutionEditorBase", () => {
    it("hands the reader a writable editor in the chosen language and no console yet", () => {
        render(<SolutionEditorBase state="ready" props={props} on={{}} />)

        expect(editorHost()).toHaveAttribute("data-language", "python")
        expect(chosenLanguage()).toHaveTextContent("Python")
        expect(writingSurface()).toHaveAttribute("contenteditable", "true")
        expect(writingSurface()).toHaveTextContent("def solve():")
        expect(screen.getByRole("button", { name: "Run" })).toBeEnabled()
        expect(screen.getByRole("button", { name: "Submit" })).toHaveAttribute("data-action-pending", "false")
        expect(consoleTray()).toBeNull()
    })

    it("reports running and submitting as two separate acts", () => {
        const run = vi.fn()
        const submit = vi.fn()
        render(<SolutionEditorBase state="ready" props={props} on={{ run, submit }} />)

        fireEvent.click(screen.getByRole("button", { name: "Run" }))
        fireEvent.click(screen.getByRole("button", { name: "Submit" }))
        expect(run).toHaveBeenCalledTimes(1)
        expect(submit).toHaveBeenCalledTimes(1)
    })

    it("reports the language the writer switched to rather than switching it itself", () => {
        const changeLanguage = vi.fn()
        render(<SolutionEditorBase state="ready" props={props} on={{ changeLanguage }} />)

        fireEvent.change(languageField(), { target: { value: "cpp" } })
        expect(changeLanguage).toHaveBeenCalledWith("cpp")
        expect(chosenLanguage()).toHaveTextContent("Python")
    })

    it("leaves the toolbar inert when the page reported nothing at all", () => {
        render(<SolutionEditorBase state="ready" props={props} />)

        const run = screen.getByRole("button", { name: "Run" })
        const submit = screen.getByRole("button", { name: "Submit" })
        fireEvent.click(run)
        fireEvent.click(submit)
        fireEvent.change(languageField(), { target: { value: "cpp" } })
        expect(run).toBeEnabled()
        expect(submit).toBeEnabled()
        expect(chosenLanguage()).toHaveTextContent("Python")
    })

    it("closes the toolbar and the editor while a submission is in flight", () => {
        render(<SolutionEditorBase state="submitting" props={props} on={{}} />)

        const submit = screen.getByRole("button", { name: "Submitting" })
        expect(submit).toHaveAttribute("data-action-pending", "true")
        expect(submit).toBeDisabled()
        expect(screen.queryByRole("button", { name: "Submit" })).toBeNull()
        expect(screen.getByRole("button", { name: "Run" })).toBeDisabled()
        expect(languageField()).toBeDisabled()
        expect(writingSurface()).toHaveAttribute("contenteditable", "false")
    })

    it("opens the console only once the judge has cases to report", () => {
        render(<SolutionEditorBase state="judged" props={{ ...props, testcases }} on={{}} />)

        expect(consoleTray()).toBeInTheDocument()
        expect(toneOf("#1")).toHaveAttribute("data-tone", "success")
        expect(toneOf("#2")).toHaveAttribute("data-tone", "danger")
        expect(toneOf("#3 hidden")).toHaveAttribute("data-tone", "neutral")
        expect(document.querySelector("[data-component=\"CodeBlock\"]")).toBeNull()
    })

    it("prints the compiler's own words under the cases when it refused the source", () => {
        render(
            <SolutionEditorBase
                state="judged"
                props={{
                    ...props,
                    testcases: [testcases[2]],
                    compilerMessage: "main.py:2: IndentationError: unexpected indent",
                }}
            />,
        )

        expect(document.querySelector("[data-component=\"CodeBlock\"]")).toBeInTheDocument()
        expect(screen.getByText("main.py:2: IndentationError: unexpected indent")).toBeInTheDocument()
        expect(toneOf("#3 hidden")).toHaveAttribute("data-tone", "neutral")
    })

    it("keeps the console closed when the judge reported an empty case run", () => {
        render(<SolutionEditorBase state="judged" props={{ ...props, testcases: [] }} on={{}} />)

        expect(consoleTray()).toBeNull()
        expect(editorHost()).toBeInTheDocument()
    })
})
