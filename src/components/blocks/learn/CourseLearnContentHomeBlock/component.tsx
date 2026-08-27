import type { ReactNode } from "react"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { StatusMetadataLine, type StatusMetadataLineStatus } from "@/components/composites/StatusMetadataLine"
import { CourseContentMap } from "@/components/blocks/learn/CourseContentMap"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import { RailDivider } from "@/components/leaves/RailDivider"

/** One lesson destination inside the current module. */
export type CourseContentHomeLesson = { readonly id: string; readonly moduleId: string; readonly title: string; readonly fact?: string; readonly isCurrent?: boolean }
/** One current module and its ordered lesson path. */
export type CourseContentHomeModule = { readonly title: string; readonly lessons: ReadonlyArray<CourseContentHomeLesson> }
/** Resolved course identity, progress evidence and recovery copy. */
export type CourseLearnContentHomeData = { readonly title: string; readonly description?: string; readonly breadcrumbLabel: string; readonly trail: ReadonlyArray<BreadcrumbStep>; readonly metaFacts: ReadonlyArray<string>; readonly metaStatus?: StatusMetadataLineStatus; readonly gateMessages: ReadonlyArray<string>; readonly resumeEyebrow: string; readonly resumeTarget: string; readonly resumeAction?: string; readonly progressLabel: string; readonly completionPercent?: number; readonly progressFact: string; readonly currentModule?: CourseContentHomeModule; readonly emptyMessage: string; readonly failedMessage: string; readonly retryLabel: string }
/** Navigation and recovery events reported by the overview. */
export type CourseLearnContentHomeActions = { readonly course?: () => void; readonly resume?: () => void; readonly lesson?: (moduleId: string, lessonId: string) => void; readonly retry?: () => void }
/** Complete source-backed state and props for the overview. */
export type CourseLearnContentHomeProps = { readonly blockState: "pending" | "ready" | "empty" | "failed" | "partial"; readonly props: CourseLearnContentHomeData; readonly on?: CourseLearnContentHomeActions; readonly displayId?: string; readonly currentLessonId?: string; readonly resizeLabel?: string }

/** Draw course identity, continuation evidence and the current module path. */
export const CourseLearnContentHomeBlockView = (props: CourseLearnContentHomeProps) => {
    const loading = props.blockState === "pending"
    const lessons: ReadonlyArray<CourseContentHomeLesson> = loading && props.props.currentModule === undefined ? Array.from({ length: 10 }, (_unused, index) => ({ id: `resting-${index + 1}`, moduleId: "", title: "" })) : props.props.currentModule?.lessons ?? []
    const notice = props.blockState === "failed" || props.blockState === "empty"
    const overview = <main aria-label={props.props.title}>
        <header><Breadcrumbs props={{ steps: props.props.trail, label: props.props.breadcrumbLabel }} on={loading ? undefined : { course: props.on?.course }} isLoading={loading} /><Heading props={{ content: props.props.title, level: 1 }} isLoading={loading} />{props.props.description === undefined ? null : <Text props={{ content: props.props.description, size: "sm", tone: "muted" }} isLoading={loading} />}{props.props.metaFacts.length === 0 && props.props.metaStatus === undefined ? null : <StatusMetadataLine props={{ facts: props.props.metaFacts, status: props.props.metaStatus }} isLoading={loading} />}</header>
        {props.props.gateMessages.length === 0 ? null : <section aria-label="Requirements">{props.props.gateMessages.map((message) => <Text key={message} props={{ content: message, size: "sm" }} />)}</section>}
        <section aria-label={props.props.resumeTarget}><Text props={{ content: props.props.resumeEyebrow, size: "xs", tone: "muted" }} isLoading={loading} /><Heading props={{ content: props.props.resumeTarget, level: 2 }} isLoading={loading} />{props.props.resumeAction === undefined ? null : <Button props={{ label: props.props.resumeAction, variant: "primary", size: "md", icon: "next", iconPlacement: "trailing" }} on={loading ? undefined : { press: props.on?.resume }} isLoading={loading} />}<Progress props={{ value: props.props.completionPercent, label: props.props.progressLabel }} isLoading={loading} /><Text props={{ content: props.props.progressFact, size: "sm", tone: "muted" }} isLoading={loading} /></section>
        {notice ? <EmptyNotice props={{ icon: "course", message: props.blockState === "failed" ? props.props.failedMessage : props.props.emptyMessage, actionLabel: props.blockState === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.on?.retry }} /> : lessons.length === 0 ? null : <SurfaceCard props={{ label: props.props.currentModule?.title ?? "" }} isLoading={loading}><ul aria-label={props.props.currentModule?.title}>{lessons.map((lesson) => <li key={lesson.id}><NavLink props={{ label: lesson.title, kind: "section", isCurrent: lesson.isCurrent }} on={loading ? undefined : { press: () => props.on?.lesson?.(lesson.moduleId, lesson.id) }} isLoading={loading} />{lesson.fact === undefined ? null : <Text props={{ content: lesson.fact, size: "xs", tone: "muted" }} />}</li>)}</ul></SurfaceCard>}
    </main>
    return props.displayId === undefined || props.resizeLabel === undefined ? overview : <CourseLearnContentHomeFrameView displayId={props.displayId} currentLessonId={props.currentLessonId} resizeLabel={props.resizeLabel} overview={overview} />
}

type CourseLearnContentHomeFrameProps = { readonly displayId: string; readonly currentLessonId?: string; readonly resizeLabel: string; readonly overview: ReactNode }
/** Place the overview beside the learn-context map. */
export const CourseLearnContentHomeFrameView = (props: CourseLearnContentHomeFrameProps) => <div><CourseContentMap displayId={props.displayId} currentLessonId={props.currentLessonId} /><RailDivider props={{ label: props.resizeLabel, storageKey: "starci.learn.contentMap.width", defaultWidth: 320, minWidth: 256, maxWidth: 560 }} />{props.overview}</div>
