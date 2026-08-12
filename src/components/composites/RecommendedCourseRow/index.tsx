import { PressableTree } from "@/components/branches/PressableTree"
import { Badge } from "@/components/leaves/Badge"
import { IconTile } from "@/components/leaves/IconTile"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "@/components/contracts/props"

/** Resolved commerce facts for one recommendation. */
export type RecommendedCourseRowData = { readonly id: string; readonly title?: string; readonly description?: string; readonly price?: string; readonly originalPrice?: string; readonly discount?: string; readonly reason?: string }
/** Journey reported by a recommendation row. */
export type RecommendedCourseRowActions = { readonly open?: () => void }
/** Draw one whole-row recommended-course destination. */
export const RecommendedCourseRow = ({ props, on, isLoading = false }: CompositeProps<RecommendedCourseRowData, RecommendedCourseRowActions>) => {
    const price = defineContractComponent("price-discount-line", {
        price: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: props.price, size: "sm", weight: "semibold" }} isLoading={isLoading} />),
        ...(props.originalPrice === undefined ? {} : { original: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.originalPrice, size: "xs", tone: "muted" }} isLoading={isLoading} />) }),
        ...(props.discount === undefined ? {} : { discount: defineLeafComponent("badge", {}, () => <Badge props={{ content: props.discount, tone: "success" }} />) }),
    })
    const body = defineContractComponent("recommended-course-body", {
        title: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: props.title, size: "sm", weight: "semibold" }} isLoading={isLoading} />),
        ...(props.description === undefined ? {} : { description: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.description, size: "xs", tone: "muted" }} />) }),
        price,
        ...(props.reason === undefined ? {} : { reason: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.reason, size: "xs", tone: "muted" }} />) }),
    })
    const content = defineContractComponent("recommended-course-row", { mark: defineLeafComponent("icon-tile", {}, () => <IconTile props={{ icon: "course", tone: "accent", size: "md" }} isLoading={isLoading} />), body })
    return <PressableTree contract="recommended-course-row" render={content} label={props.title ?? "Course"} press={on?.open} disabled={isLoading} />
}
/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
