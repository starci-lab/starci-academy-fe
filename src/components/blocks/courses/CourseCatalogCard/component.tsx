import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { TaskProgressRow } from "@/components/composites/TaskProgressRow"
import { TextLink } from "@/components/leaves/TextLink"
// Contract machinery through the candidate mirror, and only because `ContractKey` is closed over
// the table on disk. The mirror is the locked `contracts/*` and `branches/Tree` copied verbatim
// with their imports repointed. On materialization these specifiers become `@/`.
import { Tree } from "@/components/branches/Tree"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type BlockProps,
    type LeafProps,
} from "@/components/contracts/props"
import { CoverImage } from "@/components/leaves/CoverImage"

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
export type CourseCatalogCardState = "pending" | "ready" | "adding"

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
    /** The course's promise lines, in declaration order. */
    readonly promises?: ReadonlyArray<string>
    /** How many promises there are, already phrased - the label above the joined list. */
    readonly promisesSummary?: string
    /** The already-resolved cart action label. */
    readonly cartLabel?: string
    /** Whether this course is already sitting in the viewer's cart. */
    readonly isInCart?: boolean
    /** The already-resolved label of the way into the price breakdown. Absent hides that way in. */
    readonly priceDetailLabel?: string
    /** The already-resolved primary action label. */
    readonly viewLabel?: string
    /**
     * How this course is being read: `"grid"` compares a few side by side, `"line"` scans many
     * down a column. Absent is `"grid"`, which is what the catalog opens on.
     */
    readonly layout?: "grid" | "line"
}

/** What the card reports. */
export type CourseCatalogCardActions = {
    /** Called when the learner opens this course. */
    readonly view?: () => void
    /** Called when the learner asks why the price is what it is. */
    readonly openPriceDetail?: () => void
    /** Called when the learner puts this course in their cart. */
    readonly addToCart?: () => void
}

/** Props for {@link _CourseCatalogCard}. */
export type CourseCatalogCardProps = BlockProps<CourseCatalogCardState, CourseCatalogCardData> & {
    readonly on?: CourseCatalogCardActions
}

/**
 * Draw one purchasable course.
 *
 * @param input - {@link CourseCatalogCardProps}
 */
/** What the promise list draws: the already-resolved claims, in the server's own order. */
type ValuePropositionsData = SurfaceListCardData & {
    readonly promises: ReadonlyArray<string>
}

/**
 * Turn a course's promises into the repeated row the list contract admits.
 *
 * ONE TICK, ONE OWNER. The row is `TaskProgressRow` - the same composite the day's tasks use - so
 * a promise and a task cannot end up wearing two different marks for the same "done" idea.
 */
const ValuePropositionsView = ({ props, isLoading = false }: LeafProps<ValuePropositionsData>) => (
    <Tree
        contract="marked-row-list"
        render={defineContractComponent("marked-row-list", {
            row: props.promises.map((promise, index) => defineCompositeComponent("task-progress-row", {}, () => (
                <TaskProgressRow
                    props={{ id: `promise-${index}`, title: promise, isComplete: true }}
                    isLoading={isLoading}
                />
            ))),
        })}
    />
)

/** Stable component type branded for the exact list contract it implements. */
const ValuePropositions = defineContractComponent("marked-row-list", ValuePropositionsView)

/**
 * Draw one purchasable course.
 *
 * @param input - {@link CourseCatalogCardProps}
 */
export const _CourseCatalogCard = (input: CourseCatalogCardProps) => {
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
                    props={{
                        content: input.props.originalPrice,
                        size: "xs",
                        tone: "muted",
                        // Two prices on one line without a rule through the dead one is two live
                        // numbers, and the reader has to work out which of them they owe.
                        isSuperseded: true,
                    }}
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
            <Heading props={{ content: input.props.title, level: 2 }} isLoading={isLoading} />
        )),
        count: defineLeafComponent("text", { size: "xs" }, () => (
            <Text props={{ content: input.props.enrolmentLabel, size: "xs" }} isLoading={isLoading} />
        )),
    })

    const priceGroup = defineContractComponent("catalog-price-group", {
        price,
        // WHAT IT SAVES AND WHY IT COSTS THIS ARE ONE THOUGHT, so they share a line rather than
        // stacking. Set on its own and a step larger, the question read louder than the saving it
        // was asking about, which is the rank the other way round.
        ...(input.props.priceDetailLabel === undefined ? {} : {
            note: defineContractComponent("price-note-row", {
                ...(input.props.savingsLabel === undefined ? {} : {
                    fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text
                            props={{ content: input.props.savingsLabel, size: "xs", tone: "muted" }}
                            isLoading={isLoading}
                        />
                    )),
                }),
                action: defineLeafComponent("text-link", { size: "xs" }, () => (
                    <TextLink
                        props={{ label: input.props.priceDetailLabel ?? "", size: "xs" }}
                        on={{ press: input.on?.openPriceDetail }}
                    />
                )),
            }),
        }),
    })

    const body = defineContractComponent("catalog-card-body", {
        heading,
        price: priceGroup,
        // The promises are the SAME LABELLED JOINED LIST the day's tasks are, always visible.
        //
        // An earlier revision folded them behind a native disclosure of its own making, then drew
        // the rows as a bare tree of icon-bearing lines. Both were the same mistake twice: the
        // reader compares courses line by line, so a claim behind a press is a claim they will not
        // read against the card beside it - and the product already owns this whole shape.
        // `SurfaceListCard` is the label over a joined body, `TaskProgressRow` is the ticked row
        // inside it, and `isNested` is the answer to a list standing on a surface that is already
        // raised: an outline rather than a second elevation. Rebuilt by hand, this card grew a
        // checklist that only resembled the checklist.
        promises: defineContractProjection("marked-row-list", () => (
            <SurfaceListCard
                props={{
                    label: input.props.promisesSummary ?? "",
                    promises: [...(input.props.promises ?? [])],
                    isNested: true,
                }}
                contract="marked-row-list"
                render={ValuePropositions}
                isLoading={isLoading}
            />
        )),
    })

    const cover = defineLeafComponent("cover-image", {}, () => (
        <CoverImage
            props={{ src: input.props.cover ?? null, alt: "", ratio: "wide" }}
            isLoading={isLoading}
        />
    ))

    /*
     * THE ACTIONS ARE THE SAME PAIR IN BOTH ARRANGEMENTS, so they are built once. A row that
     * offered fewer ways in than a card would make the layout toggle a change of what the catalog
     * OFFERS rather than of how it is read, and the reader who switched to scan would quietly lose
     * the ability to buy.
     */
    const action = defineContractComponent("catalog-card-action-row", {
        cart: defineLeafComponent("button", {}, () => (
            <Button
                props={{
                    label: input.props.cartLabel ?? "",
                    variant: "secondary",
                    size: "sm",
                    disabled: isLoading || input.props.isInCart === true,
                    isPending: input.state === "adding",
                }}
                on={{ press: input.on?.addToCart }}
            />
        )),
        open: defineLeafComponent("button", {}, () => (
            <Button
                props={{
                    label: input.props.viewLabel ?? "",
                    variant: "primary",
                    size: "sm",
                    icon: "next",
                    iconPlacement: "trailing",
                    disabled: isLoading,
                }}
                on={{ press: input.on?.view }}
            />
        )),
    })

    /*
     * THE ROW DROPS THE PROMISES, and that is the whole reason it is a second entry rather than
     * the same card at a different width. At one course per row the joined list would set every
     * row's height by the wordiest course in the catalog, and a list nobody can scan is not a list
     * view. What it costs and what it is called survive, because those are what a reader compares
     * when they are comparing twenty rather than three.
     */
    if (input.props.layout === "line") {
        /*
         * NO SURFACE OF ITS OWN. A row in the list view stands on the joined surface its list
         * draws, so a card here would be a card inside a card and twenty edges where the reader
         * was promised one column. The list owns the ground, the rule between rows and the inset;
         * this owns what the row says.
         */
        return (
            <Tree
                contract="catalog-card-line"
                render={defineContractComponent("catalog-card-line", {
                    cover,
                    body: defineContractComponent("catalog-card-line-body", {
                        heading: defineContractComponent("title-with-baseline-fact", {
                            title: defineLeafComponent("heading", {}, () => (
                                <Heading props={{ content: input.props.title, level: 2 }} isLoading={isLoading} />
                            )),
                            // The entry fixes this step: a fact read as part of the heading sentence
                            // sits at the body step beside it, not at the caption step below it.
                            fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                                <Text props={{ content: input.props.enrolmentLabel, size: "sm", tone: "muted" }} isLoading={isLoading} />
                            )),
                        }),
                        price: priceGroup,
                    }),
                    action,
                })}
            />
        )
    }

    return (
        <SurfaceCard
            contract="catalog-card"
            render={defineContractComponent("catalog-card", {
                cover,
                body,
                // THE CART IS THE QUIETER OF THE TWO, deliberately. Both are ways in, but one
                // commits money and the other only opens a page, so the secondary variant ranks
                // them without hiding either - and the row gives them an equal measure so a row of
                // cards does not end in a ragged edge of differently-sized buttons.
                //
                // IT SAYS WHAT IT DOES, IN WORDS. A lone trolley glyph is a guess the reader has
                // to make about whether it buys, saves or opens something, and it made the two
                // controls read as one button and one mystery.
                action,
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
