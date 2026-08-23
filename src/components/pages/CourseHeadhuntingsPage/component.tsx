import { CourseHeadhuntingsBlock } from "@/components/blocks/learn/CourseHeadhuntingsBlock"
export type { HeadhuntingDirectoryRow } from "@/components/blocks/learn/CourseHeadhuntingsBlock"

/** Route identity passed from the application page entry. */
export type CourseHeadhuntingsPageProps = { readonly displayId: string }

/** Route shell: the connected directory block owns its data and interaction state. */
export const CourseHeadhuntingsPageBase = ({ displayId }: CourseHeadhuntingsPageProps) => (
    <CourseHeadhuntingsBlock displayId={displayId} />
)

/** Ownership metadata for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
