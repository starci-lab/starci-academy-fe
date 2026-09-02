import { cn } from "@heroui/react"
import { buttonVariants } from "@heroui/styles"

/** Project complete tertiary icon-button material and states onto the dropdown trigger. */
export const dropdownTriggerClassName = cn(
    buttonVariants({ variant: "tertiary", isIconOnly: true, size: "md" }),
    "rounded-full",
)
/** Divider used below optional dropdown header content. */
export const dropdownHeaderClassName = cn("border-b", "border-separator")
/** Danger tone for destructive dropdown actions. */
export const dropdownDangerItemClassName = cn("text-danger-soft-foreground")
