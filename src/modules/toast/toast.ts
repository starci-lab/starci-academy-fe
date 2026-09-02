import { toast as heroToast } from "@heroui/react"

/** Canonical app toast entry; callers never bind directly to the vendor export. */
export const toast = {
    ...heroToast,
    success: heroToast.success,
    danger: heroToast.danger,
    warning: heroToast.warning,
    info: heroToast.info,
}
