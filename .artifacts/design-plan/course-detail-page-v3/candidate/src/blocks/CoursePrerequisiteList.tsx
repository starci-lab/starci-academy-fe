import { Text } from "@/components/leaves/Text"
import { defineContract, TreeCandidate } from "../branches/Tree"

/** One requirement a learner must already satisfy. */
export interface CoursePrerequisiteData {
    /** Stable id for the list key. */
    readonly id: string
    /** What the learner must already have or know. */
    readonly requirement: string
}

/** Props for {@link CoursePrerequisiteList}. */
export interface CoursePrerequisiteListProps {
    /** The requirements, in the order the backend stores them. */
    readonly prerequisites: ReadonlyArray<CoursePrerequisiteData>
}

/**
 * The ordered conditions a learner should meet before starting.
 *
 * The ordinal is drawn as text rather than left to the browser's own `ol` marker, because the list
 * carries `p-0` and its rows own their inset - a native marker would hang outside that inset and
 * sit against the card's edge. The element stays an `ol` regardless: the marker is presentation and
 * the sequence is meaning, and only one of those is negotiable.
 *
 * @param input - {@link CoursePrerequisiteListProps}
 * @returns The ordered prerequisite list.
 */
export const CoursePrerequisiteList = (input: CoursePrerequisiteListProps) => (
    <TreeCandidate
        contract="course-prerequisite-list"
        render={defineContract(
            "course-prerequisite-list",
            input.prerequisites.map((prerequisite, index) => (
                <TreeCandidate
                    key={prerequisite.id}
                    contract="course-prerequisite-row"
                    render={defineContract("course-prerequisite-row", [
                        <Text key="mark" props={{ content: `${index + 1}.`, size: "sm", tone: "muted" }} />,
                        <Text key="requirement" props={{ content: prerequisite.requirement, size: "sm" }} />,
                    ])}
                />
            )),
        )}
    />
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "block", world: "pure" } as const
