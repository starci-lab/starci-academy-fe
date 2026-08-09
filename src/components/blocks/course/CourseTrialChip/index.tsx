import { Badge } from "@/components/atoms/Badge"

/**
 * BLOCK - `CourseTrialChip`: marks a course row as still being a trial.
 *
 * PORTED FROM THE LIVE PRODUCT unchanged in intent, and the intent is the whole component:
 * MARK THE EXCEPTION, NOT THE NORM. A paid enrolment renders nothing at all, so a list of ten
 * courses carries one chip rather than ten, and the eye lands on the one row that is different.
 * A component that marked both states would be a component nobody could scan past.
 *
 * WHAT CHANGED IN THE CROSSING. The original read its own copy through `useTranslations`, which
 * is a fetch of a kind: it makes the component unrenderable from a test or a story without a
 * provider around it. The word arrives as a prop instead, resolved by whoever already holds the
 * locale.
 *
 * WHY WARNING AND NOT NEUTRAL. A trial is a state with an end date, and the tone is what says
 * so before the words are read. It is not danger - nothing is wrong - and it is not accent,
 * which would read as a feature rather than as a countdown.
 */

/** Props for {@link CourseTrialChip}. */
export interface CourseTrialChipProps {
    /**
     * Whether the learner has actually enrolled. The chip renders ONLY when this is `false`:
     * a real enrolment is the norm and gets no mark at all.
     */
    isEnrolled: boolean
    /** The already-resolved word for a trial. Copy is data, so it arrives translated. */
    label: string
}

/**
 * Draw the mark that says a course is still a trial - or draw nothing.
 *
 * @param props - {@link CourseTrialChipProps}
 */
export const CourseTrialChip = ({ isEnrolled, label }: CourseTrialChipProps) => {
    if (isEnrolled) return null
    return <Badge tone="warning">{label}</Badge>
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "CourseTrialChip" } as const
