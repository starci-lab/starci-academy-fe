import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Text } from "@/components/leaves/Text"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/**
 * BLOCK - `ContinueLearning`, presentational half.
 *
 * The one thing a returning reader came for: where they stopped.
 *
 * THE ITEM IS DRAWN HERE, NOT EXTRACTED. It was briefly a leaf and then briefly a branch, and both
 * were wrong for the same reason: the card ARRANGES three things on a surface, so it is not
 * indivisible and cannot be a leaf; and pulled out as a branch it would be a reusable shape with
 * exactly one caller, whose name (`ResumeCard`) says a domain the branch tier is not allowed to
 * know. A block IS the terminal unit from the page's side, so the run of items belongs inside the
 * one block that means them. Extract it when a SECOND surface needs the same card, and not before
 * - promotion is triggered by the second consumer, never by a prediction of one.
 *
 * THE STATE PICKS THE TREE. `ready` draws the run; `onboarding` and `empty` draw a notice with a
 * way out and differ only in which sentence is true; `failed` says so and offers the request
 * again; `pending` draws the run at rest so the section keeps its height. A situation that did not
 * change the tree would be props.
 *
 * THE SECTION IS FRAMELESS ON PURPOSE. Its content is itself a set of surfaces, and an inset
 * inside an inset reads as a mistake rather than as a hierarchy.
 *
 * THE PRESS SITS ON THE WAY OUT, NOT ON THE CARD. A card-wide target inside a section that is
 * already a surface leaves a reader unable to tell which press area they hit. The live product's
 * `ContinueCard` answers it the same way: a CTA and its label, never a card-wide href.
 */

/** One thing the reader can pick back up, already resolved into words. */
export type ResumeItem = {
    /** Identity of the item; the React key. */
    readonly id: string
    /** The already-resolved content or challenge title. */
    readonly title: string
    /** The already-resolved word for what kind of thing this is. */
    readonly kindLabel: string
}

/** How many resting cards are drawn, so the resting section has the height of a real one. */
const RESTING_ITEMS = 3

/** What the section carries in EVERY state - its name does not change while it loads. */
export type ContinueLearningFrame = {
    /** The already-resolved name of the region. */
    readonly label: string
}

/**
 * What the three "nothing to show" situations carry.
 *
 * They draw the same tree and differ only in which sentence is true, so they share a shape - but
 * they stay THREE members of the union rather than one member holding three literals, because a
 * discriminant that is itself a union does not narrow the props beside it.
 */
export type ContinueLearningNotice = ContinueLearningFrame & {
    /** The already-resolved sentence for this situation. */
    readonly message: string
    /** The already-resolved words on the way out of it. */
    readonly actionLabel: string
}

/** Props for {@link _ContinueLearning}, discriminated by the situation. */
export type ContinueLearningProps =
    | { readonly state: "pending"; readonly props: ContinueLearningFrame }
    | { readonly state: "onboarding"; readonly props: ContinueLearningNotice }
    | { readonly state: "empty"; readonly props: ContinueLearningNotice }
    | { readonly state: "failed"; readonly props: ContinueLearningNotice }
    | {
        readonly state: "ready"
        readonly props: ContinueLearningFrame & {
            readonly items: ReadonlyArray<ResumeItem>
            readonly resumeLabel: string
        }
    }

/** What the block reports. */
export type ContinueLearningActions = {
    /** Called with the item the reader is going back into. */
    readonly resume?: (id: string) => void
    /** Called when the reader takes the way out of an empty, onboarding or failed section. */
    readonly act?: () => void
}

/** The situation this surface is in, plus the actions it exposes. */
type ContinueLearningInput = ContinueLearningProps & { readonly on?: ContinueLearningActions }

/**
 * Render the section.
 *
 * @param input - {@link ContinueLearningInput}
 */
export const _ContinueLearning = (input: ContinueLearningInput) => {
    if (input.state === "onboarding" || input.state === "empty" || input.state === "failed") {
        return (
            <SurfaceCard props={{ label: input.props.label }} contract="empty-notice-card"
                render={defineContractComponent("empty-notice-card", {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{
                                icon: "course",
                                message: input.props.message,
                                actionLabel: input.props.actionLabel,
                            }}
                            on={{ act: input.on?.act }}
                        />
                    )),
                })} />
        )
    }

    /**
     * The run of cards, resting or loaded.
     *
     * Written as one function taking BOTH shapes rather than reading `input` again, because the
     * narrowing that proves which situation this is happens at the call site. A helper that
     * re-derived it from a boolean would be asking the compiler to trust a variable instead of a
     * branch, and the compiler is right to refuse.
     */
    const run = (
        items: ReadonlyArray<ResumeItem | undefined>,
        resumeLabel: string | undefined,
        isLoading: boolean,
    ) => defineContractComponent("resume-card-grid", {
        card: items.map((item) => defineContractComponent("resume-item-card", {
            kind: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text
                    props={{ content: item?.kindLabel, size: "sm", tone: "muted" }}
                    isLoading={isLoading}
                />
            )),
            title: defineLeafComponent("text", { size: "md", weight: "medium" }, () => (
                <Text
                    props={{ content: item?.title, size: "md", weight: "medium" }}
                    isLoading={isLoading}
                />
            )),
            // A resting card has no destination yet, so it has no dead way out.
            ...(item === undefined || resumeLabel === undefined ? {} : {
                resume: defineLeafComponent("see-more-link", {}, () => (
                    <SeeMoreLink
                        props={{ label: resumeLabel }}
                        on={{ press: () => input.on?.resume?.(item.id) }}
                    />
                )),
            }),
        })),
    })

    if (input.state === "pending") {
        return (
            <SurfaceCard
                props={{ label: input.props.label, isFrameless: true }}
                contract="resume-card-grid"
                render={run(Array.from({ length: RESTING_ITEMS }, () => undefined), undefined, true)}
                isLoading
            />
        )
    }

    return (
        <SurfaceCard
            props={{ label: input.props.label, isFrameless: true }}
            contract="resume-card-grid"
            render={run(input.props.items, input.props.resumeLabel, false)}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "pure", domain: "dashboard" } as const
