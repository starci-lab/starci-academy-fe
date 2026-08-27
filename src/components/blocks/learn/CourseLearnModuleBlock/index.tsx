"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryModuleSwr } from "@/hooks/swr/useQueryModuleSwr"
import { CourseLearnModuleBlockView } from "./component"

/** Route identity required to load one enrolled module. */
export interface CourseLearnModuleBlockProps { readonly displayId: string; readonly moduleId: string }

/** Load one module and connect its query situations to the pure page. */
export const CourseLearnModuleBlock = (props: CourseLearnModuleBlockProps) => {
    const t = useTranslations("learn.module")
    const router = useRouter()
    const module = useQueryModuleSwr({ id: props.moduleId })
    return (
        <CourseLearnModuleBlockView
            blockState={module.error ? "failed" : module.data === undefined ? "pending" : "ready"}
            title={module.data?.title}
            module={module.data ?? undefined}
            label={t("contents")}
            onContent={(contentId) => router.push(`/courses/${props.displayId}/learn/content/modules/${props.moduleId}/contents/${contentId}`)}
        />
    )
}

/** Connected ownership metadata for the module route. */
