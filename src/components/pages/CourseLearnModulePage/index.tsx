"use client"

import { useTranslations } from "next-intl"
import { useQueryModuleSwr } from "@/hooks/swr/useQueryModuleSwr"
import { _CourseLearnModulePage } from "./component"

export interface CourseLearnModulePageConnectedProps { readonly moduleId: string }

export const CourseLearnModulePage = ({ moduleId }: CourseLearnModulePageConnectedProps) => {
    const t = useTranslations("learn.module")
    const module = useQueryModuleSwr({ id: moduleId })
    return <_CourseLearnModulePage state={module.error ? "failed" : module.data === undefined ? "pending" : "ready"} title={module.data?.title} module={module.data ?? undefined} label={t("contents")} />
}

export const meta = { world: "connected", domain: "learn" } as const
