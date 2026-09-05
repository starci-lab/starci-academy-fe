import type { GraphQLResponse } from "../../types"

/** A compact standalone concept returned by the public catalog. */
export interface ConceptSummary {
    readonly displayId: string
    readonly title: string
    readonly description: string
    readonly category: string
    readonly difficulty: string
    readonly minutesRead: number
    readonly implementation: string
    readonly sortIndex: number
}

/** One learner-facing outcome or prerequisite. */
export interface ConceptStatement {
    readonly id: string
    readonly text: string
}

/** One cited source kept with the concept. */
export interface ConceptReference {
    readonly id: string
    readonly label: string
    readonly url?: string | null
    readonly citation?: string | null
}

/** An authored option. It is descriptive until a grading API exists. */
export interface ConceptActivityOption {
    readonly id: string
    readonly label: string
}

/** Learner-safe activity projection. Private answers, checks, and simulation success are absent. */
export interface ConceptActivity {
    readonly id: string
    readonly kind: string
    readonly stableKey?: string | null
    readonly prompt: string
    readonly responseKind?: string | null
    readonly isDiagnostic?: boolean | null
    readonly outcomeIds?: ReadonlyArray<string> | null
    readonly afterDays?: number | null
    readonly options?: ReadonlyArray<ConceptActivityOption> | null
    readonly exercise?: {
        readonly submissionInstructions: string
        readonly verificationMode: string
        readonly verificationInstructions: string
    } | null
}

/** One source file the API has explicitly made safe for learners. */
export interface ConceptWorkspaceFile {
    readonly path: string
    readonly role: "source" | "support" | "test"
    readonly content?: string | null
}

/** Public workspace context. Test files and private checks never enter this shape. */
export interface ConceptWorkspace {
    readonly runtime: string
    readonly files: ReadonlyArray<ConceptWorkspaceFile>
    readonly commands?: { readonly windows?: string | null; readonly unix?: string | null } | null
}

/** One ordered lesson section. */
export interface ConceptSection {
    readonly displayId: string
    readonly title: string
    readonly phase: string
    readonly body: string
    readonly sortIndex: number
    readonly activities?: ReadonlyArray<ConceptActivity> | null
}

/** Full concept document used by the three-column reader. */
export interface ConceptDetail extends ConceptSummary {
    readonly body?: string | null
    readonly learningOutcomes?: ReadonlyArray<ConceptStatement> | null
    readonly prerequisites?: ReadonlyArray<ConceptStatement> | null
    readonly references?: ReadonlyArray<ConceptReference> | null
    readonly workspace?: ConceptWorkspace | null
    readonly activities?: ReadonlyArray<ConceptActivity> | null
    readonly sections: ReadonlyArray<ConceptSection>
    readonly capabilities: {
        readonly choiceSubmission: false
        readonly writtenResponseGrading: false
        readonly simulationExecution: false
    }
}

/** Public list query response. */
export type QueryConceptsResponse = {
    readonly concepts: GraphQLResponse<ReadonlyArray<ConceptSummary>>
}

/** Public detail query response. */
export type QueryConceptResponse = {
    readonly concept: GraphQLResponse<ConceptDetail | null>
}
