import { CurriculumModuleRow } from "@/components/leaves/CurriculumModuleRow"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import type { CourseModule } from "@/modules/api/graphql/queries/types/course"

export type CourseLearnContentHomeLabels = {
    readonly title: string
    readonly description: string
    readonly modules: string
    readonly moduleCount: string
}

export type CourseLearnContentHomeProps = {
    readonly state: "pending" | "ready" | "failed"
    readonly labels: CourseLearnContentHomeLabels
    readonly title?: string
    readonly description?: string
    readonly modules?: ReadonlyArray<CourseModule>
    readonly onRetry?: () => void
    readonly onModule?: (id: string) => void
}

export const _CourseLearnContentHomePage = (input: CourseLearnContentHomeProps) => {
    const loading = input.state === "pending"
    if (input.state === "failed") {
        return <Text props={{ content: input.description ?? input.labels.description, size: "sm" }} />
    }
    return (
        <main>
            <Heading props={{ content: input.title ?? input.labels.title, level: 1 }} isLoading={loading} />
            <Text props={{ content: input.description ?? input.labels.description, size: "sm" }} isLoading={loading} />
            <Heading props={{ content: input.labels.modules, level: 2 }} />
            {(input.modules ?? []).map((module) => (
                <CurriculumModuleRow
                    key={module.id}
                    props={{ title: module.title, levelLabel: module.contentTier, previewLabel: `${module.numContents}` }}
                    isLoading={loading}
                />
            ))}
        </main>
    )
}

export const meta = { world: "pure", domain: "learn" } as const
