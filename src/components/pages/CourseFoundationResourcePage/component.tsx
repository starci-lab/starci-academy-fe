import { Tree } from "@/components/branches/Tree"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import { CourseFoundationResourceBlock, CourseFoundationResourceBlockBack, CourseFoundationResourceBlockBody, CourseFoundationResourceBlockDescription, CourseFoundationResourceBlockHeader, CourseFoundationResourceBlockNotice, CourseFoundationResourceBlockPractice } from "@/components/blocks/learn/CourseFoundationResourceBlock"

/** Route identities for the resource page composition. */
export type CourseFoundationResourcePageCompositionProps = { readonly displayId: string; readonly categoryId: string; readonly foundationId: string }

/** Render the page-owned main shell while the connected block owns resource state and slots. */
export const CourseFoundationResourcePageBase = ({ displayId, categoryId, foundationId }: CourseFoundationResourcePageCompositionProps) => <CourseFoundationResourceBlock displayId={displayId} categoryId={categoryId} foundationId={foundationId} render={() => (
    <Tree contract="course-foundation-resource-page" render={defineContractComponent("course-foundation-resource-page", {
        back: defineLeafComponent("button", {}, () => <CourseFoundationResourceBlockBack />),
        header: defineContractComponent("page-header-stack", { title: defineLeafComponent("heading", {}, () => <CourseFoundationResourceBlockHeader />) }),
        description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <CourseFoundationResourceBlockDescription />),
        body: defineLeafComponent("article", {}, () => <CourseFoundationResourceBlockBody />),
        practice: defineLeafComponent("button", {}, () => <CourseFoundationResourceBlockPractice />),
        notice: defineCompositeComponent("empty-notice", {}, () => <CourseFoundationResourceBlockNotice />),
    })} />
)} />

/** Source-level ownership marker for the page composition. */
export const meta = { world: "connected", domain: "learn" } as const
