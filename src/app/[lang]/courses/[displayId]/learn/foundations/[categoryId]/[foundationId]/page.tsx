import { CourseFoundationResourcePage } from "@/components/pages/CourseFoundationResourcePage"

type FoundationResourceRouteProps = { readonly params: Promise<{ displayId: string; categoryId: string; foundationId: string }> }

/** Mount the canonical foundation-resource reader page. */
const FoundationResourcePage = async (input: FoundationResourceRouteProps) => {
    const { displayId, categoryId, foundationId } = await input.params
    return <CourseFoundationResourcePage displayId={displayId} categoryId={categoryId} foundationId={foundationId} />
}

export default FoundationResourcePage
