import { CourseCommunityPage } from "@/components/pages/CourseCommunityPage"

type CourseCommunityPostRouteProps = { readonly params: Promise<{ readonly displayId: string; readonly postId: string }> }

/** Mount one direct course-owned Community discussion. */
const CourseCommunityPostRoute = async (props: CourseCommunityPostRouteProps) => {
    const { displayId, postId } = await props.params
    return <CourseCommunityPage displayId={displayId} postId={postId} />
}

export default CourseCommunityPostRoute
