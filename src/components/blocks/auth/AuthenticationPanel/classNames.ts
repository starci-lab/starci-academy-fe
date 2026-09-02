import { cn } from "@heroui/react"
import { formFieldClassName, formScreenReaderLabelClassName } from "@starci/grammar/common"

/** Grammar-owned OTP label-control-help anatomy used unchanged by this owner. */
export const authenticationCodeFieldClassName = cn(formFieldClassName)
/** Grammar-owned visually-hidden field label used unchanged by this owner. */
export const authenticationCodeLabelClassName = cn(formScreenReaderLabelClassName)

/** Compact authentication journey column. */
export const authenticationPanelClassName = cn("mx-auto", "flex", "w-full", "max-w-md", "flex-col", "gap-6")
/** Centred title and subtitle stack. */
export const authenticationHeaderClassName = cn("flex", "flex-col", "items-center", "gap-3", "text-center")
/** Completion copy stack. */
export const authenticationDoneClassName = cn("flex", "flex-col", "gap-3", "text-center")
/** Details and code form stack. */
export const authenticationFormClassName = cn("flex", "flex-col", "gap-4", "[&>*]:w-full")
/** OAuth action stack. */
export const authenticationOauthClassName = cn("flex", "flex-col", "gap-3", "[&>*]:w-full")
/** Peer options placed on opposite sides when space allows. */
export const authenticationOptionsClassName = cn("flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3")
/** Centred secondary actions and account prompt. */
export const authenticationSecondaryClassName = cn("flex", "flex-row", "flex-wrap", "items-center", "justify-center", "gap-2")
