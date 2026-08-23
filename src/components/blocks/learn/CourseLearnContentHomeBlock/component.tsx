import { type ReactNode } from "react"
import { Tree } from "@/components/branches/Tree"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { CourseContentMap } from "@/components/blocks/learn/CourseContentMap"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { StatusMetadataLine, type StatusMetadataLineStatus } from "@/components/composites/StatusMetadataLine"
import { CONTRACTS } from "@/components/contracts"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import { RailDivider } from "@/components/leaves/RailDivider"

/** One lesson destination inside the module currently carrying the resume target. */
export type CourseContentHomeLesson = {
    readonly id: string
    readonly moduleId: string
    readonly title: string
    readonly fact?: string
    readonly isCurrent?: boolean
}

/** One current module and the ordered lesson path shown on the overview. */
export type CourseContentHomeModule = {
    readonly title: string
    readonly lessons: ReadonlyArray<CourseContentHomeLesson>
}

/** Resolved course identity, progress evidence and recovery copy for the pure overview page. */
export type CourseLearnContentHomeData = {
    readonly title: string
    readonly description?: string
    readonly breadcrumbLabel: string
    readonly trail: ReadonlyArray<BreadcrumbStep>
    readonly metaFacts: ReadonlyArray<string>
    readonly metaStatus?: StatusMetadataLineStatus
    readonly gateMessages: ReadonlyArray<string>
    readonly resumeEyebrow: string
    readonly resumeTarget: string
    readonly resumeAction?: string
    readonly progressLabel: string
    readonly completionPercent?: number
    readonly progressFact: string
    readonly currentModule?: CourseContentHomeModule
    readonly emptyMessage: string
    readonly failedMessage: string
    readonly retryLabel: string
}

/** Navigation and recovery events reported by the pure content-home overview. */
export type CourseLearnContentHomeActions = {
    readonly course?: () => void
    readonly resume?: () => void
    readonly lesson?: (moduleId: string, lessonId: string) => void
    readonly retry?: () => void
}

/** Complete source-backed states for the course content-home overview. */
export type CourseLearnContentHomeBlockState = "pending" | "ready" | "empty" | "failed" | "partial"
/** Presentation contract for the content-home overview and its route frame. */
export type CourseLearnContentHomeProps = {
    readonly blockState: CourseLearnContentHomeBlockState
    readonly props: CourseLearnContentHomeData
    readonly on?: CourseLearnContentHomeActions
    readonly displayId?: string
    readonly currentLessonId?: string
    readonly resizeLabel?: string
}
const CONTENT_HOME_OVERVIEW_CONTRACT = "course-content-home-overview-page" as const

/** Draw course identity, continuation evidence and the current module path without owning transport. */
export const CourseLearnContentHomeBlockBase = (input: CourseLearnContentHomeProps) => {
    const isLoading = input.blockState === "pending"
    const lessons: ReadonlyArray<CourseContentHomeLesson> = isLoading && input.props.currentModule === undefined
        ? Array.from(
            { length: CONTRACTS["course-content-lesson-list"].children.lesson.restingCount },
            (_unused, index) => ({ id: `resting-${index + 1}`, moduleId: "", title: "" }),
        )
        : input.props.currentModule?.lessons ?? []
    const notice = input.blockState === "failed" || input.blockState === "empty"
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    icon: "course",
                    message: input.blockState === "failed" ? input.props.failedMessage : input.props.emptyMessage,
                    actionLabel: input.blockState === "failed" ? input.props.retryLabel : undefined,
                }}
                on={{ act: input.on?.retry }}
            />
        ))
        : undefined

    const overview = (
        <Tree contract={CONTENT_HOME_OVERVIEW_CONTRACT} render={defineContractComponent(CONTENT_HOME_OVERVIEW_CONTRACT, {
            identity: defineContractComponent("course-content-identity-stack", {
                trail: defineLeafComponent("breadcrumbs", {}, () => (
                    <Breadcrumbs
                        props={{ steps: input.props.trail, label: input.props.breadcrumbLabel }}
                        on={isLoading ? undefined : { course: input.on?.course }}
                        isLoading={isLoading}
                    />
                )),
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.title, level: 1 }} isLoading={isLoading} />
                )),
                description: input.props.description === undefined ? undefined : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: input.props.description, size: "sm", tone: "muted" }} isLoading={isLoading} />
                )),
                meta: input.props.metaFacts.length === 0 && input.props.metaStatus === undefined
                    ? undefined
                    : defineContractProjection("status-metadata-line", () => (
                        <StatusMetadataLine
                            props={{ facts: input.props.metaFacts, status: input.props.metaStatus }}
                            isLoading={isLoading}
                        />
                    )),
            }),
            gates: input.props.gateMessages.length === 0 ? undefined : defineContractComponent("course-content-gate-run", {
                gate: input.props.gateMessages.map((message) => defineLeafComponent("text", { size: "sm" }, () => (
                    <Text props={{ content: message, size: "sm" }} />
                ))),
            }),
            resume: defineContractComponent("course-content-resume-progress", {
                decision: defineContractComponent("course-content-resume-decision-row", {
                    copy: defineContractComponent("course-content-resume-copy", {
                        eyebrow: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                            <Text props={{ content: input.props.resumeEyebrow, size: "xs", tone: "muted" }} isLoading={isLoading} />
                        )),
                        target: defineLeafComponent("heading", {}, () => (
                            <Heading props={{ content: input.props.resumeTarget, level: 2 }} isLoading={isLoading} />
                        )),
                    }),
                    action: input.props.resumeAction === undefined ? undefined : defineLeafComponent("button", {}, () => (
                        <Button
                            props={{ label: input.props.resumeAction ?? "", variant: "primary", size: "md", icon: "next", iconPlacement: "trailing" }}
                            on={isLoading ? undefined : { press: input.on?.resume }}
                            isLoading={isLoading}
                        />
                    )),
                }),
                progress: defineLeafComponent("progress", {}, () => (
                    <Progress props={{ value: input.props.completionPercent, label: input.props.progressLabel }} isLoading={isLoading} />
                )),
                fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: input.props.progressFact, size: "sm", tone: "muted" }} isLoading={isLoading} />
                )),
            }),
            module: input.blockState === "failed" || lessons.length === 0 ? undefined : defineContractProjection("course-content-lesson-list", () => (
                <SurfaceCard
                    props={{ label: input.props.currentModule?.title ?? "" }}
                    contract="course-content-lesson-list"
                    render={defineContractComponent("course-content-lesson-list", {
                        lesson: lessons.map((lesson) => defineContractComponent("course-content-lesson-row", {
                            lesson: defineLeafComponent("nav-link", { kind: "section" }, () => (
                                <NavLink
                                    props={{ label: lesson.title, kind: "section", isCurrent: lesson.isCurrent }}
                                    on={isLoading ? undefined : { press: () => input.on?.lesson?.(lesson.moduleId, lesson.id) }}
                                    isLoading={isLoading}
                                />
                            )),
                            fact: lesson.fact === undefined ? undefined : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                                <Text props={{ content: lesson.fact ?? "", size: "xs", tone: "muted" }} />
                            )),
                        })),
                    })}
                    isLoading={isLoading}
                />
            )),
            notice,
        })} />
    )
    return input.displayId === undefined || input.resizeLabel === undefined ? overview : (
        <CourseLearnContentHomeFrameBase displayId={input.displayId} currentLessonId={input.currentLessonId} resizeLabel={input.resizeLabel} overview={overview} />
    )
}

/** Pure route frame that places the overview beside its learn-context map. */
type CourseLearnContentHomeFrameProps = {
    readonly displayId: string
    readonly currentLessonId?: string
    readonly resizeLabel: string
    readonly overview: ReactNode
}

/** Draws the route-owned context rail and projects the overview into its legal slot. */
export const CourseLearnContentHomeFrameBase = (input: CourseLearnContentHomeFrameProps) => (
    <Tree contract="course-content-home-frame" render={defineContractComponent("course-content-home-frame", {
        map: defineContractProjection("learn-route-context-rail", () => (
            <CourseContentMap displayId={input.displayId} currentLessonId={input.currentLessonId} />
        )),
        divider: defineLeafComponent("rail-divider", {}, () => (
            <RailDivider props={{ label: input.resizeLabel, storageKey: "starci.learn.contentMap.width", defaultWidth: 320, minWidth: 256, maxWidth: 560 }} />
        )),
        overview: defineContractProjection("course-content-home-overview-page", () => input.overview),
    })} />
)

/** Purity and ownership metadata for the course content-home overview twin. */
export const meta = { world: "pure", domain: "learn" } as const

