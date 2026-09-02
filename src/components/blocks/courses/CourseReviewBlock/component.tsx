import { SurfaceListCard } from "@starci/grammar/common"
import { Heading } from "@starci/grammar/common"
import { RatingStars } from "@/components/leaves/RatingStars"
import { Text } from "@starci/grammar/common"

/** A learner review. */
export type CourseReview = { readonly id: string; readonly author: string; readonly score: number; readonly body?: string }
/** Review presentation states. */
export type CourseReviewBlockState = "rated" | "unrated"
/** Resolved review region content. */
export type CourseReviewBlockData = { readonly averageScore: number; readonly total: number; readonly reviews: ReadonlyArray<CourseReview>; readonly countLabel: string; readonly emptyLabel: string }
/** Traditional props for the review region. */
export type CourseReviewBlockProps = { readonly state: CourseReviewBlockState; readonly props: CourseReviewBlockData }

/** Draw the aggregate rating and learner review list. */
export const CourseReviewBlockBase = (props: CourseReviewBlockProps) => {
    const data = props.props
    const state = props.state
    if (state === "unrated") return <Text size={"sm"} tone={"muted"}>{data.emptyLabel}</Text>
    return <div>
        <div><Heading level={3}>{data.averageScore.toFixed(1)}</Heading><RatingStars props={{ label: `${data.averageScore.toFixed(1)}/5`, value: data.averageScore }} /><Text size={"sm"} tone={"muted"}>{data.countLabel}</Text></div>
        <SurfaceListCard label={""} labelHidden={true}>
            {data.reviews.map((review) => <div key={review.id}><div><Text size={"sm"} weight={"medium"}>{review.author}</Text><RatingStars props={{ label: `${review.author}: ${review.score}/5`, value: review.score }} /></div>{review.body === undefined ? null : <Text size={"sm"} tone={"muted"}>{review.body}</Text>}</div>)}
        </SurfaceListCard>
    </div>
}
