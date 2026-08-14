"use client"

import { useMemo } from "react"
import { useLocale } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryMeSwr } from "@/hooks/swr/useQueryMeSwr"
import { useQueryCourseLeaderboardSwr } from "@/hooks/swr/useQueryCourseLeaderboardSwr"
import type { CourseLeaderboardEntry } from "@/modules/api/graphql/queries/query-course-leaderboard"
import {
    _CourseLeaderboardPage,
    type CourseLeaderboardCategory,
    type CourseLeaderboardPageData,
} from "./component"

interface CourseLeaderboardPageProps { readonly displayId: string }

const CATEGORIES: ReadonlyArray<CourseLeaderboardCategory> = ["total", "challenge", "reading", "milestone"]

const valueOf = (entry: Pick<CourseLeaderboardEntry, "totalXp" | "totalScore" | "lessonsRead" | "milestoneProgress">, category: CourseLeaderboardCategory) => {
    if (category === "challenge") return entry.totalScore
    if (category === "reading") return entry.lessonsRead * 3
    if (category === "milestone") return entry.milestoneProgress * 10
    return entry.totalXp
}

const COPY = {
    en: {
        title: "Course leaderboard", course: "Course", category: "Ranking category", total: "Total XP",
        challenge: "Challenges", reading: "Reading", milestone: "Milestones", you: "You", anonymous: "Learner",
        rank: (rank: number) => `Rank #${rank}`, points: (points: number) => `${points} XP`,
        unranked: "Not ranked yet", enroll: "Enroll and learn to enter this course ranking.",
        climb: "Continue learning", list: "Course standings", updated: (value: string) => `Updated ${value}`,
        empty: "No learners are ranked in this course yet.", failed: "Could not load the course leaderboard.", retry: "Try again",
        hidden: (count: number) => `${count} learners between`,
    },
    vi: {
        title: "Bảng xếp hạng khóa học", course: "Khóa học", category: "Hạng mục xếp hạng", total: "Tổng XP", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        challenge: "Thử thách", reading: "Đọc bài", milestone: "Cột mốc", you: "Bạn", anonymous: "Học viên", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        rank: (rank: number) => `Hạng #${rank}`, points: (points: number) => `${points} XP`, // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        unranked: "Chưa có thứ hạng", enroll: "Tham gia và học để vào bảng xếp hạng khóa học.", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        climb: "Tiếp tục học", list: "Thứ hạng khóa học", updated: (value: string) => `Cập nhật ${value}`, // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        empty: "Khóa học chưa có học viên nào được xếp hạng.", failed: "Không tải được bảng xếp hạng khóa học.", retry: "Thử lại", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        hidden: (count: number) => `${count} học viên ở giữa`, // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
    },
} as const

/** Connected course-level leaderboard backed only by courseLeaderboard. */
export const CourseLeaderboardPage = ({ displayId }: CourseLeaderboardPageProps) => {
    const locale = useLocale() === "vi" ? "vi" : "en"
    const copy = COPY[locale]
    const router = useRouter()
    const search = useSearchParams()
    const requested = search.get("category")
    const category: CourseLeaderboardCategory = CATEGORIES.some((item) => item === requested)
        ? requested as CourseLeaderboardCategory
        : "total"
    const course = useQueryCourseSwr({ displayId })
    const me = useQueryMeSwr()
    const leaderboard = useQueryCourseLeaderboardSwr(course.data?.id)
    const entries = useMemo(
        () => [...(leaderboard.data?.entries ?? [])].sort((first, second) => valueOf(second, category) - valueOf(first, category)),
        [category, leaderboard.data?.entries],
    )
    const ranked = entries.map((entry, index) => ({ entry, rank: index + 1 }))
    const mine = ranked.find(({ entry }) => entry.userId === me.data?.id)
    const viewerRank = category === "total" ? leaderboard.data?.myRank?.rank : mine?.rank
    const viewerPoints = leaderboard.data?.myRank === null || leaderboard.data?.myRank === undefined
        ? undefined
        : valueOf(leaderboard.data.myRank, category)
    const podium = ranked.slice(0, 3).map(({ entry, rank }) => ({
        rank,
        username: entry.username,
        avatar: entry.avatar,
        rankLabel: copy.rank(rank),
        pointsLabel: copy.points(valueOf(entry, category)),
        isMe: entry.userId === me.data?.id,
    }))
    const rows = ranked.slice(3).map(({ entry, rank }) => ({
        id: entry.enrollmentId,
        rank,
        rankLabel: copy.rank(rank),
        name: entry.userId === me.data?.id ? `${entry.username ?? copy.anonymous} · ${copy.you}` : entry.username ?? copy.anonymous,
        avatar: entry.avatar,
        points: copy.points(valueOf(entry, category)),
        isMe: entry.userId === me.data?.id,
    }))
    const viewerVisible = ranked.some(({ entry }) => entry.userId === me.data?.id)
    const hidden = viewerRank === undefined ? 0 : Math.max(0, viewerRank - ranked.length - 1)
    const selfRow = viewerVisible || viewerRank === undefined ? undefined : {
        id: "viewer",
        rank: viewerRank,
        rankLabel: copy.rank(viewerRank),
        name: `${me.data?.username ?? copy.anonymous} · ${copy.you}`,
        avatar: me.data?.avatar ?? null,
        points: viewerPoints === undefined ? undefined : copy.points(viewerPoints),
        isMe: true,
    }
    const data: CourseLeaderboardPageData = {
        title: copy.title,
        trail: [{ id: "course", label: course.data?.title ?? copy.course }, { id: "leaderboard", label: copy.title }],
        categoryLabel: copy.category,
        selectedCategory: category,
        categories: CATEGORIES.map((id) => ({ id, label: copy[id] })),
        board: {
            standing: {
                rank: viewerRank,
                rankLabel: viewerRank === undefined ? undefined : copy.rank(viewerRank),
                title: viewerRank === undefined ? copy.unranked : copy.rank(viewerRank),
                subtitle: viewerPoints === undefined ? copy.enroll : copy.points(viewerPoints),
                fact: course.data?.isEnrolled === false ? copy.enroll : undefined,
            },
            podium,
            rows,
            selfRow,
            ellipsisLabel: hidden > 0 ? copy.hidden(hidden) : undefined,
        },
        listLabel: copy.list,
        meLabel: copy.you,
        anonymousLabel: copy.anonymous,
        climbLabel: copy.climb,
        updatedAtLabel: leaderboard.data?.computedAt === undefined
            ? undefined
            : copy.updated(new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(leaderboard.data.computedAt))),
        emptyMessage: copy.empty,
        errorMessage: copy.failed,
        retryLabel: copy.retry,
    }
    const state = course.error !== undefined || leaderboard.error !== undefined || course.data === null || leaderboard.data === null
        ? "failed"
        : course.data === undefined || leaderboard.data === undefined
            ? "pending"
            : entries.length === 0 ? "empty" : "ready"

    return (
        <_CourseLeaderboardPage
            state={state}
            props={data}
            on={{
                course: () => router.push(`/courses/${displayId}`),
                selectCategory: (next) => router.push(`/courses/${displayId}/learn/leaderboard?category=${CATEGORIES.some((item) => item === next) ? next : "total"}`),
                climb: () => router.push(`/courses/${displayId}/learn/content`),
                retry: () => { void Promise.all([course.mutate(), leaderboard.mutate()]) },
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
