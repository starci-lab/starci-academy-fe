"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryModuleSwr } from "@/hooks/swr/useQueryModuleSwr"
import { CourseLearnModulePageBase } from "./component"

/** Route identity required to load one enrolled module. */
export interface CourseLearnModulePageConnectedProps { readonly displayId: string; readonly moduleId: string }

/** Load one module and connect its query situations to the pure page. */
export const CourseLearnModulePage = ({ displayId, moduleId }: CourseLearnModulePageConnectedProps) => {
    const t = useTranslations("learn.module")
    const router = useRouter()
    const module = useQueryModuleSwr({ id: moduleId })
    return (
        <CourseLearnModulePageBase
            state={module.error ? "failed" : module.data === undefined ? "pending" : "ready"}
            title={module.data?.title}
            module={module.data ?? undefined}
            label={t("contents")}
            onContent={(contentId) => router.push(`/courses/${displayId}/learn/content/modules/${moduleId}/contents/${contentId}`)}
        />
    )
}

/** Connected ownership metadata for the module route. */
export const meta = { world: "connected", domain: "learn" } as const
