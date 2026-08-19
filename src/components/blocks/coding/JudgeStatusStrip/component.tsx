import { Button } from "@/components/leaves/Button"
import { StatusDot, type StatusDotTone } from "@/components/leaves/StatusDot"
import { Text } from "@/components/leaves/Text"
import { Tree } from "@/components/branches/Tree"
import {
    defineContractComponent,
    defineLeafComponent,
    type BlockProps,
} from "@/components/contracts/props"

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
export type JudgeStatusStripProps =
    BlockProps<JudgeVerdictState, JudgeStatusStripData> & {
        readonly on?: JudgeStatusStripActions
    }

/**
 * Draw the strip.
 *
 * @param input - {@link JudgeStatusStripProps}
 */
export const JudgeStatusStripBase = (input: JudgeStatusStripProps) => {
    const actionLabel = input.props.actionLabel
    return (
        <Tree
            contract="judge-status-strip"
            render={defineContractComponent("judge-status-strip", {
                mark: defineLeafComponent("status-dot", {}, () => (
                    <StatusDot
                        props={{
                            tone: VERDICT_TONE[input.state],
                            label: input.props.verdictLabel,
                        }}
                    />
                )),
                verdict: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                    <Text props={{ content: input.props.verdictLabel, size: "sm", weight: "semibold" }} />
                )),
                detail: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: input.props.detailLabel, size: "xs", tone: "muted" }} />
                )),
                ...(actionLabel === undefined ? {} : {
                    action: defineLeafComponent("button", {}, () => (
                        <Button
                            props={{
                                label: actionLabel,
                                size: "sm",
                                variant: input.state === "accepted" ? "primary" : "outline",
                                ...(input.state === "accepted" ? { icon: "next" as const, iconPlacement: "trailing" as const } : {}),
                            }}
                            on={{ press: input.on?.act }}
                        />
                    )),
                }),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "coding" } as const
