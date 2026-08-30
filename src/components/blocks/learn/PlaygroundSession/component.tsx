import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Article } from "@/components/branches/Article"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import { Textarea } from "@/components/leaves/Textarea"
import type { PlaygroundStep } from "@/modules/api/graphql/queries/query-playground"
import {
    playgroundIdentityClassName,
    playgroundSessionClassName,
    playgroundSplitClassName,
    playgroundStepRailClassName,
    playgroundTaskClassName,
    playgroundWorkbenchClassName,
    playgroundVerifyActionClassName,
    playgroundActivityClassName,
    playgroundActivityRowClassName,
} from "./classNames"

/** Live relay states exposed by the pure playground workspace. */
export type CoursePlaygroundSessionState = "connecting" | "live" | "reconnecting" | "completed" | "failed"

/** Resolved session steps, progress and owner actions. */
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
    }
    readonly on: {
        readonly step: (index: number) => void
        readonly submit: () => void
        readonly leave: () => void
        readonly retry: () => void
    }
}

/** Draw a live playground whose progress advances only from server `step:verified` events. */
export const PlaygroundSessionBase = (props: PlaygroundSessionProps) => {
    const sessionState = props.state
    const current = props.props.steps[props.props.selectedStepIndex]
    const commandHint = current?.commandHint ?? undefined
    const actionHint = current?.actionHint ?? undefined
    const scratchpadTitle = props.props.scratchpadTitle ?? props.props.submitLabel
    const settled = sessionState === "failed" || sessionState === "completed"
    const progressValue = props.props.steps.length === 0 ? 0 : Math.round((props.props.passedStepIndexes.length / props.props.steps.length) * 100)
    return <section className={playgroundSessionClassName}>
        <SurfaceCard><header className={playgroundIdentityClassName}>
            <Button props={{ label: props.props.leaveLabel, variant: "ghost" }} on={{ press: props.on.leave }} />
            <Heading props={{ content: current?.title ?? props.props.title, level: 1 }} />
            <Progress props={{ label: props.props.title, value: progressValue }} />
            <Text props={{ content: props.props.connectionText, size: "xs", tone: "muted", live: "polite" }} />
        </header></SurfaceCard>
        {settled ? <EmptyNotice props={{ message: sessionState === "completed" ? props.props.completedTitle : props.props.failedText, description: sessionState === "completed" ? props.props.completedText : undefined, actionLabel: sessionState === "completed" ? props.props.leaveLabel : props.props.retryLabel, actionIcon: sessionState === "completed" ? "back" : "retry" }} on={{ act: sessionState === "completed" ? props.on.leave : props.on.retry }} /> : <div className={playgroundSplitClassName}>
            <SurfaceCard><aside className={playgroundStepRailClassName}>{props.props.steps.map((step, index) => {
                const passed = props.props.passedStepIndexes.includes(index)
                const available = passed || index <= Math.max(0, props.props.passedStepIndexes.length)
                const status = passed ? `${props.props.passedLabel} · ` : ""
                return <NavLink key={step.id} props={{ label: `${props.props.stepLabel} ${index + 1} · ${status}${step.title}`, kind: "section", isCurrent: index === props.props.selectedStepIndex }} on={{ press: available ? () => props.on.step(index) : undefined }} />
            })}</aside></SurfaceCard>
            <SurfaceCard><section className={playgroundTaskClassName}>
                <Article props={{ body: current?.body }} />
                {actionHint === undefined ? null : <Text props={{ content: actionHint, size: "sm" }} />}
            </section></SurfaceCard>
            <div className={playgroundWorkbenchClassName}>
                <Heading props={{ content: scratchpadTitle, level: 2 }} />
                {props.props.scratchpadDescription === undefined ? null : <Text props={{ content: props.props.scratchpadDescription, size: "xs", tone: "muted" }} />}
                <Textarea key={current?.id ?? "empty"} props={{ id: "playground-command-scratchpad", name: "playground-command-scratchpad", label: scratchpadTitle, defaultValue: commandHint, rows: 6, disabled: sessionState !== "live" }} />
                {sessionState !== "live" || current === undefined || props.props.passedStepIndexes.includes(props.props.selectedStepIndex) ? null : <div className={playgroundVerifyActionClassName}><Button props={{ label: props.props.isVerifying ? props.props.verifyingLabel ?? props.props.submitLabel : props.props.submitLabel, variant: "primary", disabled: props.props.isVerifying, isPending: props.props.isVerifying }} on={{ press: props.on.submit }} /></div>}
            </div>
            {props.props.outputTitle === undefined ? null : <SurfaceCard><aside className={playgroundActivityClassName}>
                <Heading props={{ content: props.props.outputTitle, level: 2 }} />
                <div className={playgroundActivityRowClassName}><Text props={{ content: sessionState, size: "xs", tone: "muted" }} /></div>
                {props.props.passedStepIndexes.length === 0 ? props.props.outputWaiting === undefined ? null : <Text props={{ content: props.props.outputWaiting, size: "sm", tone: "muted" }} /> : props.props.passedStepIndexes.map((index) => <div className={playgroundActivityRowClassName} key={index}><Text props={{ content: props.props.steps[index]?.title ?? `${props.props.stepLabel} ${index + 1}`, size: "sm" }} /><Text props={{ content: props.props.passedLabel, size: "xs", tone: "muted" }} /></div>)}
            </aside></SurfaceCard>}
        </div>}
    </section>
}
