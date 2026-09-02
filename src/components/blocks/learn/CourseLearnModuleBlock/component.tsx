import { CurriculumModuleRow } from "@/components/composites/CurriculumModuleRow"
import { Heading } from "@starci/grammar/common"
import type { ModuleDetail } from "@/modules/api/graphql/queries/query-module"
import { courseLearnModulePageClassName } from "./classNames"

/** Block-owned transport state and resolved module data drawn by the pure module route. */
export type CourseLearnModuleBlockProps = {
    readonly blockState: "pending" | "ready" | "failed"
    readonly title?: string
    readonly module?: ModuleDetail
    readonly label: string
    readonly onContent?: (contentId: string) => void
}

/** Draw one selected module and its authored content run. */
export const CourseLearnModuleBlockBase = (props: CourseLearnModuleBlockProps) => (
    <main className={courseLearnModulePageClassName}>
        <Heading level={1} isSkeleton={props.blockState === "pending"}>{props.title}</Heading>
        <CurriculumModuleRow
            props={{
                title: props.module?.title ?? props.label,
                lessons: (props.module?.contents ?? []).map((content) => ({ id: content.id, title: content.title })),
            }}
            on={{ pressLesson: props.onContent }}
            isLoading={props.blockState === "pending"}
        />
    </main>
)
