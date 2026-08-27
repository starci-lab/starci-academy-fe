import { buttonVariants } from "@heroui/styles"

/** Button state sample styling. */
export const getButtonStateSampleClassName = (variant: "primary" | "secondary" | "tertiary" | "outline" | "ghost") => buttonVariants({ variant, size: "sm" })
