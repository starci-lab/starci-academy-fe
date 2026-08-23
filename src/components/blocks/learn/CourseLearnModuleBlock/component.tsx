import { Tree } from "@/components/branches/Tree"
import { CurriculumModuleRow } from "@/components/composites/CurriculumModuleRow"
import { Heading } from "@/components/leaves/Heading"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import type { ModuleDetail } from "@/modules/api/graphql/queries/query-module"

/** Block-owned transport state and resolved module data drawn by the pure module route. */
export type CourseLearnModuleBlockProps = {
    readonly blockState: "pending" | "ready" | "failed"
    readonly title?: string
    readonly module?: ModuleDetail
    readonly label: string
    readonly onContent?: (contentId: string) => void
}

/** Draw one selected module and its authored content run. */
export const CourseLearnModuleBlockBase = (input: CourseLearnModuleBlockProps) => (
    <Tree contract={"course-learn-module-page"} render={defineContractComponent("course-learn-module-page", {
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: input.title, level: 1 }} isLoading={input.blockState === "pending"} />
        )),
        module: defineCompositeComponent("curriculum-module-row", {}, () => (
            <CurriculumModuleRow
                props={{
                    title: input.module?.title ?? input.label,
                    lessons: (input.module?.contents ?? []).map((content) => ({ id: content.id, title: content.title })),
                }}
                on={{ pressLesson: input.onContent }}
                isLoading={input.blockState === "pending"}
            />
        )),
    })} />
)

/** Purity and ownership metadata for the module page twin. */
export const meta = { world: "pure", domain: "learn" } as const



