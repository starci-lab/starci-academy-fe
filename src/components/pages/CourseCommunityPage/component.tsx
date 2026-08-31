import { CourseCommunity } from "@/components/blocks/learn/CourseCommunity"

/** Route identity passed to the course-owned Community block. */
export type CourseCommunityPageProps = { readonly displayId: string; readonly postId?: string }

/** Thin page shell shared by feed and direct post routes. */
export const CourseCommunityPageBase = (props: CourseCommunityPageProps) => <CourseCommunity {...props} />
