import {
    CourseContentMapBase,
    type CourseContentMapProps,
} from "@/components/blocks/learn/CourseContentMap/component"

/** Pure personal-project roadmap state in the shared course-map drawing shape. */
export type PersonalProjectContentMapProps = CourseContentMapProps

/** Draw the project roadmap without giving its state or data to the workspace layout. */
export const PersonalProjectContentMapBase = (props: PersonalProjectContentMapProps) => (
    <CourseContentMapBase {...props} />
)
