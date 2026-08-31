import { CourseCommunityPage } from "@/components/pages/CourseCommunityPage"

type CourseCommunityRouteProps = { readonly params: Promise<{ readonly displayId: string }> }

/** Mount the course-contained Community feed. */
const CourseCommunityRoute = async (props: CourseCommunityRouteProps) => {
    const { displayId } = await props.params
    return <CourseCommunityPage displayId={displayId} />
}

export default CourseCommunityRoute
