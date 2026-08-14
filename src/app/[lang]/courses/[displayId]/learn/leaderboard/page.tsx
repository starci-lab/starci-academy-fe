import { CourseLeaderboardPage } from "@/components/pages/CourseLeaderboardPage"

interface CourseLeaderboardRouteProps { readonly params: Promise<{ readonly displayId: string }> }

const CourseLeaderboardRoute = async ({ params }: CourseLeaderboardRouteProps) => {
    const { displayId } = await params
    return <CourseLeaderboardPage displayId={displayId} />
}

export default CourseLeaderboardRoute
