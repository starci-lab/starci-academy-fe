import {
    PRESENTATION_STATES,
    assertPresentationState,
    type PresentationState,
} from "../common/index.js"

export {
    PRESENTATION_STATES,
    assertPresentationState,
    isPresentationState,
    type PresentationState,
} from "../common/index.js"

export type NeutralTreatment = {
    readonly state: PresentationState
    readonly tone: "quiet" | "positive" | "information" | "warning" | "danger" | "inactive" | "pending"
    readonly mark: "none" | "check"
}

const neutralTreatment = (state: PresentationState): NeutralTreatment => {
    const id = String(state)
    if (id === "affirmative") return { state, tone: "positive", mark: "check" }
    if (id === "informative") return { state, tone: "information", mark: "none" }
    if (id === "cautionary") return { state, tone: "warning", mark: "none" }
    if (id === "negative") return { state, tone: "danger", mark: "none" }
    if (id === "pending") return { state, tone: "pending", mark: "none" }
    if (id === "unavailable") return { state, tone: "inactive", mark: "none" }
    return { state, tone: "quiet", mark: "none" }
}

export const CORE_NEUTRAL_TREATMENTS = Object.freeze(Object.fromEntries(
    PRESENTATION_STATES.map((state) => [state, Object.freeze(neutralTreatment(state))]),
)) as Readonly<Record<PresentationState, NeutralTreatment>>

export const treatmentFor = (state: PresentationState): NeutralTreatment => {
    assertPresentationState(state)
    return CORE_NEUTRAL_TREATMENTS[state]
}
