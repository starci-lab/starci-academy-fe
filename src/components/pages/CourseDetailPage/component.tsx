import { CONTRACTS } from "@/components/contracts"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Badge } from "@/components/leaves/Badge"
import { Heading } from "@/components/leaves/Heading"
import { Icon } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
import { CurriculumModuleRow, type CurriculumLesson } from "@/components/leaves/CurriculumModuleRow"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import {
    CoursePricingRail,
    type CoursePricingRailData,
    type CoursePricingRailState,
} from "@/components/blocks/courses/CoursePricingRail/component"
import { CourseMobileEnrollBar } from "@/components/blocks/courses/CourseMobileEnrollBar/component"

/**
 * PAGE - `CourseDetailPage`: what the course is, what it promises, what it contains, and one place
 * to buy it.
 *
 * Target path: `src/components/pages/CourseDetailPage/component.tsx`.
 *
 * THE SELECTED DIRECTION, `direction-parity-semantic`. The reading order and the anatomy are the
 * named production render's, unchanged. What this direction adds is that every region now SAYS what
 * it is - the trail is a `nav`, the narrative and its two regions are `section`s, the buy box is an
 * `aside`, the promises are a `ul` of `li`, the curriculum is an `ol` of `li` - and it says so in
 * the registry entry rather than here.
 *
 * NOTHING IN THIS FILE CHOOSES AN ELEMENT. Every node below is a key; the entry behind it names the
 * tag. That is the property being reviewed, so a call site able to override it would defeat the
 * review as surely as one that hand-wrote a `div`.
 *
 * THE HERO CARRIES NO PRICE and no action, because the rail is the only buy box; two of them would
 * make a reader decide which one is authoritative.
 *
 * THE TRUST CHIPS ARE EVIDENCE, NOT DECORATION. Learners, modules, lessons, hours and challenges are
 * derived from the course's own module tree - the legacy page computes them client-side the same
 * way - so they are facts about this course rather than marketing adjectives.
 *
 * WHAT THIS PRESENTATIONAL HALF IS NOT. It takes one already-settled situation and draws it. In
 * production the regions settle independently: the rail owns the price preview, the curriculum owns
 * the module tree, and neither waits on the other. The single `state` here is the candidate's
 * scenario switch standing in for those connected halves.
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

/**
 * How many resting rows each run shows while its values are unknown.
 *
 * Read out of the ENTRIES rather than written here. `restingCount` is the number the contract
 * already states, and a second copy in this file is a number that can drift from it silently - the
 * skeleton would keep claiming five modules after the entry had settled on three.
 */
const RESTING = {
    stats: CONTRACTS["course-stat-chip-run"].children.stat.restingCount,
    promises: CONTRACTS["course-promise-list"].children.promise.restingCount,
    modules: CONTRACTS["course-module-list"].children.module.restingCount,
}

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
                    // Not-found is final: there is no retry that could change the answer, and an
                    // action that cannot help is worse than none. Failed is a request that may yet
                    // succeed, so only that one offers a way out.
                    actionLabel: input.state === "failed" ? input.props.noticeActionLabel : undefined,
                }}
                on={{ act: input.on?.retry }}
            />
        )
    }

    const isLoading = input.state === "pending"
    // A resting row carries no values - those are exactly what is still unknown - but it keeps an
    // identity, so React can key the run without reordering it on settle. A resting module also
    // carries no lessons, so it renders flat: a disclosure that opens onto nothing while loading is
    // a control offering to reveal something it does not have.
    const stats: ReadonlyArray<CourseStat> = isLoading
        ? Array.from({ length: RESTING.stats }, (_unused, index) => ({ id: `resting-${index + 1}`, label: "" }))
        : input.props.stats ?? []
    const valueProps: ReadonlyArray<string> = isLoading
        ? Array.from({ length: RESTING.promises }, () => "")
        : input.props.valueProps ?? []
    const modules: ReadonlyArray<CourseModule> = isLoading
        ? Array.from({ length: RESTING.modules }, (_unused, index) => ({ id: `resting-${index + 1}`, title: "" }))
        : input.props.modules ?? []

    const hero = defineContractComponent("course-hero", {
        heading: defineContractComponent("course-hero-heading", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: input.props.title, level: 1 }} isLoading={isLoading} />
            )),
            tagline: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: input.props.tagline, size: "sm" }} isLoading={isLoading} />
            )),
        }),
        evidence: defineContractComponent("course-stat-chip-run", {
            stat: stats.map((stat) => defineContractComponent("course-stat-chip", {
                chip: defineLeafComponent("badge", {}, () => (
                    <Badge props={{ content: stat.label }} isLoading={isLoading} />
                )),
            })),
        }),
        section: [
            defineContractComponent("course-section", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.labels.valuePropsTitle, level: 2 }} />
                )),
                body: defineContractComponent("course-promise-list", {
                    promise: valueProps.map((line) => defineContractComponent("course-promise-row", {
                        mark: defineLeafComponent("text", { size: "sm" }, () => (
                            <Text props={{ icon: "complete", content: "", size: "sm", tone: "accent" }} />
                        )),
                        promise: defineLeafComponent("text", { size: "sm" }, () => (
                            <Text props={{ content: line, size: "sm" }} isLoading={isLoading} />
                        )),
                    })),
                }),
            }),
            defineContractComponent("course-section", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.labels.curriculumTitle, level: 2 }} />
                )),
                body: defineContractComponent("course-module-list", {
                    module: modules.map((module) => defineContractComponent("course-module-row", {
                        module: defineLeafComponent("curriculum-module-row", {}, () => (
                            <CurriculumModuleRow
                                props={{
                                    title: module.title,
                                    levelLabel: module.levelLabel,
                                    previewLabel: module.previewLabel,
                                    lessons: module.lessons,
                                }}
                                isLoading={isLoading}
                            />
                        )),
                    })),
                }),
            }),
        ],
    })

    return (
        <Tree
            contract="course-detail-page"
            render={defineContractComponent("course-detail-page", {
                breadcrumb: defineContractComponent("course-breadcrumb-row", {
                    crumb: [
                        defineLeafComponent("text", {}, () => (
                            <Text props={{ content: input.props.labels.navHome, size: "xs" }} />
                        )),
                        defineLeafComponent("icon", {}, () => (
                            <Icon props={{ name: "next", role: "chip" }} />
                        )),
                        defineLeafComponent("text", {}, () => (
                            <Text props={{ content: input.props.labels.navCourses, size: "xs" }} />
                        )),
                    ],
                }),
                body: defineContractComponent("main-then-rail", {
                    main: hero,
                    rail: CoursePricingRail({
                        state: input.props.railState ?? "ready",
                        props: input.props.rail ?? { title: input.props.title ?? "", ctaLabel: "" },
                        on: { act: input.on?.act },
                    }),
                }),
                action: input.props.rail === undefined ? undefined : CourseMobileEnrollBar({
                    state: input.props.railState ?? "ready",
                    props: {
                        price: input.props.rail.price,
                        originalPrice: input.props.rail.originalPrice,
                        ctaLabel: input.props.rail.ctaLabel,
                    },
                    on: { act: input.on?.act },
                }),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
