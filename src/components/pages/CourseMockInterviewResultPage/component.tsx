import { CourseMockInterviewResultBlock } from "@/components/blocks/learn/CourseMockInterviewResultBlock"

/** Route identity passed to the connected block. */
export type CourseMockInterviewResultPageProps = { readonly displayId: string; readonly sessionId: string }

/** Route shell composed from the connected block. */
export const CourseMockInterviewResultPageBase = (props: CourseMockInterviewResultPageProps) => <CourseMockInterviewResultBlock {...props} />

/** Ownership metadata for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
