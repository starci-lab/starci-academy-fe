import { cn, skeletonVariants } from "@heroui/react"

/** Icon tile styling. */
export const getIconTileClassName = (tone: "neutral" | "accent" | "success" | "warning" | "danger", size: "sm" | "md", loading: boolean, image: boolean) => cn("inline-flex", "shrink-0", "items-center", "justify-center", "overflow-hidden", size === "sm" ? "size-8" : "size-10", size === "sm" ? "rounded-lg" : "rounded-xl", loading ? skeletonVariants({ animationType: "shimmer" }).base() : image ? undefined : tone === "neutral" ? "bg-default" : tone === "accent" ? "bg-accent-soft" : tone === "success" ? "bg-success-soft" : tone === "warning" ? "bg-warning-soft" : "bg-danger-soft", !loading && !image && tone === "accent" ? "text-accent-soft-foreground" : undefined)
/** Tile artwork sizing. */
export const iconTileImageClassName = cn("size-full", "object-cover")
