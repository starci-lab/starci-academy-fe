import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
// The contract machinery is reached through the candidate mirror, and ONLY because `ContractKey` is
// closed over the table on disk: the eleven entries this case proposes are not in it yet. The
// mirror is `src/components/contracts/*` and `src/components/branches/Tree` copied verbatim with
// their imports repointed - same signatures, same checking. On materialization these four
// specifiers become `@/` and the body is unchanged.
import { Tree } from "~candidate/components/branches/Tree"
import {
    defineContractComponent,
    defineLeafComponent,
    type BlockProps,
} from "~candidate/components/contracts/props"
import { CoverImage } from "~candidate/components/leaves/CoverImage"

/**
 * BLOCK - `EnrolledCourseCard`: a course the learner already owns, and where they stopped.
 *
 * Target path: `src/components/blocks/courses/EnrolledCourseCard/component.tsx`.
 *
 * WHY IT IS NOT THE CATALOG CARD. An owned course answers "where was I"; a purchasable one answers
 * "should I buy this". Price, discount and promises are not merely hidden here - they are not this
 * card's content, and a single card carrying both questions is what made the production catalog
 * require the reader to check every button to tell the two apart.
 *
 * PROGRESS IS REAL. `myCourses` selects `completionPercent` in query1 and the content and challenge
 * counters in query2, so the meter is backed by the same source the dashboard already reads.
 *
 * IT IS WRITTEN THE WAY THE SHIPPED BLOCKS ARE WRITTEN. `LeagueCard` and `TopLearners` already
 * bind named slots with `defineContractComponent` and close each leaf over its own identity with
 * `defineLeafComponent`. An earlier revision of this file invented a second builder that took an
 * ORDERED ARRAY of nodes instead, which compiled and rendered and checked nothing: a slot filled in
 * the wrong order, a missing slot or a leaf of the wrong kind all passed silently. The entry
 * declares `row` and `action` by name, so the call site names them too.
 */

/** The situations this card can be in. */
export type EnrolledCourseCardState = "pending" | "ready"

/** What the card draws once resolved. */
export type EnrolledCourseCardData = {
    /** Stable row identity. */
    readonly id: string
    /** The course name, already resolved. */
    readonly title?: string
    /** Course artwork; `null` draws the leaf's token fallback. */
    readonly cover?: string | null
    /**
     * Completion as a PERCENTAGE, `0..100` - not a ratio.
     *
     * It was `0..1`, which the `Progress` leaf renders against `maxValue={100}`: a course at 46%
     * drew a bar 0.46% wide and announced `aria-valuetext="0%"`. Nothing failed, which is how it
     * survived the first pass.
     */
    readonly percent?: number
    /** The already-resolved visible completion caption. */
    readonly progressLabel?: string
    /**
     * What the bar measures, for assistive technology. Separate from the visible caption on
     * purpose: `Progress.label` is never drawn, so reusing the caption here would announce the
     * same sentence twice to a screen reader while leaving sighted readers nothing at all.
     */
    readonly progressAriaLabel?: string
    /** The already-resolved resume action label. */
    readonly resumeLabel?: string
}

/** What the card reports. */
export type EnrolledCourseCardActions = {
    /** Called when the learner resumes this course. */
    readonly resume?: () => void
}

/** Props for {@link _EnrolledCourseCard}. */
export type EnrolledCourseCardProps = BlockProps<EnrolledCourseCardState, EnrolledCourseCardData> & {
    readonly on?: EnrolledCourseCardActions
}

/**
 * Draw one owned course.
 *
 * @param input - {@link EnrolledCourseCardProps}
 */
export const _EnrolledCourseCard = (input: EnrolledCourseCardProps) => {
    const isLoading = input.state === "pending"

    const body = defineContractComponent("enrolled-course-body", {
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: input.props.title, level: 3 }} isLoading={isLoading} />
        )),
        progress: defineLeafComponent("progress", {}, () => (
            <Progress
                props={{ value: input.props.percent, label: input.props.progressAriaLabel ?? "" }}
                isLoading={isLoading}
            />
        )),
        // The caption exists because `Progress` deliberately never draws its own label - it is an
        // assistive name, not copy. Without this line the bar is a coloured sliver with no figure
        // anywhere on screen.
        caption: defineLeafComponent("text", { size: "xs" }, () => (
            <Text props={{ content: input.props.progressLabel, size: "xs" }} isLoading={isLoading} />
        )),
    })

    const row = defineContractComponent("enrolled-course-row", {
        cover: defineLeafComponent("cover-image", {}, () => (
            <CoverImage
                props={{ src: input.props.cover ?? null, alt: "", ratio: "thumb" }}
                isLoading={isLoading}
            />
        )),
        body,
    })

    return (
        <Tree
            contract="enrolled-course-card"
            render={defineContractComponent("enrolled-course-card", {
                row,
                action: defineLeafComponent("button", {}, () => (
                    <Button
                        props={{
                            label: input.props.resumeLabel ?? "",
                            variant: "primary",
                            size: "sm",
                            icon: "next",
                            disabled: isLoading,
                        }}
                        on={{ press: input.on?.resume }}
                    />
                )),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
