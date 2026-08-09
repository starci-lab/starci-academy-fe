import { ProgressMeter } from "@/components/composites/stats/ProgressMeter"
import { verdictForPercent } from "@/components/composites/_semantic-contracts"

/**
 * COMPOSITE - `CourseProgressBar`: how far through one course a learner is, as a card.
 *
 * PORTED FROM THE LIVE PRODUCT, where the same three parts appear on the dashboard, in the
 * course list and on the course page. What makes it a component of its own rather than a call to
 * {@link ProgressMeter} with three props filled in is the DOMAIN: a course is marked with the
 * book glyph wherever it appears, and its completion figure carries a verdict that is derived
 * from the figure rather than chosen.
 *
 * WHY THE VERDICT IS NOT A PROP. A caller who could pass it could mark a half-finished course as
 * done, which is the one claim a progress card must never be able to make. It is derived here,
 * once, through the semantic contract every other surface reads the same rule from.
 *
 * WHY IT DELEGATES RATHER THAN DRAWS. Everything about how a quantity looks - the bar, the
 * readout beside it, the resting shape - belongs to the generic meter, so a change to any of
 * those reaches the course card, the weekly goal and the quota together. This file holds the two
 * facts that are true of courses and of nothing else.
 */

/** Props for {@link CourseProgressBar}. */
export interface CourseProgressBarProps {
    /** The already-resolved course title. It also names the bar for assistive technology. */
    title: string
    /** Completion, 0 to 100. The caller clamps: a payload is not a promise about the range. */
    percent: number
    /** The already-formatted completion readout - "40%" - so the locale decides its shape. */
    percentText: string
    /** Nothing to show YET: the card keeps its own height, with no figure to read. */
    isLoading?: boolean
}

/**
 * Draw one course and how far through it a learner is.
 *
 * @param props - {@link CourseProgressBarProps}
 */
export const CourseProgressBar = ({
    title,
    percent,
    percentText,
    isLoading = false,
}: CourseProgressBarProps) => (
    <ProgressMeter
        label={title}
        icon="course"
        percent={percent}
        readout={percentText}
        verdict={verdictForPercent(percent)}
        isLoading={isLoading}
    />
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "composite", name: "CourseProgressBar" } as const
