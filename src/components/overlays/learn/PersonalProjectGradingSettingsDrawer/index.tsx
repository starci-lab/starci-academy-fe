"use client"

import { PersonalProjectGradingSettingsDrawerBase } from "./component"

/** Overlay identity and lifecycle controls; settings data stays in the connected block. */
export type PersonalProjectGradingSettingsDrawerProps = { readonly courseId: string; readonly taskId: string; readonly isOpen: boolean; readonly onDismiss: () => void }

/** Connected overlay owner: only route identity and drawer lifecycle cross the overlay boundary. */
export const PersonalProjectGradingSettingsDrawer = (input: PersonalProjectGradingSettingsDrawerProps) => {
    return <PersonalProjectGradingSettingsDrawerBase {...input} />
}

/** Connected ownership marker for the grading settings overlay. */
export const meta = { world: "connected", domain: "learn" } as const
