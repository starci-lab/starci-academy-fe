import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { Heading } from "@/components/leaves/Heading"
import { RatingStars } from "@/components/leaves/RatingStars"
import { Text } from "@/components/leaves/Text"

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
    if (state === "unrated") return <Text props={{ content: data.emptyLabel, size: "sm", tone: "muted" }} />
    return <div>
        <div><Heading props={{ content: data.averageScore.toFixed(1), level: 3 }} /><RatingStars props={{ label: `${data.averageScore.toFixed(1)}/5`, value: data.averageScore }} /><Text props={{ content: data.countLabel, size: "sm", tone: "muted" }} /></div>
        <SurfaceListCard props={{ label: "", isLabelHidden: true }}>
            {data.reviews.map((review) => <div key={review.id}><div><Text props={{ content: review.author, size: "sm", weight: "medium" }} /><RatingStars props={{ label: `${review.author}: ${review.score}/5`, value: review.score }} /></div>{review.body === undefined ? null : <Text props={{ content: review.body, size: "sm", tone: "muted" }} />}</div>)}
        </SurfaceListCard>
    </div>
}
