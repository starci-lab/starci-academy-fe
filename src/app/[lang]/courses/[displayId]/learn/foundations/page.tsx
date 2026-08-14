import { CourseFoundationsPage } from "@/components/pages/CourseFoundationsPage"

type FoundationsRouteProps = { readonly params: Promise<{ displayId: string }> }

/** Mount the canonical foundations hub page for one course. */
const FoundationsPage = async (input: FoundationsRouteProps) => {
    const { displayId } = await input.params
    return <CourseFoundationsPage displayId={displayId} />
}

export default FoundationsPage
