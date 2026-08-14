"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { _CourseLearnContentHomePage } from "./component"

export interface CourseLearnContentHomePageProps { readonly displayId: string }

export const CourseLearnContentHomePage = ({ displayId }: CourseLearnContentHomePageProps) => {
    const t = useTranslations("learn.contentHome")
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const state = course.error ? "failed" : course.data === undefined ? "pending" : "ready"
    return (
        <_CourseLearnContentHomePage
            state={state}
            labels={{ title: t("title"), description: t("description"), modules: t("modules"), moduleCount: t("moduleCount") }}
            title={course.data?.title}
            description={course.data?.description ?? undefined}
            modules={course.data?.modules}
            onRetry={() => { void course.mutate() }}
            onModule={(id) => router.push(`/courses/${displayId}/learn/content/modules/${id}`)}
        />
    )
}

export const meta = { world: "connected", domain: "learn" } as const
