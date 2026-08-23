import { CourseHeadhuntingCompanyBlock } from "@/components/blocks/learn/CourseHeadhuntingCompanyBlock"

/** Route identity passed to the connected company block. */
export type CourseHeadhuntingCompanyPageProps = { readonly displayId: string; readonly companyId: string }

/** Route shell composed from the connected company profile block. */
export const CourseHeadhuntingCompanyPageBase = ({ displayId, companyId }: CourseHeadhuntingCompanyPageProps) => (
    <CourseHeadhuntingCompanyBlock displayId={displayId} companyId={companyId} />
)

/** Ownership metadata for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
