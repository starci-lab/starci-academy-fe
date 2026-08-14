"use client"

import { CoursePrerequisiteList } from "./blocks/CoursePrerequisiteList"
import { CourseReviewBlock } from "./blocks/CourseReviewBlock"
import { defineContract, TreeCandidate } from "./branches/Tree"
import type { CandidateState } from "./states"

/** Props for {@link RenderState}. */
export interface RenderStateProps {
    /** The state to draw. */
    readonly state: CandidateState
}

/**
 * Draw one state of one owner.
 *
 * It renders the REGION the state belongs to and nothing else. A state that redrew the whole page
 * around a varying region would put four near-identical screenshots in the record and make the one
 * difference between them the hardest thing to find.
 *
 * The frame is `course-detail-page`, the locked key that already means "the page this region lives
 * on" - review chrome is still source, and a scaffolding div with hand-written classes is refused
 * here exactly as it would be in production.
 *
 * @param input - {@link RenderStateProps}
 * @returns The region at that state.
 */
export const RenderState = (input: RenderStateProps) => (
    <TreeCandidate
        contract="course-detail-page"
        render={defineContract("course-detail-page", [
            input.state.prerequisites === undefined || input.state.prerequisites.length === 0
                ? null
                : <CoursePrerequisiteList key="prerequisites" prerequisites={input.state.prerequisites} />,
            input.state.reviews === undefined
                ? null
                : <CourseReviewBlock
                    key="reviews"
                    averageScore={input.state.averageScore ?? 0}
                    total={input.state.total ?? 0}
                    reviews={input.state.reviews}
                    countLabel={`${input.state.total ?? 0} danh gia`}
                    emptyLabel="Chua co danh gia nao cho khoa hoc nay."
                />,
        ])}
    />
)
