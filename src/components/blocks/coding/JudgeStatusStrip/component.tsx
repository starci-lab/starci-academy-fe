import { Button } from "@starci/grammar/common"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"
import { StatusDot, type StatusDotTone } from "@/components/leaves/StatusDot"
import { Text } from "@starci/grammar/common"


/**
 * BLOCK - `JudgeStatusStrip`: what the judge is saying, in one place that never moves.
 *
 * Target path: `src/components/blocks/coding/JudgeStatusStrip/component.tsx`.
 *
 * IT EXISTS BECAUSE JUDGING IS ASYNCHRONOUS. `submitCodingSolution` returns a `jobId` and the
 * verdict arrives later over a socket, so there is a stretch of time - sometimes long - in which
 * the reader is doing nothing but watching for an answer. The legacy page kept that answer inside a
 * tab of the console, which is the one place a person waiting is not looking.
 *
 * IT OWNS THE VERDICT-TO-TONE MAP, AND IT IS THE ONLY OWNER OF IT. Plan proposed a `VerdictChip`
 * leaf on the grounds that ten call sites would otherwise pick ten tones for `wrongAnswer`. There
 * are not ten call sites: there is this block and the submission history, and a closed map in one
 * block is a smaller thing than a new leaf. `StatusDot` already draws a toned state with a label.
 *
 * `socket-lost` IS A TENTH SITUATION NOBODY DECLARES. The server has nine verdicts; the tenth is the
 * client going deaf while judging continues. It must not read as a failed submission - the work is
 * still happening - so it says so and offers a re-read rather than a resubmit.
 *
 * `internalError` IS NOT THE LEARNER'S FAULT and is toned accordingly: the judge broke, the solution
 * did not. Toning it like a wrong answer would teach a reader to doubt correct code.
 */

/** Every situation the strip can be in - the server's nine, plus idle and a lost socket. */
export type JudgeVerdictState =
    | "idle"
    | "pending"
    | "judging"
    | "accepted"
    | "wrongAnswer"
    | "timeLimitExceeded"
    | "memoryLimitExceeded"
    | "runtimeError"
    | "compileError"
    | "internalError"
    | "socket-lost"

/**
 * The tone each situation is drawn in.
 *
 * `accepted` is the only success. The five ways a solution can be wrong share `danger`. Work still
 * in flight is `accent` because it is neither good nor bad yet. `internalError` and `socket-lost`
 * are `warning`: something went wrong and it was not the code.
 */
const VERDICT_TONE: Record<JudgeVerdictState, StatusDotTone> = {
    idle: "accent",
    pending: "accent",
    judging: "accent",
    accepted: "success",
    wrongAnswer: "danger",
    timeLimitExceeded: "danger",
    memoryLimitExceeded: "danger",
    runtimeError: "danger",
    compileError: "danger",
    internalError: "warning",
    "socket-lost": "warning",
}

/** What the strip draws. */
export type JudgeStatusStripData = {
    /** The already-resolved verdict name, as a reader would say it. */
    readonly verdictLabel: string
    /** The already-resolved detail - cases passed, time, memory, points. */
    readonly detailLabel?: string
    /** The already-resolved label of the one action this situation offers. */
    readonly actionLabel?: string
}

/** What the strip reports. */
export type JudgeStatusStripActions = {
    /** Called from the action - re-read the submission, or go on to the next problem. */
    readonly act?: () => void
}

/** Props for {@link JudgeStatusStripBase}. */
export type JudgeStatusStripProps = { readonly state: JudgeVerdictState; readonly props: JudgeStatusStripData; readonly on?: JudgeStatusStripActions }

/**
 * Draw the strip.
 *
 * @param input - {@link JudgeStatusStripProps}
 */
export const JudgeStatusStripBase = (props: JudgeStatusStripProps) => {
    const actionLabel = props.props.actionLabel
    return <div><StatusDot props={{ tone: VERDICT_TONE[props.state], label: props.props.verdictLabel }} /><Text size={"sm"} weight={"semibold"}>{props.props.verdictLabel}</Text><Text size={"xs"} tone={"muted"}>{props.props.detailLabel}</Text>{actionLabel === undefined ? null : <Button size="sm" variant={props.state === "accepted" ? "primary" : "outline"} onPress={props.on?.act} endContent={props.state === "accepted" ? <Icon source={iconSourceFor("next", "chip")} usage="chip" /> : undefined}>{actionLabel}</Button>}</div>
}
