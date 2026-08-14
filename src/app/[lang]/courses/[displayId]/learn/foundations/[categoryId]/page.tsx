import { CourseFoundationCategoryPage } from "@/components/pages/CourseFoundationCategoryPage"

type FoundationsCategoryRouteProps = { readonly params: Promise<{ displayId: string; categoryId: string }> }

/** Mount the canonical searchable foundation-category page. */
const FoundationsCategoryPage = async (input: FoundationsCategoryRouteProps) => {
    const { displayId, categoryId } = await input.params
    return <CourseFoundationCategoryPage displayId={displayId} categoryId={categoryId} />
}

export default FoundationsCategoryPage
