import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ChallengeGradingModelDrawerBase } from "./component"

type SelectInput = {
    readonly props: { readonly label: string; readonly options: ReadonlyArray<{ readonly id: string; readonly label: string }> }
    readonly on?: { readonly select?: (id: string) => void }
}

vi.mock("@/components/leaves/Select", () => {
    const select = ({ props, on }: SelectInput) => (
        <select aria-label={props.label} onChange={(event) => on?.select?.(event.target.value)}>
            {props.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
    )
    return { Select: select }
})

describe("ChallengeGradingModelDrawerBase", () => {
    it("renders model evidence and forwards default, apply and override choices", () => {
        const selectDefault = vi.fn()
        const applyAll = vi.fn()
        const override = vi.fn()
        render(
            <ChallengeGradingModelDrawerBase
                isOpen
                labels={{ title: "Models", description: "Choose", quotaUnavailable: "No quota", applyAll: "Apply", selected: "Selected", override: (title) => `Model for ${title}` }}
                quotaLabel="3 credits"
                models={[
                    { id: "auto", label: "Auto", detail: "Automatic" },
                    { id: "model", label: "Model", detail: "Precise" },
                    { id: "disabled", label: "Disabled", detail: "Offline", disabled: true },
                ]}
                selectedDefaultModelId="auto"
                deliverables={[{ id: "deliverable", title: "API", selectedModelId: "model" }]}
                onDismiss={vi.fn()}
                onSelectDefault={selectDefault}
                onApplyAll={applyAll}
                onOverride={override}
            />,
        )

        expect(screen.getByText("3 credits")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Model" }))
        fireEvent.click(screen.getByRole("button", { name: "Apply" }))
        fireEvent.change(screen.getByLabelText("Model for API"), { target: { value: "auto" } })
        expect(selectDefault).toHaveBeenCalledWith("model")
        expect(applyAll).toHaveBeenCalled()
        expect(override).toHaveBeenCalledWith("deliverable", "auto")
        expect(screen.queryByRole("option", { name: "Disabled" })).not.toBeInTheDocument()
    })

    it("falls back to unavailable quota copy", () => {
        render(<ChallengeGradingModelDrawerBase isOpen labels={{ title: "Models", description: "Choose", quotaUnavailable: "No quota", applyAll: "Apply", selected: "Selected", override: (title) => title }} models={[]} selectedDefaultModelId="auto" deliverables={[]} onDismiss={vi.fn()} />)
        expect(screen.getByText("No quota")).toBeInTheDocument()
    })
})
