"use client"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useQueryCourseReviewsSwr, useQueryCourseSwr } from "@/hooks"
import { _CourseDetailPage } from "./component"
import type { CourseDetail, CourseModule } from "@/modules/api/graphql/queries/types/course"

/**
 * The connected half: resolve one course and hand the presentational half a settled situation.
 *
 * IT RESOLVES EVERY STRING BEFORE IT CROSSES. The pure half takes already-formatted copy and
 * already-formatted money, which is what lets it be rendered from a fixture in review and from the
 * API in production without knowing the difference.
 *
 * THE TRUST CHIPS ARE SUMMED HERE, from the course's own modules, exactly as the legacy page does.
 * They are therefore facts about this course rather than a second source that could disagree with
 * the curriculum below them.
 */

/** Props the route hands down. */
export interface CourseDetailPageProps {
    /**
     * The short human-facing identifier from the URL - `fullstack-mastery`.
     *
     * It must be the display id: the server resolves a course by that and, despite `CourseRequest`
     * also declaring `id`, answers a primary-key lookup with COURSE_NOT_FOUND_EXCEPTION. A link
     * built from `course.id` therefore reaches the not-found notice.
     */
    displayId: string
}

/** Sum a number across every content of every module. */
const sumContents = (modules: ReadonlyArray<CourseModule>, read: (content: { minutesRead: number, numChallenges: number }) => number): number =>
    modules.reduce((total, module) => total + (module.contents ?? []).reduce((inner, content) => inner + read(content), 0), 0)

/** Order by the course's own declaration order rather than the transport's arrival order. */
const byOrder = <T extends { orderIndex: number }>(rows: ReadonlyArray<T>) =>
    [...rows].sort((left, right) => left.orderIndex - right.orderIndex)

/**
 * Fetch and resolve one course.
 *
 * @param input - {@link CourseDetailPageProps}
 */
export const CourseDetailPage = (input: CourseDetailPageProps) => {
    const t = useTranslations("courses.detail")
    const locale = useLocale()
    const router = useRouter()
    const query = useQueryCourseSwr({ displayId: input.displayId })
    // The rating is a second request on purpose: it is public, shared by every reader and
    // invalidated by a different event than the course itself, so folding it into the course
    // query would make one cache entry answer two questions that change at different times.
    const reviewQuery = useQueryCourseReviewsSwr(query.data?.id)
    const money = new Intl.NumberFormat(locale, { style: "currency", currency: "VND", maximumFractionDigits: 0 })

    const labels = {
        navHome: t("navHome"),
        navCourses: t("navCourses"),
        valuePropsTitle: t("valuePropsTitle"),
        curriculumTitle: t("curriculumTitle"),
        prerequisitesTitle: t("prerequisitesTitle"),
        reviewsTitle: t("reviewsTitle"),
        reviewsEmpty: t("reviewsEmpty"),
        reviewCount: t("reviewCount", { count: reviewQuery.data?.total ?? 0 }),
    }

    if (query.error !== undefined && query.data === undefined) {
        return (
            <_CourseDetailPage
                state="failed"
                props={{ labels, noticeMessage: t("failed"), noticeActionLabel: t("retry") }}
                on={{ retry: () => { void query.mutate() } }}
            />
        )
    }
    if (query.data === undefined) return <_CourseDetailPage state="pending" props={{ labels }} />
    if (query.data === null) return <_CourseDetailPage state="not-found" props={{ labels, noticeMessage: t("notFound") }} />

    const course: CourseDetail = query.data
    const modules = byOrder(course.modules ?? [])
    const phases = byOrder(course.pricingPhases ?? [])
    const openPhase = phases.find((phase) => phase.phase === course.currentPhase)

    // The payable price IS the open phase's price. Falling back to the list price when no phase is
    // open is not a guess: a course with no phase ladder sells at its list price, which is the same
    // number the ladder would have shown.
    const payable = openPhase?.price ?? course.originalPrice
    const hasDiscount = payable < course.originalPrice
    const discountPercent = hasDiscount ? Math.round((1 - payable / course.originalPrice) * 100) : 0

    return (
        <_CourseDetailPage
            state="ready"
            props={{
                labels,
                title: course.title,
                tagline: course.description,
                stats: [
                    { id: "learners", label: t("statLearners", { count: course.enrollmentCount }) },
                    { id: "modules", label: t("statModules", { count: modules.length }) },
                    // Counted from the contents themselves, NOT from `numContents`. The served
                    // schema exposes that field and returns zero for it on this query path, so the
                    // chip claimed no lessons beside a curriculum listing twenty-three modules.
                    // The rows are already selected for the hours chip; counting them is the same
                    // source answering the same question.
                    { id: "contents", label: t("statContents", { count: sumContents(modules, () => 1) }) },
                    { id: "hours", label: t("statHours", { count: Math.round(sumContents(modules, (content) => content.minutesRead) / 60) }) },
                    { id: "challenges", label: t("statChallenges", { count: sumContents(modules, (content) => content.numChallenges) }) },
                ],
                valueProps: byOrder(course.valuePropositions ?? []).map((proposition) => proposition.text),
                // Ordered by the backend and read that way here: a learner who lacks the first
                // requirement cannot judge the second, so arrival order is not good enough.
                // The mean and the total describe the WHOLE population and come from the
                // projection; the nodes are one page. Deriving the mean from the nodes would
                // answer a different question and change on every page turn.
                averageScore: reviewQuery.data?.averageScore,
                reviewTotal: reviewQuery.data?.total,
                reviews: (reviewQuery.data?.nodes ?? []).map((row) => ({
                    id: row.id,
                    author: row.userId,
                    score: row.score,
                    body: row.body ?? undefined,
                })),
                prerequisites: byOrder(course.prerequisites ?? []).map((row, index) => ({
                    id: `prerequisite-${index + 1}`,
                    requirement: row.text,
                })),
                modules: modules.map((module) => {
                    const previews = byOrder(module.previewContents ?? [])
                    return {
                        id: module.id,
                        title: module.title,
                        levelLabel: t(`tier.${module.contentTier}`),
                        previewLabel: previews.length === 0 ? undefined : t("previewCount", { count: previews.length }),
                        // A preview bullet IS the thing the disclosure reveals, and every one of
                        // them is previewable by definition - that is what makes it a preview.
                        lessons: previews.map((preview) => ({ id: preview.id, title: preview.text, isPreview: true })),
                    }
                }),
                rail: {
                    coverUrl: course.coverImageUrl ?? null,
                    title: course.title,
                    price: money.format(payable),
                    originalPrice: hasDiscount ? money.format(course.originalPrice) : undefined,
                    discountLabel: hasDiscount ? `−${discountPercent}%` : undefined,
                    savingsLabel: hasDiscount ? t("savings", { amount: money.format(course.originalPrice - payable) }) : undefined,
                    scarcityLabel: openPhase === undefined || openPhase.slotAvailable <= 0
                        ? undefined
                        : t("scarcity", { count: openPhase.slotAvailable, phase: t(`phase.${openPhase.phase}`) }),
                    phases: phases.map((phase) => ({
                        id: phase.id,
                        name: t(`phase.${phase.phase}`),
                        // The OPEN phase shows that it is open rather than repeating its price -
                        // the price is already the headline above, and a ladder that restates it
                        // reads as two prices.
                        value: phase.phase === course.currentPhase ? t("phaseOpen") : money.format(phase.price),
                        isActive: phase.phase === course.currentPhase,
                    })),
                    // An enrolled viewer continues; everyone else enrols. `isEnrolled` is null for a
                    // guest, which is neither - and a guest is asked to enrol, because that is the
                    // action the page can actually offer them.
                    ctaLabel: course.isEnrolled === true ? t("continue") : t("enroll"),
                    enrolmentLabel: t("enrolled", { count: course.enrollmentCount }),
                },
            }}
            on={{ act: () => { router.push(`/courses/${course.displayId}/learn`) } }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "courses" } as const
