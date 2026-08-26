export { coreGrammar, type CoreGrammar } from "./grammar.js"
export {
    CORE_COMPONENT_CONTRACTS,
    railContract,
    surfaceCardContract,
    surfaceListCardContract,
    visualTreatmentContract,
    type CoreComponentContract,
    type CoreComponentContractId,
} from "./contracts.js"
export { CORE_RULES, type CoreRule } from "./rules.js"
export {
    CORE_NEUTRAL_TREATMENTS,
    PRESENTATION_STATES,
    assertPresentationState,
    isPresentationState,
    treatmentFor,
    type NeutralTreatment,
    type PresentationState,
} from "./state.js"
export {
    CORE_LAYOUT_CLASS_NAMES,
    type CoreLayoutClassName,
} from "./layout.js"
export { StateMark, meta as stateMarkMeta, type StateMarkProps } from "./StateMark.js"
export {
    StaticStateRow,
    meta as staticStateRowMeta,
    type StaticStateRowData,
    type StaticStateRowProps,
} from "./composite/StaticStateRow/index.js"
export { SurfaceCard, meta as surfaceCardMeta, type SurfaceCardProps, type WholeCardAction } from "./branch/SurfaceCard/index.js"
export { SurfaceListCard, meta as surfaceListCardMeta, type SurfaceListCardProps, type SurfaceListItem } from "./branch/SurfaceListCard/index.js"
export { Rail, meta as railMeta, type RailProps } from "./branch/Rail/index.js"
