"use client"

import { useMemo, useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryCourseQaCommentsSwr } from "@/hooks/swr/useQueryCourseQaCommentsSwr"
import { useMutateCreateCourseQuestionSwr } from "@/hooks/swr/useMutateCreateCourseQuestionSwr"
import type { CourseQaComment } from "@/modules/api/graphql/queries/query-course-qa-comments"
import { CourseQaBase, type CourseQaThreadRow } from "./component"

/** Course identity resolved by the connected Q&A owner. */
export interface CourseQaProps { readonly displayId: string }

const qaStateOf = (failed: boolean, pending: boolean, empty: boolean) => {
    if (failed) return "failed" as const
    if (pending) return "pending" as const
    return empty ? "empty" as const : "ready" as const
}

const COPY = {
    en: {
        title: "Course Q&A", course: "Course", search: "Search questions", clear: "Clear question search",
        ask: "Ask a question", placeholder: "What would you like help with?", questions: "Questions", replies: "Replies",
        back: "Back to questions", empty: "No course questions yet. Ask the first one.",
        emptySearch: "No questions match this search.", failed: "Could not load course questions.", retry: "Try again",
        repliesCount: (count: number) => `${count} replies`, founder: "Founder",
    },
    vi: {
        title: "Hỏi đáp khóa học", course: "Khóa học", search: "Tìm câu hỏi", clear: "Xóa nội dung tìm kiếm", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        ask: "Đặt câu hỏi", placeholder: "Bạn cần được hỗ trợ điều gì?", questions: "Câu hỏi", replies: "Phản hồi", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        back: "Quay lại danh sách câu hỏi", empty: "Khóa học chưa có câu hỏi. Hãy đặt câu hỏi đầu tiên.", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        emptySearch: "Không có câu hỏi phù hợp.", failed: "Không tải được hỏi đáp khóa học.", retry: "Thử lại", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        repliesCount: (count: number) => `${count} phản hồi`, founder: "Founder", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
    },
} as const

/** Connected course-general Q&A over contentComments/createComment course scope. */
/** Connected Q&A block; owns question/thread queries and composer state. */
export const CourseQa = (props: CourseQaProps) => {
    const { displayId } = props
    const locale = useLocale() === "vi" ? "vi" : "en"
    const copy = COPY[locale]
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const questions = useQueryCourseQaCommentsSwr({ courseId: course.data?.id })
    const [selectedId, setSelectedId] = useState<string>()
    const replies = useQueryCourseQaCommentsSwr({ parentCommentId: selectedId })
    const create = useMutateCreateCourseQuestionSwr()
    const [query, setQuery] = useState("")
    const [draft, setDraft] = useState("")
    const [draftKey, setDraftKey] = useState(0)

    const rowOf = (comment: CourseQaComment): CourseQaThreadRow => ({
        id: comment.id,
        body: comment.body,
        meta: `${comment.author.username}${comment.isFounderAuthor ? ` · ${copy.founder}` : ""} · ${new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(comment.createdAt))}`,
        replyLabel: comment.replyCount > 0 ? copy.repliesCount(comment.replyCount) : undefined,
    })
    const allQuestions = useMemo(() => (questions.data?.comments ?? []).map(rowOf), [questions.data?.comments, locale])
    const visibleQuestions = useMemo(() => {
        const normalized = query.trim().toLocaleLowerCase(locale)
        return normalized === "" ? allQuestions : allQuestions.filter((question) => question.body.toLocaleLowerCase(locale).includes(normalized))
    }, [allQuestions, locale, query])
    const selectedQuestion = allQuestions.find((question) => question.id === selectedId)
    const replyRows = (replies.data?.comments ?? []).map(rowOf)
    const failed = course.error !== undefined || questions.error !== undefined || (selectedId !== undefined && replies.error !== undefined)
        || course.data === null || questions.data === null
    const pending = course.data === undefined || questions.data === undefined || (selectedId !== undefined && replies.data === undefined)
    const state = qaStateOf(failed, pending, allQuestions.length === 0)

    return (
        <CourseQaBase
            state={state}
            props={{
                title: copy.title,
                trail: [{ id: "course", label: course.data?.title ?? copy.course }, { id: "qa", label: copy.title }],
                searchPlaceholder: copy.search,
                searchLabel: copy.search,
                clearSearchLabel: copy.clear,
                askLabel: copy.ask,
                askPlaceholder: copy.placeholder,
                questionsLabel: copy.questions,
                repliesLabel: copy.replies,
                backLabel: copy.back,
                draftKey,
                draft,
                isSubmitting: create.isMutating,
                questions: visibleQuestions,
                selectedQuestion,
                replies: replyRows,
                emptyMessage: copy.empty,
                emptySearchMessage: copy.emptySearch,
                errorMessage: copy.failed,
                retryLabel: copy.retry,
            }}
            on={{
                course: () => router.push(`/courses/${displayId}`),
                search: setQuery,
                changeDraft: setDraft,
                ask: () => {
                    const courseId = course.data?.id
                    const body = draft.trim()
                    if (courseId === undefined || body === "") return
                    void create.trigger({ courseId, body }).then((result) => {
                        if (result.data?.createComment?.success !== true) return
                        setDraft("")
                        setDraftKey((current) => current + 1)
                        void questions.mutate()
                    })
                },
                openThread: setSelectedId,
                closeThread: () => setSelectedId(undefined),
                retry: () => { void Promise.all([course.mutate(), questions.mutate(), replies.mutate()]) },
            }}
        />
    )
}
