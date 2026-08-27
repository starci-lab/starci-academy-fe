import { Heading } from "@/components/leaves/Heading"
import { CourseFoundationCategoryBlock, CourseFoundationCategoryBlockResults, CourseFoundationCategoryBlockSearch } from "@/components/blocks/learn/CourseFoundationCategoryBlock"

/** Route identities for the category page composition. */
export type CourseFoundationCategoryPageProps = { readonly displayId: string; readonly categoryId: string; readonly title: string }

/** Render the page-owned main shell while the connected block owns collection state and slots. */
export const CourseFoundationCategoryPageBase = (props: CourseFoundationCategoryPageProps) => {
    const { displayId, categoryId, title } = props
    return <CourseFoundationCategoryBlock displayId={displayId} categoryId={categoryId} render={() => (
        <>
            <Heading props={{ content: title, level: 1 }} />
            <CourseFoundationCategoryBlockSearch />
            <CourseFoundationCategoryBlockResults />
        </>
    )} />
}
