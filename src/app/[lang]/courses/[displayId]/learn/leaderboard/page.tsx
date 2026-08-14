"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { useParams, useSearchParams } from "next/navigation"
import { loadCourseLeaderboard, type CourseLeaderboardEntry } from "./_data"

type Category = "total" | "challenge" | "reading" | "milestone"

const categoryValue = (entry: CourseLeaderboardEntry, category: Category) => {
    if (category === "challenge") return entry.totalScore
    if (category === "reading") return entry.lessonsRead * 3
    if (category === "milestone") return entry.milestoneProgress * 10
    return entry.totalXp
}

const categoryNames: Record<Category, { vi: string; en: string }> = {
    total: { vi: "Tổng XP", en: "Total XP" },
    challenge: { vi: "Thử thách", en: "Challenges" },
    reading: { vi: "Đọc bài", en: "Reading" },
    milestone: { vi: "Cột mốc", en: "Milestones" },
}

const LearnLeaderboardPage = () => {
    const params = useParams<{ lang: string; displayId: string }>()
    const search = useSearchParams()
    const lang = params.lang === "vi" ? "vi" : "en"
    const selected = (search.get("category") as Category | null) ?? "total"
    const category: Category = selected in categoryNames ? selected : "total"
    const [retry, setRetry] = useState(0)
    const { data, error, isLoading } = useSWR(["learn-course-leaderboard", params.displayId, retry], () => loadCourseLeaderboard(params.displayId))
    const entries = useMemo(
        () => [...(data?.board?.entries ?? [])].sort((a, b) => categoryValue(b, category) - categoryValue(a, category)),
        [category, data?.board?.entries],
    )
    const title = data?.course.title ?? (lang === "vi" ? "Bảng xếp hạng" : "Leaderboard")
    const copy = lang === "vi"
        ? { heading: "Bảng xếp hạng", sub: "Xem tiến độ của bạn so với những người học khác trong khóa học.", loading: "Đang tải bảng xếp hạng…", failed: "Không tải được bảng xếp hạng.", retry: "Thử lại", empty: "Chưa có người học nào được xếp hạng.", you: "Bạn", xp: "XP", enroll: "Bạn cần tham gia khóa học để được xếp hạng." }
        : { heading: "Leaderboard", sub: "See how your progress compares with other learners in this course.", loading: "Loading leaderboard…", failed: "Could not load the leaderboard.", retry: "Try again", empty: "No learners are ranked yet.", you: "You", xp: "XP", enroll: "Enroll in the course to appear on the leaderboard." }

    return (
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-10">
            <header className="flex flex-col gap-2">
                <p className="text-sm text-default-500">{title}</p>
                <h1 className="text-3xl font-semibold tracking-tight">{copy.heading}</h1>
                <p className="max-w-2xl text-sm text-default-500">{copy.sub}</p>
            </header>
            {data?.course.isEnrolled === false ? <div className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800">{copy.enroll}</div> : null}
            <nav aria-label={copy.heading} className="flex gap-2 overflow-x-auto pb-1">
                {(Object.keys(categoryNames) as Array<Category>).map((key) => (
                    <a key={key} href={`?category=${key}`} className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm ${category === key ? "border-primary bg-primary text-white" : "border-default-200 bg-content1"}`}>
                        {categoryNames[key][lang]}
                    </a>
                ))}
            </nav>
            {isLoading ? <div className="rounded-xl border border-default-200 p-8 text-center text-sm text-default-500">{copy.loading}</div> : null}
            {error ? <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-danger-200 p-8 text-center"><p className="text-sm text-danger">{copy.failed}</p><button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm text-white" onClick={() => setRetry((value) => value + 1)}>{copy.retry}</button></div> : null}
            {!isLoading && !error && entries.length === 0 ? <div className="rounded-xl border border-default-200 p-8 text-center text-sm text-default-500">{copy.empty}</div> : null}
            {!isLoading && !error && entries.length > 0 ? (
                <section aria-label={copy.heading} className="overflow-hidden rounded-xl border border-default-200 bg-content1">
                    {data?.board?.myRank ? <div className="border-b border-default-200 bg-content2 px-4 py-4 text-sm"><span className="font-semibold">{copy.you}</span><span className="ml-3 text-default-500">#{data.board.myRank.rank} · {categoryValue(data.board.myRank as CourseLeaderboardEntry, category)} {copy.xp}</span></div> : null}
                    <ol className="divide-y divide-default-200">
                        {entries.map((entry, index) => <li key={entry.enrollmentId} className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"><span className="text-center text-sm font-semibold text-default-500">{index + 1}</span><span className="truncate text-sm">{entry.username ?? copy.you}</span><span className="text-sm font-medium">{categoryValue(entry, category)} {copy.xp}</span></li>)}
                    </ol>
                </section>
            ) : null}
        </main>
    )
}

export default LearnLeaderboardPage
