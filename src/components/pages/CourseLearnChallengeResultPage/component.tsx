import { ChallengeResultBlock } from "@/components/blocks/learn/ChallengeResult"
import { CourseContentMap } from "@/components/blocks/learn/CourseContentMap"
import { Tree } from "@/components/branches/Tree"
import { RailDivider } from "@/components/leaves/RailDivider"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
/** Route identity passed to the connected challenge-result block. */
export type CourseLearnChallengeResultPageProps = { readonly displayId: string; readonly moduleId: string; readonly contentId: string; readonly challengeId: string }
/** Pure result-shell inputs after the connected page resolves its resize affordance label. */
export type CourseLearnChallengeResultPageBaseProps = CourseLearnChallengeResultPageProps & { readonly resizeLabel: string }
/** Challenge result route shell; grading remains inside the same course-navigation context. */
export const CourseLearnChallengeResultPageBase = (input: CourseLearnChallengeResultPageBaseProps) => (
    <Tree contract="course-learn-challenge-result-page" render={defineContractComponent("course-learn-challenge-result-page", {
        contents: defineContractComponent("learn-route-context-rail", {
            panel: defineContractProjection("content-map-panel", () => <CourseContentMap displayId={input.displayId} />),
        }),
        divider: defineLeafComponent("rail-divider", {}, () => (
            <RailDivider props={{ label: input.resizeLabel, storageKey: "starci.learn.contentMap.width", defaultWidth: 320, minWidth: 256, maxWidth: 560 }} />
        )),
        page: defineContractProjection("challenge-result-page-document", () => <ChallengeResultBlock {...input} />),
    })} />
)
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
