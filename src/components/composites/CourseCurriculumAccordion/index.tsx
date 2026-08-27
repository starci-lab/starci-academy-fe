"use client"

import { useState } from "react"
import { SurfaceAccordionCard } from "@starci/grammar/core"
import { Tree } from "@/components/branches/Tree"
import { SupportingDotList } from "@/components/composites/SupportingDotList"
import { Badge } from "@/components/leaves/Badge"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type CompositeProps,
} from "@/components/contracts/props"

/** Stable difficulty identity used by a course curriculum module. */
export type CourseCurriculumLevel = "foundation" | "intermediate" | "advanced"

/** One ordered preview statement inside an expanded curriculum module. */
export type CourseCurriculumPreview = {
    readonly id: string
    readonly title: string
}

/** One resolved curriculum module with its complete summary and panel anatomy. */
export type CourseCurriculumModule = {
    readonly id: string
    readonly title: string
    readonly level: CourseCurriculumLevel
    readonly levelLabel: string
    readonly previewLabel?: string
    readonly summary: string
    readonly description: string
    readonly previews: ReadonlyArray<CourseCurriculumPreview>
}

/** Resolved copy and modules drawn by the shared curriculum surface. */
export type CourseCurriculumAccordionData = {
    readonly label: string
    readonly modules: ReadonlyArray<CourseCurriculumModule>
}

/** Props for {@link CourseCurriculumAccordion}. */
export type CourseCurriculumAccordionProps = CompositeProps<CourseCurriculumAccordionData>

const LEVEL_TONES = {
    foundation: "success",
    intermediate: "warning",
    advanced: "danger",
} as const

/** Draw one complete curriculum through one shared SurfaceAccordionCard. */
export const CourseCurriculumAccordion = (input: CourseCurriculumAccordionProps) => {
    const isLoading = input.isLoading ?? false
    const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set())
    const items = input.props.modules.map((module) => {
        const isOpen = expandedIds.has(module.id)
        const metadata = defineContractComponent("curriculum-module-meta-row", {
            level: defineLeafComponent("badge", {}, () => (
                <Badge props={{ content: module.levelLabel, tone: LEVEL_TONES[module.level] }} isLoading={isLoading} />
            )),
            preview: module.previewLabel === undefined
                ? undefined
                : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: module.previewLabel, size: "xs", tone: "muted" }} />
                )),
        })

        return {
            id: module.id,
            isOpen,
            isDisabled: isLoading,
            summaryRender: defineContractComponent("curriculum-module-summary-row", {
                title: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                    <Text props={{ content: module.title, size: "sm", weight: "medium" }} isLoading={isLoading} />
                )),
                meta: metadata,
                indicator: isLoading
                    ? undefined
                    : defineLeafComponent("disclosure-indicator", {}, () => (
                        <DisclosureIndicator props={{ isOpen }} />
                    )),
            }),
            bodyRender: defineContractComponent("course-curriculum-module-body", {
                fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: module.summary, size: "xs", tone: "muted" }} />
                )),
                description: module.description.trim().length === 0
                    ? undefined
                    : defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: module.description, size: "sm" }} />
                    )),
                previews: module.previews.length === 0
                    ? undefined
                    : defineCompositeComponent("supporting-dot-list", {}, () => (
                        <SupportingDotList
                            props={{
                                entries: module.previews.map((preview) => ({
                                    id: preview.id,
                                    content: preview.title,
                                })),
                            }}
                        />
                    )),
            }),
        }
    })

    return (
        <Tree
            contract="course-curriculum-accordion"
            render={defineContractComponent("course-curriculum-accordion", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.label, level: 3 }} />
                )),
                disclosure: defineContractProjection("course-curriculum-disclosure", () => (
                    <SurfaceAccordionCard
                        depth="top"
                        items={items}
                        renderSummary={(summary) => <Tree contract="curriculum-module-summary-row" render={summary} />}
                        renderBody={(body) => <Tree contract="course-curriculum-module-body" render={body} />}
                        onItemOpenChange={(id, isOpen) => setExpandedIds((current) => {
                            const next = new Set(current)
                            if (isOpen) next.add(id)
                            else next.delete(id)
                            return next
                        })}
                    />
                )),
            })}
        />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
