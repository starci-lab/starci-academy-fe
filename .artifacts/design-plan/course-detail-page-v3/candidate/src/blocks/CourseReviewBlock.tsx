import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { defineContract, TreeCandidate } from "../branches/Tree"
import { IconCandidate } from "../leaves/Icon"

/** The top of the score scale, so a bare number is never read against a guessed maximum. */
const SCORE_SCALE = 5

/** One learner's review. */
export interface CourseReviewData {
    /** Stable id for the list key. */
    readonly id: string
    /** Who wrote it. */
    readonly author: string
    /** Whole stars, one to five. */
    readonly score: number
    /** What they wrote, when they wrote anything. */
    readonly body?: string
}

/** Props for {@link CourseReviewBlock}. */
export interface CourseReviewBlockProps {
    /** Mean score across every review; zero when the course has none. */
    readonly averageScore: number
    /** How many reviews the course carries in total. */
    readonly total: number
    /** The reviews on this page, newest first. */
    readonly reviews: ReadonlyArray<CourseReviewData>
    /** Localised "N reviews" copy, already formatted by the caller. */
    readonly countLabel: string
    /** What the region says when nobody has reviewed yet. */
    readonly emptyLabel: string
}

/**
 * The run of marks a score is read against.
 *
 * Five OUTLINE stars, all alike, standing for the scale - not a filled/empty run. A filled mark
 * needs `24/solid`, which is not one of StarCi's two glyph families, and telling filled from
 * empty by colour is refused by ICON-5. Three independent rules close that path, so the run says
 * how far the scale goes and the number beside it says where this course sits.
 *
 * @returns The scale, drawn once.
 */
const StarScale = () => (
    <TreeCandidate
        contract="rating-star-run"
        render={defineContract(
            "rating-star-run",
            Array.from({ length: SCORE_SCALE }, (_unused, index) => (
                <IconCandidate key={index} name="star" />
            )),
        )}
    />
)

/**
 * A course's rating and the reviews behind it.
 *
 * The summary reads the whole population and the list reads one page of it, which is why the mean
 * is a prop rather than something derived from `reviews`: averaging the rows on screen would answer
 * a different question and would drift from the projection the moment the page turned.
 *
 * @param input - {@link CourseReviewBlockProps}
 * @returns The review region.
 */
export const CourseReviewBlock = (input: CourseReviewBlockProps) => (
    input.total === 0
        // A course nobody has rated shows NO score and NO scale. The projection answers zero, and
        // rendering that zero draws "0.0" beside five empty stars - which reads as a course people
        // disliked rather than one nobody has finished yet. A number nobody chose is worse than no
        // number, so the region says what is true instead.
        ? <Text props={{ content: input.emptyLabel, size: "sm", tone: "muted" }} />
        : <TreeCandidate
            contract="course-review-block"
            render={defineContract("course-review-block", [
                <TreeCandidate
                    key="summary"
                    contract="course-review-summary"
                    render={defineContract("course-review-summary", [
                        <Heading key="score" props={{ content: input.averageScore.toFixed(1), level: 3 }} />,
                        <StarScale key="stars" />,
                        <Text key="count" props={{ content: input.countLabel, size: "sm", tone: "muted" }} />,
                    ])}
                />,
                <TreeCandidate
                    key="list"
                    contract="course-review-list"
                    render={defineContract(
                        "course-review-list",
                        input.reviews.map((review) => (
                            <TreeCandidate
                                key={review.id}
                                contract="course-review-row"
                                render={defineContract("course-review-row", [
                                    <TreeCandidate
                                        key="author"
                                        contract="course-review-author-line"
                                        render={defineContract("course-review-author-line", [
                                            <Text key="name" props={{ content: review.author, size: "sm", weight: "medium" }} />,
                                            <Text key="stars" props={{ content: `${review.score}/${SCORE_SCALE}`, size: "xs" }} />,
                                        ])}
                                    />,
                                    review.body === undefined
                                        ? null
                                        : <Text key="body" props={{ content: review.body, size: "sm", tone: "muted" }} />,
                                ])}
                            />
                        )),
                    )}
                />,
            ])}
        />
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "block", world: "pure" } as const
