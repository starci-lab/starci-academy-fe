import { Tree } from "@/components/branches/Tree"
import { Heading } from "@/components/leaves/Heading"
import { Icon } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
import {
    defineContractComponent,
    defineLeafComponent,
    type BlockProps,
} from "@/components/contracts/props"

/** How many marks the scale carries. */
const SCORE_SCALE = 5

/** One learner's review of the course. */
export type CourseReview = {
    /** Stable id for the list key. */
    readonly id: string
    /** Who wrote it. */
    readonly author: string
    /** Whole stars, one to five. */
    readonly score: number
    /** What they wrote, absent when they only scored the course. */
    readonly body?: string
}

/**
 * The two situations this block can be in.
 *
 * `unrated` is not `rated` with a zero in it. The projection answers zero for a course nobody
 * has reviewed, and a zero drawn beside five marks reads as a course people disliked rather
 * than one nobody has finished. Separating the states is what stops that number being drawn.
 */
export type CourseReviewBlockState = "rated" | "unrated"

/** What the review region draws. */
export type CourseReviewBlockData = {
    /** Mean across every review, which the projection serves. */
    readonly averageScore: number
    /** How many reviews the course carries in total, across every page. */
    readonly total: number
    /** The reviews on this page, newest first. */
    readonly reviews: ReadonlyArray<CourseReview>
    /** Localised "N reviews" copy. */
    readonly countLabel: string
    /** What the region says when nobody has reviewed yet. */
    readonly emptyLabel: string
}

/**
 * BLOCK - `CourseReviewBlock`: what other learners thought, and how the course scores overall.
 *
 * THE MEAN IS A PROP, NOT SOMETHING DERIVED FROM `reviews`. It comes from the projection and covers
 * the whole population; averaging the rows on screen would answer a different question and would
 * drift the moment the page turned.
 *
 * AN UNRATED COURSE SHOWS NO SCORE AND NO SCALE. The projection answers zero for a course nobody
 * has reviewed, and drawing that zero puts "0.0" beside five empty marks - which reads as a course
 * people disliked rather than one nobody has finished yet. A number nobody chose is worse than no
 * number, so the region says what is true instead. This was found by looking at it, not by reading
 * the code.
 *
 * THE SCALE IS FIVE OUTLINE MARKS, ALL ALIKE. A filled mark would need the `24/solid` family, which
 * is not one of this product's two, and ICON-5 refuses telling filled from empty by colour. So the
 * run says how far the scale goes and the number beside it says where this course sits. Each row
 * states its own score in words rather than drawing a second run - repeating the scale on every
 * line is what makes the scale stop meaning anything.
 *
 * @param input - The rating and the page of reviews.
 * @returns The review region.
 */
export const _CourseReviewBlock = ({
    props,
    state,
}: BlockProps<CourseReviewBlockState, CourseReviewBlockData>) => {
    if (state === "unrated") {
        return <Text props={{ content: props.emptyLabel, size: "sm", tone: "muted" }} />
    }
    return (
        <Tree
            contract="course-review-block"
            render={defineContractComponent("course-review-block", {
                summary: defineContractComponent("course-review-summary", {
                    score: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: props.averageScore.toFixed(1), level: 3 }} />
                    )),
                    scale: defineContractComponent("rating-star-run", {
                        star: Array.from({ length: SCORE_SCALE }, () => defineLeafComponent("icon", {}, () => (
                            <Icon props={{ name: "star", role: "chip" }} />
                        ))),
                    }),
                    count: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text props={{ content: props.countLabel, size: "sm", tone: "muted" }} />
                    )),
                }),
                list: defineContractComponent("course-review-list", {
                    review: props.reviews.map((review) => defineContractComponent("course-review-row", {
                        author: defineContractComponent("course-review-author-line", {
                            name: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                                <Text props={{ content: review.author, size: "sm", weight: "medium" }} />
                            )),
                            score: defineLeafComponent("text", { size: "xs" }, () => (
                                <Text props={{ content: `${review.score}/${SCORE_SCALE}`, size: "xs" }} />
                            )),
                        }),
                        body: review.body === undefined
                            ? undefined
                            : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                                <Text props={{ content: review.body, size: "sm", tone: "muted" }} />
                            )),
                    })),
                }),
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "block", world: "pure" } as const
