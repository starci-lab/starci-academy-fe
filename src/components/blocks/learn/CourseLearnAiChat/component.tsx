import {
    StarCiAiChatBase,
    type StarCiAiChatProps,
} from "@/components/blocks/ai/StarCiAiChat/component"

/** Pure course-context AI projection; the shared renderer owns no Academy-wide state here. */
export type CourseLearnAiChatBaseProps = StarCiAiChatProps

/** Reuse the neutral transcript/composer renderer with Learn-owned resolved data and actions. */
export const CourseLearnAiChatBase = (input: CourseLearnAiChatBaseProps) => (
    <StarCiAiChatBase {...input} />
)

/** Pure ownership marker for the course-context assistant. */
export const meta = { shape: "block", world: "pure", domain: "learn" } as const
