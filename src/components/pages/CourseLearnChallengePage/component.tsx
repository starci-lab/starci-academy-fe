import { CourseLearnChallengeBlock } from "@/components/blocks/learn/CourseLearnChallengeBlock"
import { Tree } from "@/components/branches/Tree"
import { CourseContentMap } from "@/components/blocks/learn/CourseContentMap"
import { RailDivider } from "@/components/leaves/RailDivider"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"

/** Route identity passed to the connected challenge block. */
export type CourseLearnChallengePageProps = { readonly displayId: string; readonly moduleId: string; readonly contentId: string; readonly challengeId: string }
/** Pure route-shell inputs after the connected page resolves its resize affordance label. */
export type CourseLearnChallengePageBaseProps = CourseLearnChallengePageProps & { readonly resizeLabel: string }

/** Canonical challenge route shell composed from the connected block. */
export const CourseLearnChallengePageBase = (props: CourseLearnChallengePageBaseProps) => (
    <Tree contract="course-learn-challenge-page" render={defineContractComponent("course-learn-challenge-page", {
        contents: defineContractComponent("learn-route-context-rail", {
            panel: defineContractProjection("content-map-panel", () => <CourseContentMap displayId={props.displayId} />),
        }),
        divider: defineLeafComponent("rail-divider", {}, () => (
            <RailDivider props={{ label: props.resizeLabel, storageKey: "starci.learn.contentMap.width", defaultWidth: 320, minWidth: 256, maxWidth: 560 }} />
        )),
        page: defineContractProjection("challenge-page-document", () => <CourseLearnChallengeBlock {...props} />),
    })} />
)

/** Ownership metadata for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
