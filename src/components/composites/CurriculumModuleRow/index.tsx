"use client"

import { useState } from "react"
import { DisclosureBranch } from "@/components/branches/DisclosureBranch"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { Tree } from "@/components/branches/Tree"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Text } from "@/components/leaves/Text"
import {
    defineContractComponent,
    defineLeafComponent,
    type CompositeProps,
} from "@/components/contracts/props"

/** One lesson inside a module. */
export type CurriculumLesson = {
    /** Stable identity within the module. */
    readonly id: string
    /** The already-resolved lesson title. */
    readonly title: string
    /** Whether this lesson is previewable before enrolment. */
    readonly isPreview?: boolean
}

/** Stable module difficulty identity; labels stay localized at the connected owner. */
export type CurriculumLevel = "foundation" | "intermediate" | "advanced"

/** Resolved module identity, facts and optional lesson disclosure. */
export type CurriculumModuleRowData = {
    /** The already-resolved module title. */
    readonly title: string
    /** Stable difficulty identity used to select a semantic badge tone. */
    readonly level?: CurriculumLevel
    /** The already-resolved level word shown beside the title. */
    readonly levelLabel?: string
    /** The already-resolved preview count sentence. */
    readonly previewLabel?: string
    /** The lessons revealed on open. An empty run makes the row non-disclosing. */
    readonly lessons?: ReadonlyArray<CurriculumLesson>
    /** Whether this module starts open. */
    readonly isOpen?: boolean
}

/** Navigation emitted by a flat module row or one lesson inside its disclosure. */
export type CurriculumModuleRowActions = {
    readonly press?: () => void
    readonly pressLesson?: (id: string) => void
}

/** Props for {@link CurriculumModuleRow}. */
export type CurriculumModuleRowProps = CompositeProps<CurriculumModuleRowData, CurriculumModuleRowActions>

/** Difficulty is the meaning; the Badge leaf remains the sole owner of palette tokens. */
const LEVEL_TONES = {
    foundation: "success",
    intermediate: "warning",
    advanced: "danger",
} as const

/** Draw one module through named summary, metadata and lesson contracts. */
export const CurriculumModuleRow = (input: CurriculumModuleRowProps) => {
    const [isOpen, setIsOpen] = useState(input.props.isOpen ?? false)
    const lessons = input.props.lessons ?? []
    const isLoading = input.isLoading ?? false
    const canDisclose = lessons.length > 0 && !isLoading
    const metadata = input.props.levelLabel === undefined && input.props.previewLabel === undefined
        ? undefined
        : defineContractComponent("curriculum-module-meta-row", {
            level: input.props.levelLabel === undefined
                ? undefined
                : defineLeafComponent("badge", {}, () => (
                    <Badge
                        props={{
                            content: input.props.levelLabel,
                            tone: input.props.level === undefined ? "neutral" : LEVEL_TONES[input.props.level],
                        }}
                        isLoading={isLoading}
                    />
                )),
            preview: input.props.previewLabel === undefined
                ? undefined
                : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: input.props.previewLabel, size: "xs", tone: "muted" }} />
                )),
        })
    const summary = defineContractComponent("curriculum-module-summary-row", {
        title: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
            <Text
                props={{ content: input.props.title, size: "sm", weight: "medium" }}
                isLoading={isLoading}
            />
        )),
        meta: metadata,
        indicator: canDisclose
            ? defineLeafComponent("disclosure-indicator", {}, () => (
                <DisclosureIndicator props={{ isOpen }} />
            ))
            : undefined,
    })

    if (!canDisclose) {
        return input.on?.press === undefined ? (
            <Tree contract="curriculum-module-summary-row" render={summary} />
        ) : (
            <PressableSurface
                contract="curriculum-module-summary-row"
                render={summary}
                label={input.props.title}
                press={input.on.press}
                disabled={isLoading}
            />
        )
    }

    return (
        <DisclosureBranch
            isOpen={isOpen}
            summaryContract="curriculum-module-summary-row"
            summaryRender={summary}
            bodyContract="curriculum-lesson-list"
            bodyRender={defineContractComponent("curriculum-lesson-list", {
                lesson: lessons.map((lesson) => defineContractComponent("curriculum-lesson-row", {
                    title: input.on?.pressLesson === undefined
                        ? defineLeafComponent("text", { size: "sm" }, () => (
                            <Text props={{ content: lesson.title, size: "sm" }} />
                        ))
                        : defineLeafComponent("button", {}, () => (
                            <Button
                                props={{ label: lesson.title, size: "sm", variant: "ghost" }}
                                on={{ press: () => input.on?.pressLesson?.(lesson.id) }}
                            />
                        )),
                })),
            })}
            onOpenChange={setIsOpen}
        />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
