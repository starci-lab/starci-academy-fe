import { CourseHeadhuntingsPage } from "@/components/pages/CourseHeadhuntingsPage"

interface HeadhuntingsRouteProps { readonly params: Promise<{ readonly displayId: string }> }

const HeadhuntingsRoute = async ({ params }: HeadhuntingsRouteProps) => {
    const { displayId } = await params
    return <CourseHeadhuntingsPage displayId={displayId} />
}

export default HeadhuntingsRoute
