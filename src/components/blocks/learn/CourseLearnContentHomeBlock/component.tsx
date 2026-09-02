import type { ReactNode } from "react"
import { SurfaceCard } from "@starci/grammar/common"
import { EmptyNotice } from "@starci/grammar/common"
import { StatusMetadataLine, type StatusMetadataLineStatus } from "@/components/composites/StatusMetadataLine"
import { CourseContentMap } from "@/components/blocks/learn/CourseContentMap"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Icon } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import { Heading } from "@starci/grammar/common"
import { Progress } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { RailDivider } from "@/components/leaves/RailDivider"
import { TextAction } from "@starci/grammar/common"


/** One lesson destination inside the current module. */
/**
 * One lesson in the current module.
 *
 * `href` IS THE LESSON'S OWN PAGE when the owner has resolved it. A lesson is a place, so with a
 * route it is drawn as an anchor and keeps middle-click, copy-link and the status bar; a resting
 * row has no place yet and stays a press. Locale ownership stays with the connected caller.
 */
export type CourseContentHomeLesson = { readonly id: string; readonly moduleId: string; readonly title: string; readonly fact?: string; readonly isCurrent?: boolean; readonly href?: string }
/** One current module and its ordered lesson path. */
export type CourseContentHomeModule = { readonly title: string; readonly lessons: ReadonlyArray<CourseContentHomeLesson> }
/** Resolved course identity, progress evidence and recovery copy. */
export type CourseLearnContentHomeData = { readonly title: string; readonly description?: string; readonly breadcrumbLabel: string; readonly trail: ReadonlyArray<BreadcrumbStep>; readonly metaFacts: ReadonlyArray<string>; readonly metaStatus?: StatusMetadataLineStatus; readonly gateMessages: ReadonlyArray<string>; readonly resumeEyebrow: string; readonly resumeTarget: string; readonly resumeAction?: string; readonly progressLabel: string; readonly completionPercent?: number; readonly progressFact: string; readonly currentModule?: CourseContentHomeModule; readonly emptyMessage: string; readonly failedMessage: string; readonly retryLabel: string }
/** Navigation and recovery events reported by the overview. */
export type CourseLearnContentHomeActions = { readonly course?: () => void; readonly resume?: () => void; readonly lesson?: (moduleId: string, lessonId: string) => void; readonly retry?: () => void }
/** Complete source-backed state and props for the overview. */
export type CourseLearnContentHomeProps = { readonly blockState: "pending" | "ready" | "empty" | "failed" | "partial"; readonly props: CourseLearnContentHomeData; readonly on?: CourseLearnContentHomeActions; readonly displayId?: string; readonly currentLessonId?: string; readonly resizeLabel?: string }
/** Public props consumed by the course content home block presentation. */
export type CourseLearnContentHomeBlockProps = CourseLearnContentHomeProps

/** Draw course identity, continuation evidence and the current module path. */
export const CourseLearnContentHomeBlockBase = (props: CourseLearnContentHomeBlockProps) => {
    const loading = props.blockState === "pending"
    const lessons: ReadonlyArray<CourseContentHomeLesson> = loading && props.props.currentModule === undefined ? Array.from({ length: 10 }, (_unused, index) => ({ id: `resting-${index + 1}`, moduleId: "", title: "" })) : props.props.currentModule?.lessons ?? []
    const notice = props.blockState === "failed" || props.blockState === "empty"
    const overview = <main aria-label={props.props.title}>
        <header><Breadcrumbs props={{ steps: props.props.trail, label: props.props.breadcrumbLabel }} on={loading ? undefined : { course: props.on?.course }} isLoading={loading} /><Heading level={1} isSkeleton={loading}>{props.props.title}</Heading>{props.props.description === undefined ? null : <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.description}</Text>}{props.props.metaFacts.length === 0 && props.props.metaStatus === undefined ? null : <StatusMetadataLine props={{ facts: props.props.metaFacts, status: props.props.metaStatus }} isLoading={loading} />}</header>
        {props.props.gateMessages.length === 0 ? null : <section aria-label="Requirements">{props.props.gateMessages.map((message) => <Text key={message} size={"sm"}>{message}</Text>)}</section>}
        <section aria-label={props.props.resumeTarget}><Text size={"xs"} tone={"muted"} isSkeleton={loading}>{props.props.resumeEyebrow}</Text><Heading level={2} isSkeleton={loading}>{props.props.resumeTarget}</Heading>{props.props.resumeAction === undefined ? null : <Button variant={"primary"} size={"md"} isSkeleton={loading} onPress={(loading ? undefined : { press: props.on?.resume })?.press} endContent={<Icon source={iconSourceFor("next", "chip")} usage="chip" />}>{props.props.resumeAction}</Button>}<Progress label={props.props.progressLabel} value={props.props.completionPercent} isSkeleton={loading} /><Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.progressFact}</Text></section>
        {notice ? <EmptyNotice message={props.blockState === "failed" ? props.props.failedMessage : props.props.emptyMessage} actionLabel={props.blockState === "failed" ? props.props.retryLabel : undefined} iconSource={iconSourceFor("course", "leading")} onAction={({ act: props.on?.retry })?.act} /> : lessons.length === 0 ? null : <SurfaceCard label={props.props.currentModule?.title ?? ""} composition="joined" state={loading ? "pending" : "neutral"}><ul aria-label={props.props.currentModule?.title}>{lessons.map((lesson) => <li key={lesson.id}>{loading || lesson.href === undefined ? <TextAction appearance={"section"} isCurrent={lesson.isCurrent} isSkeleton={loading} onPress={(loading ? undefined : { press: () => props.on?.lesson?.(lesson.moduleId, lesson.id) })?.press}>{lesson.title}</TextAction> : <TextAction appearance={"section"} isCurrent={lesson.isCurrent} href={lesson.href} onFollow={() => props.on?.lesson?.(lesson.moduleId, lesson.id)}>{lesson.title}</TextAction>}{lesson.fact === undefined ? null : <Text size={"xs"} tone={"muted"}>{lesson.fact}</Text>}</li>)}</ul></SurfaceCard>}
    </main>
    return props.displayId === undefined || props.resizeLabel === undefined ? overview : <CourseLearnContentHomeFrame displayId={props.displayId} currentLessonId={props.currentLessonId} resizeLabel={props.resizeLabel} overview={overview} />
}

type CourseLearnContentHomeFrameProps = { readonly displayId: string; readonly currentLessonId?: string; readonly resizeLabel: string; readonly overview: ReactNode }
/** Place the overview beside the learn-context map. */
const CourseLearnContentHomeFrame = (props: CourseLearnContentHomeFrameProps) => <div><CourseContentMap displayId={props.displayId} currentLessonId={props.currentLessonId} /><RailDivider props={{ label: props.resizeLabel, storageKey: "starci.learn.contentMap.width", defaultWidth: 320, minWidth: 256, maxWidth: 560 }} />{props.overview}</div>
