import { cn } from "@heroui/react"

/** Restore the legacy two-pixel semantic verdict band without changing row geometry. */
export const getRankedUserVerdictClassName = (verdict?: "success" | "danger") => cn(
    verdict !== undefined && "pl-4",
    verdict === "success" && "inset-shadow-[2px_0_0_0_var(--success)]",
    verdict === "danger" && "inset-shadow-[2px_0_0_0_var(--danger)]",
)
