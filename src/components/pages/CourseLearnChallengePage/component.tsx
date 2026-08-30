import { CourseLearnChallengeBlock } from "@/components/blocks/learn/CourseLearnChallengeBlock"
import { CourseContentMap } from "@/components/blocks/learn/CourseContentMap"
import { RailDivider } from "@/components/leaves/RailDivider"
import { challengePageDividerClassName, challengePageFrameClassName, challengePageRailClassName, challengePageSurfaceClassName } from "./classNames"

/** Route identity passed to the connected challenge block. */
export type CourseLearnChallengePageProps = { readonly displayId: string; readonly moduleId: string; readonly contentId: string; readonly challengeId: string; readonly resizeLabel?: string }

/** Canonical challenge route shell composed from the connected block. */
export const CourseLearnChallengePageBase = (props: CourseLearnChallengePageProps) => (
    <div className={challengePageFrameClassName}>
        <aside className={challengePageRailClassName}><CourseContentMap displayId={props.displayId} /></aside>
        <div className={challengePageDividerClassName}><RailDivider props={{ label: props.resizeLabel ?? "", storageKey: "starci.learn.contentMap.width", defaultWidth: 320, minWidth: 256, maxWidth: 560 }} /></div>
        <main className={challengePageSurfaceClassName}><CourseLearnChallengeBlock {...props} /></main>
    </div>
)
