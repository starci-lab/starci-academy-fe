import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { CoverImage } from "@/components/leaves/CoverImage"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
import { CourseValuePropositionList } from "@/components/blocks/courses/CourseValuePropositionList/component"

/** The presentation state of a catalog card. */
export type CourseCatalogCardState = "pending" | "ready" | "adding"
/** Resolved content shown by a catalog card. */
export type CourseCatalogCardData = { readonly id: string; readonly title?: string; readonly cover?: string | null; readonly enrolmentLabel?: string; readonly price?: string; readonly originalPrice?: string; readonly discountLabel?: string; readonly savingsLabel?: string; readonly promises?: ReadonlyArray<string>; readonly promisesSummary?: string; readonly cartLabel?: string; readonly isInCart?: boolean; readonly priceDetailLabel?: string; readonly viewLabel?: string; readonly layout?: "grid" | "line" }
/** Actions available from a catalog card. */
export type CourseCatalogCardActions = { readonly view?: () => void; readonly openPriceDetail?: () => void; readonly addToCart?: () => void }
/** Traditional React props for a catalog card. */
export type CourseCatalogCardProps = { readonly state: CourseCatalogCardState; readonly props: CourseCatalogCardData; readonly on?: CourseCatalogCardActions }

/** Draw one purchasable course in grid or line arrangement. */
export const CourseCatalogCardBase = (props: CourseCatalogCardProps) => {
    const loading = props.state === "pending"
    const data = props.props
    const on = props.on
    const price = <div><Text props={{ content: data.price, size: "sm", weight: "semibold" }} isLoading={loading} />{data.originalPrice === undefined ? null : <Text props={{ content: data.originalPrice, size: "xs", tone: "muted", isSuperseded: true }} isLoading={loading} />}{data.discountLabel === undefined ? null : <Badge props={{ content: data.discountLabel, tone: "success" }} isLoading={loading} />}</div>
    const priceNote = data.priceDetailLabel === undefined ? null : <div>{data.savingsLabel === undefined ? null : <Text props={{ content: data.savingsLabel, size: "xs", tone: "muted" }} isLoading={loading} />}<TextLink props={{ label: data.priceDetailLabel, size: "xs" }} on={{ press: on?.openPriceDetail }} /></div>
    const actions = <div><Button props={{ label: data.cartLabel ?? "", variant: "secondary", size: "sm", disabled: loading || data.isInCart === true, isPending: props.state === "adding" }} on={{ press: on?.addToCart }} /><Button props={{ label: data.viewLabel ?? "", variant: "primary", size: "sm", icon: "next", iconPlacement: "trailing", disabled: loading }} on={{ press: on?.view }} /></div>
    const content = <><CoverImage props={{ src: data.cover ?? null, alt: "", ratio: "wide" }} isLoading={loading} /><div><div><Heading props={{ content: data.title, level: 2 }} isLoading={loading} /><Text props={{ content: data.enrolmentLabel, size: data.layout === "line" ? "sm" : "xs", tone: data.layout === "line" ? "muted" : undefined }} isLoading={loading} /></div><div>{price}{priceNote}</div>{data.layout === "line" ? null : <CourseValuePropositionList props={{ label: data.promisesSummary ?? "", promises: [...(data.promises ?? [])], isNested: true }} isLoading={loading} />}</div>{actions}</>
    return data.layout === "line" ? <div>{content}</div> : <SurfaceCard props={{}}>{content}</SurfaceCard>
}
