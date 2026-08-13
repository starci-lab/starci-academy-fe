import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Badge } from "@/components/leaves/Badge"
import { Heading } from "@/components/leaves/Heading"
import { Icon } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
import { Tree, defineContract } from "~candidate/components/branches/Tree"
import { CurriculumModuleRow, type CurriculumLesson } from "~candidate/components/leaves/CurriculumModuleRow"
import {
    _CoursePricingRail,
    type CoursePricingRailData,
    type CoursePricingRailState,
} from "~candidate/components/blocks/CoursePricingRail/component"
import { _CourseMobileEnrollBar } from "~candidate/components/blocks/CourseMobileEnrollBar/component"

/**
 * PAGE - `CourseDetailPage`: what the course is, what it promises, what it contains, and one place
 * to buy it.
 *
 * Target path: `src/components/pages/CourseDetailPage/component.tsx`.
 *
 * THE SELECTED DIRECTION, `direction-parity-first`. The narrative owns the flexible measure and the
 * purchase decision keeps a sticky column at the trailing edge, from the top. The hero carries no
 * price and no action, because the rail is the only buy box and two of them would make a reader
 * decide which one is authoritative.
 *
 * THE TRUST CHIPS ARE EVIDENCE, NOT DECORATION. Learners, modules, lessons, hours and challenges are
 * derived from the course's own module tree - the legacy page computes them client-side the same
 * way - so they are facts about this course rather than marketing adjectives.
 *
 * WHAT THIS PRESENTATIONAL HALF IS NOT. It takes one already-settled situation and draws it. In
 * production the regions settle independently: the rail owns the price preview, the curriculum owns
 * the module tree, and neither waits on the other. The single `state` here is the candidate's
 * scenario switch standing in for those connected halves, and the design record names it as the one
 * runtime difference between this candidate and the page Apply will build.
 */

/** One trust chip. */
export type CourseStat = {
    /** Stable identity. */
    readonly id: string
    /** The already-formatted evidence sentence. */
    readonly label: string
}

/** One curriculum module. */
export type CourseModule = {
    /** Stable identity. */
    readonly id: string
    /** The already-resolved module title. */
    readonly title: string
    /** The already-resolved level word. */
    readonly levelLabel?: string
    /** The already-resolved preview count sentence. */
    readonly previewLabel?: string
    /** The lessons revealed on open. */
    readonly lessons?: ReadonlyArray<CurriculumLesson>
}

/** Every already-resolved string the page renders. */
export type CourseDetailLabels = {
    /** Breadcrumb root crumb. */
    readonly navHome: string
    /** Breadcrumb courses crumb. */
    readonly navCourses: string
    /** Promises section title. */
    readonly valuePropsTitle: string
    /** Curriculum section title. */
    readonly curriculumTitle: string
}

/** What the page draws. */
export type CourseDetailPageData = {
    /** Every already-resolved string. */
    readonly labels: CourseDetailLabels
    /** The course title. */
    readonly title?: string
    /** The one sentence qualifying the title. */
    readonly tagline?: string
    /** The trust chips. */
    readonly stats?: ReadonlyArray<CourseStat>
    /** The promises. */
    readonly valueProps?: ReadonlyArray<string>
    /** The curriculum. */
    readonly modules?: ReadonlyArray<CourseModule>
    /** Everything the rail needs. */
    readonly rail?: CoursePricingRailData
    /** The rail's own situation, which settles independently of the course. */
    readonly railState?: CoursePricingRailState
    /** Message for the not-found and failed situations. */
    readonly noticeMessage?: string
    /** Recovery action label for those situations. */
    readonly noticeActionLabel?: string
}

/** What the page reports. */
export type CourseDetailPageActions = {
    /** The single buy action, shared by the rail and the pinned bar. */
    readonly act?: () => void
    /** Recovery from the failed situation. */
    readonly retry?: () => void
}

/** The situations the page can be in. */
export type CourseDetailPageState = "pending" | "ready" | "not-found" | "failed"

/** Props for {@link _CourseDetailPage}. */
export type CourseDetailPageProps = {
    /** The business situation, which picks the tree. */
    readonly state: CourseDetailPageState
    /** What that tree says. */
    readonly props: CourseDetailPageData
    /** What the page reports. */
    readonly on?: CourseDetailPageActions
}

/** How many resting module rows stand in while the curriculum is unknown. */
const RESTING_MODULE_COUNT = 5

/**
 * Draw the course landing.
 *
 * @param input - {@link CourseDetailPageProps}
 */
export const _CourseDetailPage = (input: CourseDetailPageProps) => {
    if (input.state === "not-found" || input.state === "failed") {
        return (
            <EmptyNotice
                props={{
                    icon: "course",
                    message: input.props.noticeMessage ?? "",
                    actionLabel: input.state === "failed" ? input.props.noticeActionLabel : undefined,
                }}
                on={{ act: input.on?.retry }}
            />
        )
    }

    const isLoading = input.state === "pending"
    const stats = input.props.stats ?? []
    const valueProps = input.props.valueProps ?? []
    // A resting module carries no title, level or preview count: those are the values still unknown.
    // It keeps its identity so React can key the run without reordering it on settle.
    const modules: ReadonlyArray<CourseModule> = isLoading
        ? Array.from({ length: RESTING_MODULE_COUNT }, (_unused, index) => ({
            id: `resting-${index + 1}`,
            title: "",
        }))
        : input.props.modules ?? []

    const promiseSection = (
        <Tree
            key="promises"
            contract="course-section"
            render={defineContract("course-section", [
                <Heading key="title" props={{ content: input.props.labels.valuePropsTitle, level: 2 }} />,
                <Tree
                    key="body"
                    contract="course-promise-list"
                    render={defineContract("course-promise-list", valueProps.map((line) => (
                        <Tree
                            key={line}
                            contract="course-promise-row"
                            render={defineContract("course-promise-row", [
                                <Text key="mark" props={{ icon: "complete", content: "", size: "sm", tone: "accent" }} />,
                                <Text key="promise" props={{ content: line, size: "sm" }} isLoading={isLoading} />,
                            ])}
                        />
                    )))}
                />,
            ])}
        />
    )

    const curriculumSection = (
        <Tree
            key="curriculum"
            contract="course-section"
            render={defineContract("course-section", [
                <Heading key="title" props={{ content: input.props.labels.curriculumTitle, level: 2 }} />,
                <Tree
                    key="body"
                    contract="course-module-list"
                    render={defineContract("course-module-list", modules.map((module) => (
                        <CurriculumModuleRow
                            key={module.id}
                            props={{
                                title: module.title,
                                levelLabel: module.levelLabel,
                                previewLabel: module.previewLabel,
                                lessons: module.lessons,
                            }}
                            isLoading={isLoading}
                        />
                    )))}
                />,
            ])}
        />
    )

    const narrative = defineContract("course-narrative-column", [
        <Tree
            key="heading"
            contract="course-hero-heading"
            render={defineContract("course-hero-heading", [
                <Heading key="title" props={{ content: input.props.title, level: 1 }} isLoading={isLoading} />,
                <Text key="tagline" props={{ content: input.props.tagline, size: "sm" }} isLoading={isLoading} />,
            ])}
        />,
        <Tree
            key="evidence"
            contract="course-stat-chip-run"
            render={defineContract("course-stat-chip-run", stats.map((stat) => (
                <Badge key={stat.id} props={{ content: stat.label }} isLoading={isLoading} />
            )))}
        />,
        promiseSection,
        curriculumSection,
    ])

    return (
        <Tree
            contract="course-detail-page"
            render={defineContract("course-detail-page", [
                <Tree
                    key="breadcrumb"
                    contract="course-breadcrumb-row"
                    render={defineContract("course-breadcrumb-row", [
                        <Text key="home" props={{ content: input.props.labels.navHome, size: "xs" }} />,
                        <Icon key="sep" props={{ name: "next", role: "chip" }} />,
                        <Text key="courses" props={{ content: input.props.labels.navCourses, size: "xs" }} />,
                    ])}
                />,
                <Tree
                    key="body"
                    contract="main-then-rail"
                    render={defineContract("main-then-rail", [
                        <Tree key="main" contract="course-narrative-column" render={narrative} />,
                        input.props.rail === undefined ? null : (
                            <_CoursePricingRail
                                key="rail"
                                state={input.props.railState ?? "ready"}
                                props={input.props.rail}
                                on={{ act: input.on?.act }}
                            />
                        ),
                    ])}
                />,
                input.props.rail === undefined ? null : (
                    <_CourseMobileEnrollBar
                        key="action"
                        props={{
                            price: input.props.rail.price,
                            originalPrice: input.props.rail.originalPrice,
                            ctaLabel: input.props.rail.ctaLabel,
                        }}
                        on={{ act: input.on?.act }}
                    />
                ),
            ])}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
