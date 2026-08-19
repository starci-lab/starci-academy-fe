import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
// Contract machinery through the candidate mirror, and only because `ContractKey` is closed over
// the table on disk. The mirror is the locked `contracts/*` and `branches/Tree` copied verbatim
// with their imports repointed. On materialization these specifiers become `@/`.
import { Tree } from "~candidate/components/branches/Tree"
import {
    defineContractComponent,
    defineLeafComponent,
    type BlockProps,
} from "~candidate/components/contracts/props"
import { CoverImage } from "~candidate/components/leaves/CoverImage"
import { ValuePropositionDisclosure } from "~candidate/components/leaves/ValuePropositionDisclosure"

/**
 * BLOCK - `CourseCatalogCard`: a course the learner can buy, and what it costs.
 *
 * Target path: `src/components/blocks/courses/CourseCatalogCard/component.tsx`.
 *
 * THE PRICE LINE IS THE LOCKED CONTRACT, not a copy of it. `price-discount-line` already owns the
 * relationship "the payable price leads while original price and discount qualify that same
 * commerce fact", which is exactly this line. Reusing it is why the catalog's price reads
 * identically to the recommended-course row that already ships.
 *
 * THE SAVINGS LINE IS A SIBLING SLOT, not an extension of the price line. Plan proposed adding a
 * `savings` slot to `price-discount-line`; declaring it on `catalog-card-body` instead produces the
 * same result with no change to a shipped contract and no migration for its existing caller.
 *
 * THE PROMISES ARE FOLDED. That is the selected direction's product bet: three always-visible
 * promise lines per card make a multi-column grid too deep to scan, so they stay one press away.
 *
 * THE OPTIONAL SLOTS ARE OMITTED, NOT EMPTIED. A course at full price has no original price and no
 * discount, and an empty badge beside the price reads as a discount of nothing.
 */

/** The situations this card can be in. */
export type CourseCatalogCardState = "pending" | "ready"

/** What the card draws once resolved. */
export type CourseCatalogCardData = {
    /** Stable row identity. */
    readonly id: string
    /** The course name, already resolved. */
    readonly title?: string
    /** Course artwork; `null` draws the leaf's token fallback. */
    readonly cover?: string | null
    /** The already-resolved enrolment count line. */
    readonly enrolmentLabel?: string
    /** The already-formatted payable price. */
    readonly price?: string
    /** The already-formatted list price, when a discount applies. */
    readonly originalPrice?: string
    /** The already-formatted discount. */
    readonly discountLabel?: string
    /** The already-formatted savings sentence. */
    readonly savingsLabel?: string
    /** The already-resolved disclosure summary. */
    readonly promisesSummary?: string
    /** The course's promise lines, in declaration order. */
    readonly promises?: ReadonlyArray<string>
    /** The already-resolved primary action label. */
    readonly viewLabel?: string
}

/** What the card reports. */
export type CourseCatalogCardActions = {
    /** Called when the learner opens this course. */
    readonly view?: () => void
}

/** Props for {@link CourseCatalogCardBase}. */
export type CourseCatalogCardProps = BlockProps<CourseCatalogCardState, CourseCatalogCardData> & {
    readonly on?: CourseCatalogCardActions
}

/**
 * Draw one purchasable course.
 *
 * @param input - {@link CourseCatalogCardProps}
 */
export const CourseCatalogCardBase = (input: CourseCatalogCardProps) => {
    const isLoading = input.state === "pending"

    const price = defineContractComponent("price-discount-line", {
        price: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
            <Text
                props={{ content: input.props.price, size: "sm", weight: "semibold" }}
                isLoading={isLoading}
            />
        )),
        ...(input.props.originalPrice === undefined ? {} : {
            original: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text
                    props={{ content: input.props.originalPrice, size: "xs", tone: "muted" }}
                    isLoading={isLoading}
                />
            )),
        }),
        ...(input.props.discountLabel === undefined ? {} : {
            discount: defineLeafComponent("badge", {}, () => (
                <Badge props={{ content: input.props.discountLabel, tone: "success" }} isLoading={isLoading} />
            )),
        }),
    })

    const heading = defineContractComponent("catalog-card-heading-row", {
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: input.props.title, level: 3 }} isLoading={isLoading} />
        )),
        count: defineLeafComponent("text", { size: "xs" }, () => (
            <Text props={{ content: input.props.enrolmentLabel, size: "xs" }} isLoading={isLoading} />
        )),
    })

    const body = defineContractComponent("catalog-card-body", {
        heading,
        price,
        ...(input.props.savingsLabel === undefined ? {} : {
            savings: defineLeafComponent("text", { size: "xs" }, () => (
                <Text props={{ content: input.props.savingsLabel, size: "xs" }} isLoading={isLoading} />
            )),
        }),
        promises: defineLeafComponent("value-proposition-disclosure", {}, () => (
            <ValuePropositionDisclosure
                props={{
                    summary: input.props.promisesSummary ?? "",
                    items: input.props.promises ?? [],
                }}
                isLoading={isLoading}
            />
        )),
    })

    return (
        <Tree
            contract="catalog-card"
            render={defineContractComponent("catalog-card", {
                cover: defineLeafComponent("cover-image", {}, () => (
                    <CoverImage
                        props={{ src: input.props.cover ?? null, alt: "", ratio: "wide" }}
                        isLoading={isLoading}
                    />
                )),
                body,
                action: defineLeafComponent("button", {}, () => (
                    <Button
                        props={{
                            label: input.props.viewLabel ?? "",
                            variant: "primary",
                            size: "sm",
                            icon: "next",
                            disabled: isLoading,
                        }}
                        on={{ press: input.on?.view }}
                    />
                )),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
