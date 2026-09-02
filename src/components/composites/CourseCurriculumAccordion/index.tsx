"use client"

import { useState } from "react"
import { SurfaceAccordionCard } from "@starci/grammar/common"
import { SurfaceCard } from "@starci/grammar/common"
import { SupportingDotList } from "@/components/composites/SupportingDotList"
import { Badge } from "@starci/grammar/common"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { curriculumBodyClassName, curriculumClassName, curriculumMetaClassName, curriculumSummaryClassName } from "./classNames"

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

/** Preserve the contract's stable visual identity for each authored curriculum level. */
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
            summaryRender: <div className={curriculumSummaryClassName}><Text size={"sm"} weight={"medium"} isSkeleton={isLoading}>{module.title}</Text><span className={curriculumMetaClassName}><Badge tone={LEVEL_TONES[module.level]} isSkeleton={isLoading}>{module.levelLabel}</Badge>{module.previewLabel === undefined ? null : <Text size={"xs"} tone={"muted"}>{module.previewLabel}</Text>}</span>{isLoading ? null : <DisclosureIndicator props={{ isOpen }} />}</div>,
            bodyRender: <div className={curriculumBodyClassName}><Text size={"xs"} tone={"muted"}>{module.summary}</Text>{module.description.trim().length === 0 ? null : <Text size={"sm"}>{module.description}</Text>}{module.previews.length === 0 ? null : <SupportingDotList props={{ entries: module.previews.map((preview) => ({ id: preview.id, content: preview.title })) }} />}</div>,
        }
    })

    return (
        <section className={curriculumClassName}>
            <Heading level={3}>{props.props.label}</Heading>
            <SurfaceCard composition="joined">
                <SurfaceAccordionCard
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
            </SurfaceCard>
        </section>
    )
}
