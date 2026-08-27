import { cn, skeletonVariants } from "@heroui/react"

/** Status dot tone styling. */
export const getStatusDotClassName = (tone: "neutral" | "accent" | "success" | "warning" | "danger", loading: boolean) => cn("size-2.5", "shrink-0", "rounded-full", loading ? skeletonVariants({ animationType: "shimmer" }).base() : tone === "neutral" ? "bg-default" : tone === "accent" ? "bg-accent" : tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-danger")
