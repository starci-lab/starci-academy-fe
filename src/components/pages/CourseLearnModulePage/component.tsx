import { CurriculumModuleRow } from "@/components/leaves/CurriculumModuleRow"
import { Heading } from "@/components/leaves/Heading"
import type { ModuleDetail } from "@/modules/api/graphql/queries/query-module"

export type CourseLearnModulePageProps = {
    readonly state: "pending" | "ready" | "failed"
    readonly title?: string
    readonly module?: ModuleDetail
    readonly label: string
}

export const _CourseLearnModulePage = (input: CourseLearnModulePageProps) => (
    <main>
        <Heading props={{ content: input.title, level: 1 }} isLoading={input.state === "pending"} />
        <CurriculumModuleRow
            props={{
                title: input.module?.title ?? input.label,
                lessons: (input.module?.contents ?? []).map((content) => ({ id: content.id, title: content.title })),
            }}
            isLoading={input.state === "pending"}
        />
    </main>
)

export const meta = { world: "pure", domain: "learn" } as const
