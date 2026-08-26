import type { PresentationState } from "./state.js"
import { treatmentFor } from "./state.js"

export type StateMarkProps = {
    readonly state: PresentationState
}

export const StateMark = ({ state }: StateMarkProps) => {
    const treatment = treatmentFor(state)
    if (treatment.mark !== "check") return null

    return (
        <svg
            aria-hidden="true"
            data-grammar-state-mark="check"
            focusable="false"
            viewBox="0 0 20 20"
        >
            <path d="M5 10.5 8.25 14 15 6.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
    )
}

export const meta = { shape: "leaf", grammar: "core" } as const
