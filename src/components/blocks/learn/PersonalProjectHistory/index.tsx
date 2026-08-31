"use client"

import { useState } from "react"
import { useLocale } from "next-intl"
import { useQueryPersonalTaskAttemptsSwr } from "@/hooks/swr/useQueryPersonalTaskAttemptsSwr"
import {
    PersonalProjectHistoryBase,
    type PersonalProjectHistoryAttempt,
    type PersonalProjectHistoryLabels,
} from "./component"

const PAGE_SIZE = 20

/** Stable identity and controlled selection supplied by the result workspace. */
export type PersonalProjectHistoryProps = {
    readonly courseId?: string
    readonly taskId: string
    readonly selectedAttemptId?: string
    readonly onSelect?: (attempt: PersonalProjectHistoryAttempt) => void
}

/** Own the paged history query and pagination independently from the result workspace. */
export const PersonalProjectHistory = (props: PersonalProjectHistoryProps) => {
    const { courseId, taskId, selectedAttemptId, onSelect } = props
    const locale = useLocale()
    const [page, setPage] = useState(0)
    const attempts = useQueryPersonalTaskAttemptsSwr(courseId, taskId, page)
    const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" })
    const rows: ReadonlyArray<PersonalProjectHistoryAttempt> = (attempts.data?.data ?? []).map((attempt) => ({
        id: attempt.id,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        passed: attempt.passed,
        servedModel: attempt.servedModel ?? undefined,
        servedProvider: attempt.servedProvider ?? undefined,
        processedAt: attempt.processedAt === null || attempt.processedAt === undefined
            ? undefined
            : dateFormat.format(new Date(attempt.processedAt)),
    }))
    const labels: PersonalProjectHistoryLabels = locale === "vi" // vn-ok: localized Vietnamese runtime copy.
        ? {
            summary: (count: number) => `${count} lần chấm, mới nhất trước`, // vn-ok: localized Vietnamese runtime copy.
            selectAttempt: (number: number, score: number) => `Lần ${number} · ${score} điểm`, // vn-ok: localized Vietnamese runtime copy.
            passed: "Đạt", needsWork: "Cần làm lại", selected: "Đang xem", previous: "Trang trước", next: "Trang sau", // vn-ok: localized Vietnamese runtime copy.
            pending: "Đang tải lịch sử chấm...", empty: "Chưa có lần chấm nào.", failed: "Không thể tải lịch sử chấm.", retry: "Thử tải lại", // vn-ok: localized Vietnamese runtime copy.
        }
        : {
            summary: (count: number) => `${count} grading attempts, newest first`,
            selectAttempt: (number: number, score: number) => `Attempt ${number} · ${score} points`,
            passed: "Passed", needsWork: "Needs another pass", selected: "Viewing", previous: "Previous page", next: "Next page",
            pending: "Loading grading history...", empty: "No grading attempts yet.", failed: "Grading history could not be loaded.", retry: "Try again",
        }
    const state = attempts.error !== undefined
        ? "failed"
        : attempts.data === undefined
            ? "pending"
            : rows.length === 0
                ? "empty"
                : "ready"

    return <PersonalProjectHistoryBase
        state={state}
        props={{ attempts: rows, attemptCount: attempts.data?.count ?? 0, selectedAttemptId, page, pageSize: PAGE_SIZE, labels }}
        on={{
            select: onSelect,
            previous: () => setPage((current) => Math.max(0, current - 1)),
            next: () => setPage((current) => current + 1),
            retry: () => { void attempts.mutate() },
        }}
    />
}

export * from "./component"
