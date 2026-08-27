"use client"

import { useLocale } from "next-intl"
import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryHeadhuntingCompaniesSwr } from "@/hooks/swr/useQueryHeadhuntingCompaniesSwr"
import { useQueryHeadhuntingCompanySuggestionsSwr } from "@/hooks/swr/useQueryHeadhuntingCompanySuggestionsSwr"
import { useQueryConsultantsSwr } from "@/hooks/swr/useQueryConsultantsSwr"
import type { Consultant } from "@/modules/api/graphql/queries/query-consultants"
import { CourseHeadhuntingsBlockBase, type HeadhuntingDirectoryRow } from "./component"

/** Route identity consumed by the connected directory block. */
export type CourseHeadhuntingsBlockProps = { readonly displayId: string }

const COPY = {
    en: {
        title: "Headhunting partners", course: "Course", search: "Find a company", clear: "Clear company search",
        companies: "Companies", consultants: "Consultants", contact: "Contact",
        locked: (score: number) => `CV score ${score} required`, empty: "No headhunting companies match this search.",
        failed: "Could not load headhunting partners.", retry: "Try again",
    },
    vi: {
        title: "Đối tác tuyển dụng", course: "Khóa học", search: "Tìm công ty", clear: "Xóa tìm kiếm công ty", // vn-ok: runtime locale copy
        companies: "Công ty", consultants: "Chuyên viên tư vấn", contact: "Liên hệ", // vn-ok: runtime locale copy
        locked: (score: number) => `Cần điểm CV ${score}`, empty: "Không có công ty tuyển dụng phù hợp.", // vn-ok: runtime locale copy
        failed: "Không tải được danh sách đối tác tuyển dụng.", retry: "Thử lại", // vn-ok: runtime locale copy
    },
} as const

const contactOf = (consultant: Consultant): string | undefined => {
    if (!consultant.contactUnlocked) return undefined
    if (consultant.email !== null) return `mailto:${consultant.email}`
    if (consultant.linkedinUrl !== null) return consultant.linkedinUrl
    if (consultant.phoneNumber !== null) return `tel:${consultant.phoneNumber}`
    if (consultant.zaloNumber !== null) return `tel:${consultant.zaloNumber}`
    return undefined
}

const openExternal = (href: string) => {
    if (href.startsWith("http")) window.open(href, "_blank", "noopener,noreferrer")
    else window.location.assign(href)
}

/** Connected owner for query, search, mapping and directory actions. */
export const CourseHeadhuntingsBlock = (props: CourseHeadhuntingsBlockProps) => {
    const { displayId } = props
    const locale = useLocale() === "vi" ? "vi" : "en"
    const copy = COPY[locale]
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const companies = useQueryHeadhuntingCompaniesSwr()
    const [query, setQuery] = useState("")
    const suggestions = useQueryHeadhuntingCompanySuggestionsSwr(query)
    const suggestionIds = new Set((suggestions.data ?? []).map((suggestion) => suggestion.id))
    const normalized = query.trim().toLocaleLowerCase(locale)
    const visible = (companies.data ?? []).filter((company) => normalized === ""
        || suggestionIds.has(company.id)
        || company.title.toLocaleLowerCase(locale).includes(normalized))
    const consultants = useQueryConsultantsSwr(visible[0]?.id)
    const contactById = new Map((consultants.data?.data ?? []).flatMap((consultant) => {
        const contact = contactOf(consultant)
        return contact === undefined ? [] : [[consultant.id, contact] as const]
    }))
    const failed = course.error !== undefined || companies.error !== undefined || suggestions.error !== undefined || consultants.error !== undefined
        || course.data === null || companies.data === null
    const pending = course.data === undefined || companies.data === undefined || (visible[0] !== undefined && consultants.data === undefined)
    const blockState = failed ? "failed" : pending ? "pending" : visible.length === 0 ? "empty" : "ready"
    const actions = Object.fromEntries([
        ...visible.map((company) => [`open:${company.id}`, () => router.push(`/courses/${displayId}/learn/headhunting-companies/${company.id}`)] as const),
        ...(consultants.data?.data ?? []).flatMap((consultant) => {
            const contact = contactById.get(consultant.id)
            return contact === undefined ? [] : [[`contact:${consultant.id}`, () => openExternal(contact)] as const]
        }),
    ])
    const companiesRows: ReadonlyArray<HeadhuntingDirectoryRow> = visible.map((company) => ({ id: company.id, label: company.title, meta: company.description ?? undefined }))
    const consultantRows: ReadonlyArray<HeadhuntingDirectoryRow> = (consultants.data?.data ?? []).map((consultant) => ({
        id: consultant.id,
        label: consultant.fullName,
        meta: consultant.jobTitle ?? consultant.description ?? undefined,
        actionLabel: consultant.contactUnlocked ? copy.contact : copy.locked(consultant.cvScoreUnlockThreshold),
        isActionAvailable: contactById.has(consultant.id),
    }))

    return <CourseHeadhuntingsBlockBase
        blockState={blockState}
        props={{
            title: copy.title,
            trail: [{ id: "course", label: course.data?.title ?? copy.course }, { id: "headhuntings", label: copy.title }],
            searchPlaceholder: copy.search, searchLabel: copy.search, clearSearchLabel: copy.clear,
            companiesLabel: copy.companies, consultantsLabel: copy.consultants,
            companies: companiesRows, consultants: consultantRows,
            emptyMessage: copy.empty, errorMessage: copy.failed, retryLabel: copy.retry,
        }}
        on={{
            course: () => router.push(`/courses/${displayId}`),
            search: setQuery,
            retry: () => { void Promise.all([course.mutate(), companies.mutate(), suggestions.mutate(), consultants.mutate()]) },
            ...actions,
        }}
    />
}

export { CourseHeadhuntingsBlockBase }
export type * from "./component"
