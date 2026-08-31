"use client"

import { useLocale } from "next-intl"
import { PersonalProjectGradingSettingsDrawerBase } from "./component"

/** Overlay identity and lifecycle controls; settings data stays in the connected block. */
export type PersonalProjectGradingSettingsDrawerProps = {
    readonly courseId: string
    readonly taskId: string
    readonly repositoryUrl?: string
    readonly initialLanguage?: string
    readonly initialModelId?: string
    readonly isOpen: boolean
    readonly onDismiss: () => void
    readonly onApplied?: (selection: { readonly language: string; readonly modelId: string }) => void
}

/** Connected overlay owner: only route identity and drawer lifecycle cross the overlay boundary. */
export const PersonalProjectGradingSettingsDrawer = (props: PersonalProjectGradingSettingsDrawerProps) => {
    const locale = useLocale()
    return <PersonalProjectGradingSettingsDrawerBase {...props} title={locale === "vi" ? "Cài đặt chấm bài" : "Grading settings"} /> // vn-ok: localized runtime drawer title.
}

/** Connected ownership marker for the grading settings overlay. */
