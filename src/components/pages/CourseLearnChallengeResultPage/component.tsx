import { ChallengeResultBlock } from "@/components/blocks/learn/ChallengeResult"
import { CourseContentMap } from "@/components/blocks/learn/CourseContentMap"
import { RailDivider } from "@/components/leaves/RailDivider"
/** Route identity passed to the connected challenge-result block. */
/** Pure result-shell inputs after the connected page resolves its resize affordance label. */
export type CourseLearnChallengeResultPageProps = { readonly displayId: string; readonly moduleId: string; readonly contentId: string; readonly challengeId: string; readonly resizeLabel?: string }
/** Challenge result route shell; grading remains inside the same course-navigation context. */
export const CourseLearnChallengeResultPageBase = (props: CourseLearnChallengeResultPageProps) => (
    <>
        <aside><CourseContentMap displayId={props.displayId} /></aside>
        <RailDivider props={{ label: props.resizeLabel ?? "", storageKey: "starci.learn.contentMap.width", defaultWidth: 320, minWidth: 256, maxWidth: 560 }} />
        <main><ChallengeResultBlock {...props} /></main>
    </>
)
