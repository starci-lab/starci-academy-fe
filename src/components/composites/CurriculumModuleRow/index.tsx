"use client"
import { useState } from "react"
import { SurfaceAccordionCard, Button } from "@starci/grammar/common"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { Badge } from "@starci/grammar/common"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Text } from "@starci/grammar/common"

/** One lesson inside a module. */
export type CurriculumLesson = { readonly id: string; readonly title: string; readonly isPreview?: boolean }
/** Stable module difficulty identity. */
export type CurriculumLevel = "foundation" | "intermediate" | "advanced"
/** Resolved module identity, facts and lessons. */
export type CurriculumModuleRowData = { readonly title: string; readonly level?: CurriculumLevel; readonly levelLabel?: string; readonly previewLabel?: string; readonly lessons?: ReadonlyArray<CurriculumLesson>; readonly isOpen?: boolean }
/** Navigation actions emitted by the module. */
export type CurriculumModuleRowActions = { readonly press?: () => void; readonly pressLesson?: (id: string) => void }
/** Public inputs for a curriculum module row. */
export type CurriculumModuleRowProps = { readonly props: CurriculumModuleRowData; readonly on?: CurriculumModuleRowActions; readonly isLoading?: boolean }
const LEVEL_TONES = { foundation: "success", intermediate: "warning", advanced: "danger" } as const

/** Draw one module summary and its optional lesson disclosure. */
export const CurriculumModuleRow = (props: CurriculumModuleRowProps) => {
    const [isOpen, setIsOpen] = useState(props.props.isOpen ?? false)
    const lessons = props.props.lessons ?? []
    const loading = props.isLoading === true
    const summary = <><Text size={"sm"} weight={"medium"} isSkeleton={loading}>{props.props.title}</Text>{props.props.levelLabel === undefined ? null : <Badge tone={props.props.level === undefined ? "neutral" : LEVEL_TONES[props.props.level]} isSkeleton={loading}>{props.props.levelLabel}</Badge>}{props.props.previewLabel === undefined ? null : <Text size={"xs"} tone={"muted"}>{props.props.previewLabel}</Text>}{lessons.length === 0 || loading ? null : <DisclosureIndicator props={{ isOpen }} />}</>
    if (lessons.length === 0 || loading) return props.on?.press === undefined ? <div>{summary}</div> : <PressableSurface label={props.props.title} press={props.on.press} disabled={loading}>{summary}</PressableSurface>
    return <SurfaceAccordionCard isOpen={isOpen} renderSummary={(value) => <>{value}</>} summaryRender={summary} renderBody={(value) => <>{value}</>} bodyRender={<ol>{lessons.map((lesson) => <li key={lesson.id}>{props.on?.pressLesson === undefined ? <Text size={"sm"}>{lesson.title}</Text> : <Button variant="ghost" size="sm" onPress={() => props.on?.pressLesson?.(lesson.id)}>{lesson.title}</Button>}</li>)}</ol>} onOpenChange={setIsOpen} />
}
