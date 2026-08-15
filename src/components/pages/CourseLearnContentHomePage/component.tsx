import { Tree } from "@/components/branches/Tree"
import { CurriculumModuleRow } from "@/components/leaves/CurriculumModuleRow"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import type { CourseModule } from "@/modules/api/graphql/queries/types/course"

/** Resolved copy owned by the Modules landing page. */
export type CourseLearnContentHomeLabels = {
    readonly title: string
    readonly description: string
    readonly modules: string
    readonly moduleCount: string
}

/** Query situations, course data and navigation events for the pure Modules page. */
export type CourseLearnContentHomeProps = {
    readonly state: "pending" | "ready" | "failed"
    readonly labels: CourseLearnContentHomeLabels
    readonly title?: string
    readonly description?: string
    readonly modules?: ReadonlyArray<CourseModule>
    readonly onRetry?: () => void
    readonly onModule?: (id: string) => void
}

/** Draw the course's authored module collection under its stable route identity. */
export const _CourseLearnContentHomePage = (input: CourseLearnContentHomeProps) => {
    const loading = input.state === "pending"
    return (
        <Tree contract="course-learn-content-home-page" render={defineContractComponent("course-learn-content-home-page", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: input.title ?? input.labels.title, level: 1 }} isLoading={loading} />
            )),
            description: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: input.description ?? input.labels.description, size: "sm" }} isLoading={loading} />
            )),
            modulesTitle: input.state === "failed" ? undefined : defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: input.labels.modules, level: 2 }} />
            )),
            module: input.state === "failed" ? [] : (input.modules ?? []).map((module) => (
                defineLeafComponent("curriculum-module-row", {}, () => (
                    <CurriculumModuleRow
                        props={{ title: module.title, levelLabel: module.contentTier, previewLabel: `${module.numContents}` }}
                        on={{ press: () => input.onModule?.(module.id) }}
                        isLoading={loading}
                    />
                ))
            )),
        })} />
    )
}

/** Purity and ownership metadata for the Modules landing page twin. */
export const meta = { world: "pure", domain: "learn" } as const
