import { Text } from "@/components/leaves/Text"
import { LeadingNumber } from "@starci/grammar/core"
import { prerequisiteListClassName, prerequisiteRowClassName } from "./classNames"

/** One requirement a learner should already satisfy. */
export type CoursePrerequisite = {
    /** Stable id for the list key. */
    readonly id: string
    /** What the learner must already have or know. */
    readonly requirement: string
}

/**
 * The two situations this block can be in.
 *
 * A course with no prerequisites is not an empty list - it is a course that asks for nothing,
 * and drawing a bordered card around nothing says the opposite. The state is what makes that
 * unsayable rather than merely discouraged.
 */
export type CoursePrerequisiteListState = "required" | "none"

/** What the prerequisite list draws. */
export type CoursePrerequisiteListData = {
    /** The requirements, in the order the backend stores them. */
    readonly prerequisites: ReadonlyArray<CoursePrerequisite>
}
/** Traditional state and data lanes for the prerequisite list. */
export type CoursePrerequisiteListProps = {
    readonly state: CoursePrerequisiteListState
    readonly props: CoursePrerequisiteListData
}

/**
 * BLOCK - `CoursePrerequisiteList`: what a learner should already have before starting.
 *
 * IT IS AN `ol`, AND THAT IS DATA RATHER THAN STYLE. The backend documents the relation as "Ordered
 * prerequisites required before joining the course", so the sequence carries meaning: somebody who
 * lacks the first cannot judge the second. An `ol` says that to a reader who cannot see numbering.
 *
 * It is also why this is not a marked-row list with different copy. That pattern describes peer
 * completion statements under a `ul`; prerequisites are ordered conditions and would lose both
 * their sequence and their unverified state if rendered as completed promise rows.
 *
 * THE ORDINAL IS A GRAMMAR LEAF, not the browser's own marker. The list carries `p-0` and its rows
 * own the inset, so a native marker hangs outside that inset and sits against the card's edge.
 *
 * @param input - The requirements to draw.
 * @returns The ordered prerequisite list.
 */
export const CoursePrerequisiteListBase = (props: CoursePrerequisiteListProps) => {
    const data = props.props
    const state = props.state
    return (
        state === "none"
            ? null
            :
            <ol className={prerequisiteListClassName}>
                {data.prerequisites.map((prerequisite, index) => (
                    <li className={prerequisiteRowClassName} key={prerequisite.id}>
                        <LeadingNumber position={index + 1} />
                        <Text props={{ content: prerequisite.requirement, size: "sm" }} />
                    </li>
                ))}
            </ol>
    )
}
