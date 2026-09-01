"use client"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import {
    useQueryCourseReviewsSwr,
    useQueryCourseSwr,
} from "@/hooks"
import { CourseDetailPageBase } from "./component"
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
export const CourseDetailPage = (props: CourseDetailPageProps) => {
    const t = useTranslations("courses.detail")
    const router = useRouter()
    const query = useQueryCourseSwr({ displayId: props.displayId })
    // The rating is a second request on purpose: it is public, shared by every reader and
    // invalidated by a different event than the course itself, so folding it into the course
    // query would make one cache entry answer two questions that change at different times.
    const reviewQuery = useQueryCourseReviewsSwr(query.data?.id)

    const labels = {
        breadcrumbLabel: t("breadcrumbLabel"),
        breadcrumbHome: t("breadcrumbHome"),
        breadcrumbCourses: t("breadcrumbCourses"),
        valuePropsTitle: t("valuePropsTitle"),
        curriculumTitle: t("curriculumTitle"),
        prerequisitesTitle: t("prerequisitesTitle"),
        reviewsTitle: t("reviewsTitle"),
        reviewsEmpty: t("reviewsEmpty"),
        faqTitle: t("faqTitle"),
        faqEmpty: t("faqEmpty"),
        reviewCount: t("reviewCount", { count: reviewQuery.data?.total ?? 0 }),
    }

    if (query.error !== undefined && query.data === undefined) {
        return (
            <CourseDetailPageBase
                pageState="failed" props={{ labels, noticeMessage: t("failed"), noticeActionLabel: t("retry") }}
                on={{ retry: () => { void query.mutate() } }}
                displayId={props.displayId}
            />
        )
    }
    if (query.data === undefined) return <CourseDetailPageBase displayId={props.displayId} pageState="pending" props={{ labels }} />
    if (query.data === null) return <CourseDetailPageBase displayId={props.displayId} pageState="not-found" props={{ labels, noticeMessage: t("notFound") }} />

    const course: CourseDetail = query.data
    const modules = byOrder(course.modules ?? [])
    return (
        <>
            <CourseDetailPageBase
                displayId={props.displayId}
                pageState="ready" props={{
                    labels,
                    title: course.title,
                    tagline: course.description,
                    stats: [
                        {
                            id: "learners",
                            label: t("learnerSignalLabel"),
                            value: t("statLearners", { count: course.enrollmentCount }),
                        },
                        {
                            id: "modules",
                            label: t("moduleSignalLabel"),
                            value: t("statModules", { count: modules.length }),
                        },
                        // Counted from the contents themselves, NOT from `numContents`. The served
                        // schema exposes that field and returns zero for it on this query path, so the
                        // chip claimed no lessons beside a curriculum listing twenty-three modules.
                        // The rows are already selected for the hours chip; counting them is the same
                        // source answering the same question.
                        {
                            id: "hours",
                            label: t("hourSignalLabel"),
                            value: t("statHours", { count: Math.round(sumContents(modules, (content) => content.minutesRead) / 60) }),
                        },
                        {
                            id: "contents",
                            label: t("contentSignalLabel"),
                            value: t("statContents", { count: sumContents(modules, () => 1) }),
                        },
                        {
                            id: "challenges",
                            label: t("challengeSignalLabel"),
                            value: t("statChallenges", { count: sumContents(modules, (content) => content.numChallenges) }),
                        },
                        {
                            id: "rating",
                            label: t("reviewCount", { count: reviewQuery.data?.total ?? 0 }),
                            value: reviewQuery.data?.averageScore?.toFixed(1) ?? "—",
                        },
                    ],
                    valueProps: byOrder(course.valuePropositions ?? []).map((proposition) => proposition.text),
                    faqs: byOrder(course.qnas ?? []).map((faq) => ({
                        id: faq.id,
                        title: faq.question,
                        description: faq.answer,
                    })),
                    // Ordered by the backend and read that way here: a learner who lacks the first
                    // requirement cannot judge the second, so arrival order is not good enough.
                    // The mean and the total describe the WHOLE population and come from the
                    // projection; the nodes are one page. Deriving the mean from the nodes would
                    // answer a different question and change on every page turn.
                    averageScore: reviewQuery.data?.averageScore,
                    reviewTotal: reviewQuery.data?.total,
                    reviews: (reviewQuery.data?.nodes ?? []).map((row) => ({
                        id: row.id,
                        // A UUID is storage identity, not a public learner name. Until the public
                        // author projection is available, use a localized neutral label.
                        author: t("reviewsAnonymous"),
                        score: row.score,
                        body: row.body ?? undefined,
                    })),
                    prerequisites: byOrder(course.prerequisites ?? []).map((row, index) => ({
                        id: `prerequisite-${index + 1}`,
                        requirement: row.text,
                    })),
                    modules: modules.map((module) => ({
                        id: module.id,
                        title: module.title,
                        level: module.contentTier,
                        levelLabel: t(`tier.${module.contentTier}`),
                        previewLabel: (module.previewContents ?? []).length === 0
                            ? undefined
                            : t("previewCount", { count: (module.previewContents ?? []).length }),
                        summary: t("moduleSummary", {
                            count: (module.contents ?? []).length,
                            minutes: (module.contents ?? []).reduce((total, content) => total + content.minutesRead, 0),
                        }),
                        description: module.description,
                        previews: byOrder(module.previewContents ?? []).map((preview) => ({
                            id: preview.id,
                            title: preview.text,
                        })),
                    })),
                }}
                on={{
                    navigateHome: () => { router.push("/") },
                    navigateCourses: () => { router.push("/courses") },
                }}
            />
        </>
    )
}
