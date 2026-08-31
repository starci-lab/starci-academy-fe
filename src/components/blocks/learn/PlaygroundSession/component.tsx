import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Article } from "@/components/branches/Article"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Icon } from "@/components/leaves/Icon"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import { Textarea } from "@/components/leaves/Textarea"
import type { PlaygroundStep } from "@/modules/api/graphql/queries/query-playground"
import {
    playgroundActivityClassName,
    playgroundActivityHeaderClassName,
    playgroundActivityListClassName,
    playgroundActivityRowClassName,
    playgroundConnectionStateClassName,
    playgroundHintClassName,
    playgroundIdentityClassName,
    playgroundIdentityCopyClassName,
    playgroundIdentityIconClassName,
    playgroundIdentityTopClassName,
    playgroundProgressClassName,
    playgroundProgressCopyClassName,
    playgroundSessionClassName,
    playgroundSettledActionsClassName,
    playgroundSettledClassName,
    playgroundSettledIconClassName,
    playgroundSettledProblemIconClassName,
    playgroundSplitClassName,
    playgroundStepButtonClassName,
    playgroundStepButtonCurrentClassName,
    playgroundStepCopyClassName,
    playgroundStepNumberClassName,
    playgroundStepRailClassName,
    playgroundTaskClassName,
    playgroundTaskHeaderClassName,
    playgroundVerifyActionClassName,
    playgroundWorkbenchClassName,
} from "./classNames"

/** Visible connection and settlement states for the live workbench. */
export type CoursePlaygroundSessionState = "connecting" | "live" | "reconnecting" | "recovery-failed" | "completed" | "failed"

/** Resolved live-session copy, verified progress, and owner actions. */
export type PlaygroundSessionProps = {
    readonly state: CoursePlaygroundSessionState
    readonly props: {
        readonly title: string
        readonly steps: ReadonlyArray<PlaygroundStep>
        readonly selectedStepIndex: number
        readonly passedStepIndexes: ReadonlyArray<number>
        readonly connectionText: string
        readonly submitLabel: string
        readonly leaveLabel: string
        readonly retryLabel: string
        readonly completedTitle: string
        readonly completedText: string
        readonly failedText: string
        readonly stepLabel: string
        readonly passedLabel: string
        readonly scratchpadTitle?: string
        readonly scratchpadDescription?: string
        readonly outputTitle?: string
        readonly outputWaiting?: string
        readonly verifyingLabel?: string
        readonly isVerifying?: boolean
        readonly progressLabel?: string
        readonly progressText?: string
        readonly stepsTitle?: string
        readonly reconnectText?: string
        readonly recoveryFailedTitle?: string
        readonly recoveryFailedText?: string
        readonly exitLabel?: string
        readonly currentStepLabel?: string
        readonly lockedLabel?: string
    }
    readonly on: {
        readonly step: (index: number) => void
        readonly submit: () => void
        readonly leave: () => void
        readonly retry: () => void
        readonly exit?: () => void
    }
}

/** Draw a dense guided workbench whose progress only reflects server verification. */
export const PlaygroundSessionBase = (props: PlaygroundSessionProps) => {
    const sessionState = props.state
    const current = props.props.steps[props.props.selectedStepIndex]
    const commandHint = current?.commandHint ?? undefined
    const actionHint = current?.actionHint ?? undefined
    const scratchpadTitle = props.props.scratchpadTitle ?? props.props.submitLabel
    const settled = sessionState === "failed" || sessionState === "recovery-failed" || sessionState === "completed"
    const progressValue = props.props.steps.length === 0 ? 0 : Math.round((props.props.passedStepIndexes.length / props.props.steps.length) * 100)
    const progressText = props.props.progressText ?? `${props.props.passedStepIndexes.length}/${props.props.steps.length}`
    const connectionIcon = sessionState === "live" || sessionState === "completed" ? "complete" : sessionState === "recovery-failed" ? "incomplete" : "pending"

    return <section className={playgroundSessionClassName}>
        <SurfaceCard><header className={playgroundIdentityClassName}>
            <div className={playgroundIdentityTopClassName}>
                <div className={playgroundIdentityCopyClassName}>
                    <div className={playgroundIdentityIconClassName}><Icon props={{ name: "playground", role: "heading" }} /></div>
                    <div>
                        {props.props.currentStepLabel === undefined ? null : <Text props={{ content: props.props.currentStepLabel, size: "xs", tone: "muted", weight: "semibold" }} />}
                        <Heading props={{ content: props.props.title, level: 1 }} />
                    </div>
                </div>
                <div className={playgroundConnectionStateClassName(
                    sessionState === "live" || sessionState === "completed"
                        ? "live"
                        : sessionState === "reconnecting" || sessionState === "recovery-failed"
                            ? "problem"
                            : "neutral",
                )}>
                    <Icon props={{ name: connectionIcon, role: "chip" }} />
                    <Text props={{ content: props.props.connectionText, size: "xs", weight: "semibold", live: "polite" }} />
                </div>
            </div>
            <div className={playgroundProgressClassName}>
                <div className={playgroundProgressCopyClassName}>
                    <Text props={{ content: props.props.progressLabel ?? props.props.title, size: "xs", tone: "muted", weight: "semibold" }} />
                    <Text props={{ content: progressText, size: "xs", weight: "semibold" }} />
                </div>
                <Progress props={{ label: props.props.progressLabel ?? props.props.title, value: progressValue }} />
            </div>
        </header></SurfaceCard>

        {settled ? <SurfaceCard props={{ measure: "form" }}><div className={playgroundSettledClassName}>
            <div className={sessionState === "completed" ? playgroundSettledIconClassName : playgroundSettledProblemIconClassName}>
                <Icon props={{ name: sessionState === "completed" ? "complete" : "incomplete", role: "heading" }} />
            </div>
            <div>
                <Heading props={{ content: sessionState === "completed" ? props.props.completedTitle : sessionState === "recovery-failed" ? props.props.recoveryFailedTitle ?? props.props.failedText : props.props.failedText, level: 2 }} />
                {sessionState === "completed"
                    ? <Text props={{ content: props.props.completedText, size: "sm", tone: "muted" }} />
                    : sessionState === "recovery-failed" && props.props.recoveryFailedText !== undefined
                        ? <Text props={{ content: props.props.recoveryFailedText, size: "sm", tone: "muted" }} />
                        : null}
            </div>
            <div className={playgroundSettledActionsClassName}>
                {sessionState === "completed"
                    ? <Button props={{ label: props.props.exitLabel ?? props.props.leaveLabel, variant: "primary", icon: "back" }} on={{ press: props.on.exit ?? props.on.leave }} />
                    : <Button props={{ label: props.props.retryLabel, variant: "primary", icon: "retry" }} on={{ press: props.on.retry }} />}
                <Button props={{ label: props.props.leaveLabel, variant: "secondary", icon: "back" }} on={{ press: props.on.leave }} />
            </div>
        </div></SurfaceCard> : <>
            <SurfaceCard><nav aria-label={props.props.stepsTitle ?? props.props.stepLabel} className={playgroundStepRailClassName}>
                {props.props.steps.map((step, index) => {
                    const passed = props.props.passedStepIndexes.includes(index)
                    const available = passed || index <= Math.max(0, props.props.passedStepIndexes.length)
                    const currentStep = index === props.props.selectedStepIndex
                    return <button
                        type="button"
                        className={currentStep ? playgroundStepButtonCurrentClassName : playgroundStepButtonClassName}
                        aria-label={`${props.props.stepLabel} ${index + 1} · ${passed ? `${props.props.passedLabel} · ` : ""}${step.title}`}
                        aria-current={currentStep ? "step" : undefined}
                        disabled={!available}
                        onClick={() => props.on.step(index)}
                        key={step.id}
                    >
                        <span className={playgroundStepNumberClassName}>{String(index + 1).padStart(2, "0")}</span>
                        <span className={playgroundStepCopyClassName}>
                            <Text props={{ content: passed ? props.props.passedLabel : available ? props.props.stepLabel : props.props.lockedLabel ?? props.props.stepLabel, size: "xs", tone: "muted", weight: "semibold" }} />
                            <Text props={{ content: step.title, size: "sm", weight: currentStep ? "semibold" : undefined }} />
                        </span>
                    </button>
                })}
            </nav></SurfaceCard>

            <div className={playgroundSplitClassName}>
                <SurfaceCard><section className={playgroundTaskClassName}>
                    {current === undefined ? null : <><header className={playgroundTaskHeaderClassName}>
                        <Text props={{ content: `${props.props.stepLabel} ${props.props.selectedStepIndex + 1}`, size: "xs", tone: "muted", weight: "semibold" }} />
                        <Heading props={{ content: current.title, level: 2 }} />
                    </header>
                    <Article props={{ body: current.body }} /></>}
                    {actionHint === undefined ? null : <div className={playgroundHintClassName}><Text props={{ content: actionHint, size: "sm" }} /></div>}
                    <div className={playgroundWorkbenchClassName}>
                        <Heading props={{ content: scratchpadTitle, level: 3 }} />
                        {props.props.scratchpadDescription === undefined ? null : <Text props={{ content: props.props.scratchpadDescription, size: "xs", tone: "muted" }} />}
                        <Textarea key={current?.id ?? "empty"} props={{ id: "playground-command-scratchpad", name: "playground-command-scratchpad", label: scratchpadTitle, defaultValue: commandHint, rows: 6, disabled: sessionState !== "live" }} />
                        <div className={playgroundVerifyActionClassName}>
                            {sessionState !== "live" || current === undefined || props.props.passedStepIndexes.includes(props.props.selectedStepIndex) ? null : <Button props={{ label: props.props.isVerifying ? props.props.verifyingLabel ?? props.props.submitLabel : props.props.submitLabel, variant: "primary", icon: "complete", disabled: props.props.isVerifying, isPending: props.props.isVerifying }} on={{ press: props.on.submit }} />}
                            <Button props={{ label: props.props.leaveLabel, variant: "ghost", size: "sm", icon: "back" }} on={{ press: props.on.leave }} />
                        </div>
                    </div>
                </section></SurfaceCard>

                <SurfaceCard><aside className={playgroundActivityClassName}>
                    <div className={playgroundActivityHeaderClassName}>
                        {props.props.outputTitle === undefined ? null : <Heading props={{ content: props.props.outputTitle, level: 2 }} />}
                        {sessionState === "reconnecting" && props.props.reconnectText !== undefined ? <Text props={{ content: props.props.reconnectText, size: "sm", tone: "muted" }} /> : null}
                        {sessionState === "reconnecting" ? <Button props={{ label: props.props.retryLabel, variant: "secondary", size: "sm", icon: "retry" }} on={{ press: props.on.retry }} /> : null}
                    </div>
                    <div className={playgroundActivityListClassName}>
                        {props.props.passedStepIndexes.length === 0
                            ? props.props.outputWaiting === undefined ? null : <Text props={{ content: props.props.outputWaiting, size: "sm", tone: "muted" }} />
                            : props.props.passedStepIndexes.map((index) => <div className={playgroundActivityRowClassName} key={index}>
                                <Icon props={{ name: "complete", role: "leading" }} />
                                <div className={playgroundStepCopyClassName}>
                                    <Text props={{ content: props.props.steps[index]?.title ?? `${props.props.stepLabel} ${index + 1}`, size: "sm", weight: "semibold" }} />
                                    <Text props={{ content: props.props.passedLabel, size: "xs", tone: "muted" }} />
                                </div>
                            </div>)}
                    </div>
                </aside></SurfaceCard>
            </div>
        </>}
    </section>
}
