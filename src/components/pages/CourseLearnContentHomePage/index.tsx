"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { CourseLearnContentHomePageBase } from "./component"

/** Course identity required by the connected Modules landing page. */
export interface CourseLearnContentHomePageProps { readonly displayId: string }

/** Load one enrolled course and connect its modules to the pure page. */
export const CourseLearnContentHomePage = ({ displayId }: CourseLearnContentHomePageProps) => {
    const t = useTranslations("learn.contentHome")
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const state = course.error ? "failed" : course.data === undefined ? "pending" : "ready"
    return (
        <CourseLearnContentHomePageBase
            state={state}
            labels={{
                title: t("title"),
                description: t("description"),
                modules: t("modules"),
                moduleCount: t("moduleCount", { count: course.data?.modules?.length ?? 0 }),
            }}
            title={course.data?.title}
            description={course.data?.description ?? undefined}
            modules={course.data?.modules}
            onRetry={() => { void course.mutate() }}
            onModule={(id) => router.push(`/courses/${displayId}/learn/content/modules/${id}`)}
        />
    )
}

/** Connected ownership metadata for the Modules landing route. */
export const meta = { world: "connected", domain: "learn" } as const
