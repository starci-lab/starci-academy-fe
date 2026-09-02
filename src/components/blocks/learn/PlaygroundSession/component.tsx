import { SurfaceCard } from "@starci/grammar/common"
import { Article } from "@/components/branches/Article"
import { Button } from "@starci/grammar/common"
import { Heading } from "@starci/grammar/common"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Progress } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
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
        <SurfaceCard composition="joined"><header className={playgroundIdentityClassName}>
            <div className={playgroundIdentityTopClassName}>
                <div className={playgroundIdentityCopyClassName}>
                    <div className={playgroundIdentityIconClassName}><Icon source={iconSourceFor("playground", "heading")} role={"heading"} /></div>
                    <div>
                        {props.props.currentStepLabel === undefined ? null : <Text size={"xs"} tone={"muted"} weight={"semibold"}>{props.props.currentStepLabel}</Text>}
                        <Heading level={1}>{props.props.title}</Heading>
                    </div>
                </div>
                <div className={playgroundConnectionStateClassName(
                    sessionState === "live" || sessionState === "completed"
                        ? "live"
                        : sessionState === "reconnecting" || sessionState === "recovery-failed"
                            ? "problem"
                            : "neutral",
                )}>
                    <Icon source={iconSourceFor(connectionIcon, "chip")} role={"chip"} />
                    <Text size={"xs"} weight={"semibold"} live={"polite"}>{props.props.connectionText}</Text>
                </div>
            </div>
            <div className={playgroundProgressClassName}>
                <div className={playgroundProgressCopyClassName}>
                    <Text size={"xs"} tone={"muted"} weight={"semibold"}>{props.props.progressLabel ?? props.props.title}</Text>
                    <Text size={"xs"} weight={"semibold"}>{progressText}</Text>
                </div>
                <Progress label={props.props.progressLabel ?? props.props.title} value={progressValue} />
            </div>
        </header></SurfaceCard>

        {settled ? <SurfaceCard measure={"form"} composition="joined"><div className={playgroundSettledClassName}>
            <div className={sessionState === "completed" ? playgroundSettledIconClassName : playgroundSettledProblemIconClassName}>
                <Icon source={iconSourceFor(sessionState === "completed" ? "complete" : "incomplete", "heading")} role={"heading"} />
            </div>
            <div>
                <Heading level={2}>{sessionState === "completed" ? props.props.completedTitle : sessionState === "recovery-failed" ? props.props.recoveryFailedTitle ?? props.props.failedText : props.props.failedText}</Heading>
                {sessionState === "completed"
                    ? <Text size={"sm"} tone={"muted"}>{props.props.completedText}</Text>
                    : sessionState === "recovery-failed" && props.props.recoveryFailedText !== undefined
                        ? <Text size={"sm"} tone={"muted"}>{props.props.recoveryFailedText}</Text>
                        : null}
            </div>
            <div className={playgroundSettledActionsClassName}>
                {sessionState === "completed"
                    ? <Button variant="primary" onPress={props.on.exit ?? props.on.leave}>{props.props.exitLabel ?? props.props.leaveLabel}</Button>
                    : <Button variant="primary" onPress={props.on.retry}>{props.props.retryLabel}</Button>}
                <Button variant="secondary" onPress={props.on.leave}>{props.props.leaveLabel}</Button>
            </div>
        </div></SurfaceCard> : <>
            <SurfaceCard composition="joined"><nav aria-label={props.props.stepsTitle ?? props.props.stepLabel} className={playgroundStepRailClassName}>
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
                            <Text size={"xs"} tone={"muted"} weight={"semibold"}>{passed ? props.props.passedLabel : available ? props.props.stepLabel : props.props.lockedLabel ?? props.props.stepLabel}</Text>
                            <Text size={"sm"} weight={currentStep ? "semibold" : undefined}>{step.title}</Text>
                        </span>
                    </button>
                })}
            </nav></SurfaceCard>

            <div className={playgroundSplitClassName}>
                <SurfaceCard composition="joined"><section className={playgroundTaskClassName}>
                    {current === undefined ? null : <><header className={playgroundTaskHeaderClassName}>
                        <Text size={"xs"} tone={"muted"} weight={"semibold"}>{`${props.props.stepLabel} ${props.props.selectedStepIndex + 1}`}</Text>
                        <Heading level={2}>{current.title}</Heading>
                    </header>
                    <Article props={{ body: current.body }} /></>}
                    {actionHint === undefined ? null : <div className={playgroundHintClassName}><Text size={"sm"}>{actionHint}</Text></div>}
                    <div className={playgroundWorkbenchClassName}>
                        <Heading level={3}>{scratchpadTitle}</Heading>
                        {props.props.scratchpadDescription === undefined ? null : <Text size={"xs"} tone={"muted"}>{props.props.scratchpadDescription}</Text>}
                        <Textarea key={current?.id ?? "empty"} props={{ id: "playground-command-scratchpad", name: "playground-command-scratchpad", label: scratchpadTitle, defaultValue: commandHint, rows: 6, disabled: sessionState !== "live" }} />
                        <div className={playgroundVerifyActionClassName}>
                            {sessionState !== "live" || current === undefined || props.props.passedStepIndexes.includes(props.props.selectedStepIndex) ? null : <Button variant="primary" isDisabled={props.props.isVerifying} isPending={props.props.isVerifying} onPress={props.on.submit}>{props.props.isVerifying ? props.props.verifyingLabel ?? props.props.submitLabel : props.props.submitLabel}</Button>}
                            <Button variant="ghost" size="sm" onPress={props.on.leave}>{props.props.leaveLabel}</Button>
                        </div>
                    </div>
                </section></SurfaceCard>

                <SurfaceCard composition="joined"><aside className={playgroundActivityClassName}>
                    <div className={playgroundActivityHeaderClassName}>
                        {props.props.outputTitle === undefined ? null : <Heading level={2}>{props.props.outputTitle}</Heading>}
                        {sessionState === "reconnecting" && props.props.reconnectText !== undefined ? <Text size={"sm"} tone={"muted"}>{props.props.reconnectText}</Text> : null}
                        {sessionState === "reconnecting" ? <Button variant="secondary" size="sm" onPress={props.on.retry}>{props.props.retryLabel}</Button> : null}
                    </div>
                    <div className={playgroundActivityListClassName}>
                        {props.props.passedStepIndexes.length === 0
                            ? props.props.outputWaiting === undefined ? null : <Text size={"sm"} tone={"muted"}>{props.props.outputWaiting}</Text>
                            : props.props.passedStepIndexes.map((index) => <div className={playgroundActivityRowClassName} key={index}>
                                <Icon source={iconSourceFor("complete", "leading")} role={"leading"} />
                                <div className={playgroundStepCopyClassName}>
                                    <Text size={"sm"} weight={"semibold"}>{props.props.steps[index]?.title ?? `${props.props.stepLabel} ${index + 1}`}</Text>
                                    <Text size={"xs"} tone={"muted"}>{props.props.passedLabel}</Text>
                                </div>
                            </div>)}
                    </div>
                </aside></SurfaceCard>
            </div>
        </>}
    </section>
}
