"use client"

import { useState } from "react"
import { SurfaceAccordionCard } from "@starci/grammar/core"
import { SupportingDotList } from "@/components/composites/SupportingDotList"
import { Badge } from "@/components/leaves/Badge"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"

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
export type CourseCurriculumAccordionProps = {
    readonly props: CourseCurriculumAccordionData
    readonly isLoading?: boolean
}

const LEVEL_TONES = {
    foundation: "success",
    intermediate: "warning",
    advanced: "danger",
} as const

/** Draw one complete curriculum through one shared SurfaceAccordionCard. */
export const CourseCurriculumAccordion = (props: CourseCurriculumAccordionProps) => {
    const isLoading = props.isLoading ?? false
    const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set())
    const items = props.props.modules.map((module) => {
        const isOpen = expandedIds.has(module.id)
        return {
            id: module.id,
            isOpen,
            isDisabled: isLoading,
            summaryRender: <><Text props={{ content: module.title, size: "sm", weight: "medium" }} isLoading={isLoading} /><Badge props={{ content: module.levelLabel, tone: LEVEL_TONES[module.level] }} isLoading={isLoading} />{module.previewLabel === undefined ? null : <Text props={{ content: module.previewLabel, size: "xs", tone: "muted" }} />}{isLoading ? null : <DisclosureIndicator props={{ isOpen }} />}</>,
            bodyRender: <><Text props={{ content: module.summary, size: "xs", tone: "muted" }} />{module.description.trim().length === 0 ? null : <Text props={{ content: module.description, size: "sm" }} />}{module.previews.length === 0 ? null : <SupportingDotList props={{ entries: module.previews.map((preview) => ({ id: preview.id, content: preview.title })) }} />}</>,
        }
    })

    return (
        <section>
            <Heading props={{ content: props.props.label, level: 3 }} />
            <SurfaceAccordionCard
                depth="top"
                items={items}
                renderSummary={(summary) => <>{summary}</>}
                renderBody={(body) => <>{body}</>}
                onItemOpenChange={(id, isOpen) => setExpandedIds((current) => {
                    const next = new Set(current)
                    if (isOpen) next.add(id)
                    else next.delete(id)
                    return next
                })}
            />
        </section>
    )
}
