import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import { Heading } from "@/components/leaves/Heading"
import { CourseFoundationCategoryBlock, CourseFoundationCategoryBlockResults, CourseFoundationCategoryBlockSearch } from "@/components/blocks/learn/CourseFoundationCategoryBlock"

/** Route identities for the category page composition. */
export type CourseFoundationCategoryPageCompositionProps = { readonly displayId: string; readonly categoryId: string; readonly title: string }

/** Render the page-owned main shell while the connected block owns collection state and slots. */
export const CourseFoundationCategoryPageBase = ({ displayId, categoryId, title }: CourseFoundationCategoryPageCompositionProps) => <CourseFoundationCategoryBlock displayId={displayId} categoryId={categoryId} render={() => (
    <Tree contract="course-foundation-category-page" render={defineContractComponent("course-foundation-category-page", {
        header: defineContractComponent("page-header-stack", { title: defineLeafComponent("heading", {}, () => <Heading props={{ content: title, level: 1 }} />) }),
        search: defineLeafComponent("search-box", {}, () => <CourseFoundationCategoryBlockSearch />),
        resource: [defineLeafComponent("nav-link", { kind: "section" }, () => <CourseFoundationCategoryBlockResults />)],
    })} />
)} />

/** Source-level ownership marker for the page composition. */
export const meta = { world: "connected", domain: "learn" } as const
