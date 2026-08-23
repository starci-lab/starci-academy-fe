import {
    CourseContentMapBase,
    type CourseContentMapBaseProps,
} from "@/components/blocks/learn/CourseContentMap/component"

/** Pure personal-project roadmap state in the shared course-map drawing shape. */
export type PersonalProjectContentMapBaseProps = CourseContentMapBaseProps

/** Draw the project roadmap without giving its state or data to the workspace layout. */
export const PersonalProjectContentMapBase = (input: PersonalProjectContentMapBaseProps) => (
    <CourseContentMapBase {...input} />
)

/** Source-level ownership marker for the pure roadmap drawing component. */
export const meta = { world: "pure", domain: "learn" } as const
