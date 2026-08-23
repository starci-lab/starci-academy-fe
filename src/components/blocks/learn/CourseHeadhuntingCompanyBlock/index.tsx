"use client"

import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryHeadhuntingCompanySwr } from "@/hooks/swr/useQueryHeadhuntingCompanySwr"
import { useQueryConsultantsSwr } from "@/hooks/swr/useQueryConsultantsSwr"
import type { Consultant } from "@/modules/api/graphql/queries/query-consultants"
import { CourseHeadhuntingCompanyBlockBase } from "./component"

/** Route identity consumed by the connected company profile block. */
export type CourseHeadhuntingCompanyBlockProps = { readonly displayId: string; readonly companyId: string }

const COPY = {
    en: {
        fallback: "Headhunting company", course: "Course", directory: "Headhunting partners", consultants: "Consultants",
        back: "Back to partners", contact: "Contact company", consultantContact: "Contact",
        locked: (score: number) => `CV score ${score} required`, notFound: "This headhunting company was not found.",
        empty: "This company has no listed consultants yet.", failed: "Could not load this company.", retry: "Try again",
    },
    vi: {
        fallback: "Công ty tuyển dụng", course: "Khóa học", directory: "Đối tác tuyển dụng", consultants: "Chuyên viên tư vấn", // vn-ok: runtime locale copy
        back: "Quay lại đối tác", contact: "Liên hệ công ty", consultantContact: "Liên hệ", // vn-ok: runtime locale copy
        locked: (score: number) => `Cần điểm CV ${score}`, notFound: "Không tìm thấy công ty tuyển dụng này.", // vn-ok: runtime locale copy
        empty: "Công ty chưa có chuyên viên tư vấn được công bố.", failed: "Không tải được thông tin công ty.", retry: "Thử lại", // vn-ok: runtime locale copy
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

const companyStateOf = (failed: boolean, missing: boolean, pending: boolean) => {
    if (failed) return "failed" as const
    if (missing) return "not-found" as const
    if (pending) return "pending" as const
    return "ready" as const
}

/** Connected owner for company, consultant, transport and navigation state. */
export const CourseHeadhuntingCompanyBlock = ({ displayId, companyId }: CourseHeadhuntingCompanyBlockProps) => {
    const locale = useLocale() === "vi" ? "vi" : "en"
    const copy = COPY[locale]
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const company = useQueryHeadhuntingCompanySwr(companyId)
    const consultants = useQueryConsultantsSwr(company.data?.id)
    const companyContact = company.data?.email === null || company.data?.email === undefined
        ? company.data?.websiteUrl ?? company.data?.linkedinUrl ?? undefined
        : `mailto:${company.data.email}`
    const contactById = new Map((consultants.data?.data ?? []).flatMap((consultant) => {
        const contact = contactOf(consultant)
        return contact === undefined ? [] : [[consultant.id, contact] as const]
    }))
    const failed = course.error !== undefined || company.error !== undefined || consultants.error !== undefined || course.data === null
    const blockState = companyStateOf(failed, company.data === null, company.data === undefined || consultants.data === undefined)
    const actions = Object.fromEntries((consultants.data?.data ?? []).flatMap((consultant) => {
        const contact = contactById.get(consultant.id)
        return contact === undefined ? [] : [[`contact:${consultant.id}`, () => openExternal(contact)] as const]
    }))

    return <CourseHeadhuntingCompanyBlockBase
        blockState={blockState}
        props={{
            title: company.data?.title ?? copy.fallback,
            trail: [
                { id: "course", label: course.data?.title ?? copy.course },
                { id: "directory", label: copy.directory },
                { id: "company", label: company.data?.title ?? copy.fallback },
            ],
            description: company.data?.description ?? undefined,
            address: company.data?.address ?? undefined,
            contactLabel: companyContact === undefined ? undefined : copy.contact,
            consultantsLabel: copy.consultants,
            consultants: (consultants.data?.data ?? []).map((consultant) => ({
                id: consultant.id,
                label: consultant.fullName,
                meta: consultant.jobTitle ?? consultant.description ?? undefined,
                actionLabel: consultant.contactUnlocked ? copy.consultantContact : copy.locked(consultant.cvScoreUnlockThreshold),
                isActionAvailable: contactById.has(consultant.id),
            })),
            backLabel: copy.back,
            notFoundMessage: copy.notFound,
            emptyMessage: copy.empty,
            errorMessage: copy.failed,
            retryLabel: copy.retry,
        }}
        on={{
            course: () => router.push(`/courses/${displayId}`),
            back: () => router.push(`/courses/${displayId}/learn/headhuntings`),
            companyContact: companyContact === undefined ? undefined : () => openExternal(companyContact),
            retry: () => { void Promise.all([course.mutate(), company.mutate(), consultants.mutate()]) },
            ...actions,
        }}
    />
}

export { CourseHeadhuntingCompanyBlockBase }
export type * from "./component"
