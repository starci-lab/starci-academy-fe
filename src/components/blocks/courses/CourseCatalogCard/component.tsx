import { SurfaceCard } from "@starci/grammar/common"
import { Badge } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Icon } from "@starci/grammar/common"

import { CoverImage } from "@/components/leaves/CoverImage"
import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { CourseValuePropositionList } from "@/components/blocks/courses/CourseValuePropositionList/component"
import {
    catalogCardActionsClassName,
    catalogCardBodyClassName,
    catalogCardCommerceClassName,
    catalogCardCoverClassName,
    catalogCardGridClassName,
    catalogCardIdentityClassName,
    catalogCardLineClassName,
    catalogCardLineBodyClassName,
    catalogCardLineActionsClassName,
    catalogCardPriceClassName,
    catalogCardPriceNoteClassName,
} from "./classNames"
import { TextAction } from "@starci/grammar/common"


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
    const price = <div className={catalogCardPriceClassName}><Text size={"sm"} weight={"semibold"} isSkeleton={loading}>{data.price}</Text>{data.originalPrice === undefined ? null : <Text size={"xs"} tone={"muted"} isSuperseded={true} isSkeleton={loading}>{data.originalPrice}</Text>}{data.discountLabel === undefined ? null : <Badge tone={"success"} isSkeleton={loading}>{data.discountLabel}</Badge>}</div>
    const priceNote = data.priceDetailLabel === undefined ? null : <div className={catalogCardPriceNoteClassName}>{data.savingsLabel === undefined ? null : <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{data.savingsLabel}</Text>}<TextAction size={"xs"} appearance="inline" onPress={on?.openPriceDetail}>{data.priceDetailLabel}</TextAction></div>
    const actions = <div className={data.layout === "line" ? catalogCardLineActionsClassName : catalogCardActionsClassName}><Button variant="secondary" size="sm" isDisabled={loading || data.isInCart === true} isPending={props.state === "adding"} onPress={on?.addToCart}>{data.cartLabel ?? ""}</Button><Button variant={"primary"} size={"sm"} isDisabled={loading} onPress={({ press: on?.view })?.press} endContent={"next" === "next" && "trailing" === "trailing" ? <Icon source={iconSourceFor("next", "chip")} role="chip" /> : undefined}>{data.viewLabel ?? ""}</Button></div>
    const content = <><div className={catalogCardCoverClassName}><CoverImage props={{ src: data.cover ?? null, alt: "", ratio: "wide" }} isLoading={loading} /></div><div className={data.layout === "line" ? catalogCardLineBodyClassName : catalogCardBodyClassName}><div className={catalogCardIdentityClassName}><Heading level={2} isSkeleton={loading}>{data.title}</Heading><Text size={data.layout === "line" ? "sm" : "xs"} tone={data.layout === "line" ? "muted" : undefined} isSkeleton={loading}>{data.enrolmentLabel}</Text></div><div className={catalogCardCommerceClassName}>{price}{priceNote}</div>{data.layout === "line" ? null : <CourseValuePropositionList props={{ promises: [...(data.promises ?? [])] }} isLoading={loading} />}</div>{actions}</>
    return data.layout === "line" ? <div className={catalogCardLineClassName}>{content}</div> : <SurfaceCard composition="joined"><div className={catalogCardGridClassName}>{content}</div></SurfaceCard>
}
