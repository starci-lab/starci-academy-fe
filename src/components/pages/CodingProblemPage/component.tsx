import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"
import { ProblemReadingColumn } from "@/components/blocks/coding/ProblemReadingColumn"
import { CodingProblemWork } from "@/components/blocks/coding/CodingProblemWork"

/** Route identity required by the problem page anatomy. */
export type CodingProblemPageProps = { readonly slug: string }

/** Keep the two-column route anatomy and compose connected reading/work owners directly. */
export const CodingProblemPageBase = ({ slug }: CodingProblemPageProps) => <Tree contract="coding-problem-page" render={defineContractComponent("coding-problem-page", {
    reading: defineContractProjection("problem-reading-column", () => <ProblemReadingColumn slug={slug} />),
    work: defineContractProjection("problem-work-column", () => <CodingProblemWork slug={slug} />),
})} />

/** Source-level ownership marker for the pure problem page shell. */
export const meta = { world: "pure", domain: "coding" } as const
