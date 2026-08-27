export { coreGrammar, type CoreGrammar } from "./grammar.js"
export {
    CORE_COMPONENT_CONTRACTS,
    markdownArticleContract,
    railContract,
    surfaceAccordionCardContract,
    surfaceCardContract,
    surfaceListCardContract,
    visualTreatmentContract,
    type CoreComponentContract,
    type CoreComponentContractId,
} from "./contracts.js"
export { CORE_RULES, type CoreRule } from "./rules.js"
export {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type BlockProps,
    type ComponentActions,
    type ComponentData,
    type CompositeComponent,
    type CompositeComponentMeta,
    type CompositeProps,
    type ContractComponentMeta,
    type ContractProjection,
    type ContractPropValue,
    type ContractRenderComponent,
    type ContractSlots,
    type DataValue,
    type DefineContractComponent,
    type DefinedContractComponent,
    type LeafComponent,
    type LeafComponentMeta,
    type LeafProps,
} from "./component-contracts.js"
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
export { LeadingNumber, meta as leadingNumberMeta, type LeadingNumberProps } from "./LeadingNumber.js"
export {
    StaticStateRow,
    meta as staticStateRowMeta,
    type StaticStateRowData,
    type StaticStateRowProps,
} from "./composite/StaticStateRow/index.js"
export { SurfaceCard, meta as surfaceCardMeta, type SurfaceCardProps, type WholeCardAction } from "./branch/SurfaceCard/index.js"
export { SurfaceListCard, meta as surfaceListCardMeta, type SurfaceListCardProps } from "./branch/SurfaceListCard/index.js"
export {
    FencedCodeBlock,
    MarkdownArticle,
    MarkdownTableFrame,
    meta as markdownArticleMeta,
    type FencedCodeBlockProps,
    type MarkdownArticleProps,
    type MarkdownTableFrameProps,
} from "./branch/MarkdownArticle/index.js"
export {
    SurfaceAccordionCard,
    meta as surfaceAccordionCardMeta,
    type SurfaceAccordionCardItem,
    type SurfaceAccordionCardProps,
} from "./branch/SurfaceAccordionCard/index.js"
export { Rail, meta as railMeta, type RailProps } from "./branch/Rail/index.js"
