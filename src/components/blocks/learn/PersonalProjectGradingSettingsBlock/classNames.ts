import { cn } from "@heroui/react"

/** Vertical form layout used inside the grading-settings drawer. */
export const personalProjectGradingSettingsClassName = cn(
    "flex",
    "w-full",
    "min-w-0",
    "flex-col",
    "gap-4",
    "p-4",
)
/** Frames one coherent repository-access or analysis-settings group. */
export const personalProjectGradingSettingsSectionClassName = cn("flex", "min-w-0", "flex-col", "gap-4", "rounded-medium", "border", "border-separator", "p-4")
/** Separates save and token-recovery actions from editable settings. */
export const personalProjectGradingSettingsActionsClassName = cn("flex", "justify-end", "border-t", "border-separator", "pt-4")
