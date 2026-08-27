import { ProblemReadingColumn } from "@/components/blocks/coding/ProblemReadingColumn"
import { CodingProblemWork } from "@/components/blocks/coding/CodingProblemWork"

/** Route identity required by the problem page anatomy. */
export type CodingProblemPageProps = { readonly slug: string }

/** Keep the two-column route anatomy and compose connected reading/work owners directly. */
export const CodingProblemPageBase = (props: CodingProblemPageProps) => {
    const { slug } = props
    return <>
        <ProblemReadingColumn slug={slug} />
        <CodingProblemWork slug={slug} />
    </>
}
