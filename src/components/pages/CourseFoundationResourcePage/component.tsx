import { CourseFoundationResourceBlock, CourseFoundationResourceBlockBack, CourseFoundationResourceBlockBody, CourseFoundationResourceBlockDescription, CourseFoundationResourceBlockHeader, CourseFoundationResourceBlockNotice, CourseFoundationResourceBlockPractice } from "@/components/blocks/learn/CourseFoundationResourceBlock"

/** Route identities for the resource page composition. */
export type CourseFoundationResourcePageProps = { readonly displayId: string; readonly categoryId: string; readonly foundationId: string }

/** Render the page-owned main shell while the connected block owns resource state and slots. */
export const CourseFoundationResourcePageBase = (props: CourseFoundationResourcePageProps) => {
    const { displayId, categoryId, foundationId } = props
    return <CourseFoundationResourceBlock displayId={displayId} categoryId={categoryId} foundationId={foundationId} render={() => (
        <>
            <CourseFoundationResourceBlockBack />
            <CourseFoundationResourceBlockHeader />
            <CourseFoundationResourceBlockDescription />
            <article><CourseFoundationResourceBlockBody /></article>
            <CourseFoundationResourceBlockPractice />
            <CourseFoundationResourceBlockNotice />
        </>
    )} />
}
