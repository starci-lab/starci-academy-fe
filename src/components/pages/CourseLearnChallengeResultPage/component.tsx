import { ChallengeResultBlock } from "@/components/blocks/learn/ChallengeResult"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"
/** Route identity passed to the connected challenge-result block. */
export type CourseLearnChallengeResultPageProps = { readonly displayId: string; readonly moduleId: string; readonly contentId: string; readonly challengeId: string }
/** Challenge result page shell; the connected block owns grading queries and navigation. */
export const CourseLearnChallengeResultPageBase = (input: CourseLearnChallengeResultPageProps) => <Tree contract="course-learn-challenge-result-page" render={defineContractComponent("course-learn-challenge-result-page", { workspace: defineContractProjection("challenge-result-workspace", () => <ChallengeResultBlock {...input} />) })} />
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
