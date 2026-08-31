import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Icon } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
import { LeadingNumber } from "@starci/grammar/core"
import type { Playground } from "@/modules/api/graphql/queries/query-playground"
import {
    playgroundActionsClassName,
    playgroundNoticeClassName,
    playgroundPairingClassName,
    playgroundPairingCodeClassName,
    playgroundPairingCodeValueClassName,
    playgroundPairingHeaderClassName,
    playgroundPreparationClassName,
    playgroundPreparationStepClassName,
    playgroundSetupBackClassName,
    playgroundSetupClassName,
    playgroundSetupGridClassName,
    playgroundSetupHeaderClassName,
    playgroundSetupIdentityClassName,
    playgroundSetupIdentityIconClassName,
    playgroundSetupStageClassName,
    playgroundSetupStageCompleteClassName,
    playgroundSetupStageCurrentClassName,
    playgroundSetupStagesClassName,
    playgroundStatusClassName,
} from "./classNames"

/** Setup states rendered by the page-local pairing flow. */
export type CoursePlaygroundSetupState = "loading" | "not-found" | "unpaired" | "paired" | "ready" | "starting" | "failed"
/** Resolved setup copy, server state, and owner actions. */
export type PlaygroundSetupProps = {
    readonly state: CoursePlaygroundSetupState
    readonly props: {
        readonly playground?: Playground | null
        readonly titleFallback: string
        readonly preparationTitle: string
        readonly preparationSteps: ReadonlyArray<string>
        readonly startLabel: string
        readonly startingLabel: string
        readonly pairingLabel: string
        readonly waitingLabel: string
        readonly readyLabel: string
        readonly enterLabel: string
        readonly retryLabel: string
        readonly failedText: string
        readonly notFoundText?: string
        readonly pairingCode?: string
        readonly catalogLabel?: string
        readonly sessionTitle?: string
        readonly createDescription?: string
        readonly stageLabels?: ReadonlyArray<string>
        readonly copyLabel?: string
        readonly copiedLabel?: string
        readonly copied?: boolean
    }
    readonly on: {
        readonly start: () => void
        readonly enter: () => void
        readonly retry: () => void
        readonly back?: () => void
        readonly copy?: () => void
    }
}

const stageState = (state: CoursePlaygroundSetupState, index: number) => {
    const active = state === "paired" ? 1 : state === "ready" ? 2 : 0
    if (index < active) return "complete" as const
    if (index === active) return "current" as const
    return "upcoming" as const
}

/** Draw an explicit Create -> Pair -> Enter setup flow with truthful recovery. */
export const PlaygroundSetupBase = (props: PlaygroundSetupProps) => {
    const loading = props.state === "loading"
    const paired = props.state === "paired" || props.state === "ready"
    const unavailable = props.state === "not-found" || props.state === "failed"
    const stageLabels = props.props.stageLabels ?? []
    const statusCopy = props.state === "ready"
        ? props.props.readyLabel
        : props.state === "unpaired" || props.state === "starting"
            ? props.props.createDescription ?? props.props.startLabel
            : props.props.waitingLabel

    return <section className={playgroundSetupClassName}>
        <header className={playgroundSetupHeaderClassName}>
            {props.props.catalogLabel === undefined ? null : <div className={playgroundSetupBackClassName}>
                <Button props={{ label: props.props.catalogLabel, variant: "ghost", size: "sm", icon: "back" }} on={{ press: props.on.back }} />
            </div>}
            <div className={playgroundSetupIdentityClassName}>
                <div className={playgroundSetupIdentityIconClassName}><Icon props={{ name: "playground", role: "heading" }} isLoading={loading} /></div>
                <div className={playgroundSetupHeaderClassName}>
                    <Text props={{ content: props.props.titleFallback, size: "xs", tone: "muted", weight: "semibold" }} isLoading={loading} />
                    <Heading props={{ content: props.props.playground?.title ?? props.props.titleFallback, level: 1 }} isLoading={loading} />
                    {props.props.playground?.description ? <Text props={{ content: props.props.playground.description, size: "sm", tone: "muted" }} isLoading={loading} /> : null}
                </div>
            </div>
        </header>

        {unavailable ? <SurfaceCard props={{ measure: "form" }}><div className={playgroundNoticeClassName}>
            <div className={playgroundPairingHeaderClassName}>
                <Icon props={{ name: "incomplete", role: "heading" }} />
                <div>
                    <Heading props={{ content: props.state === "not-found" ? props.props.notFoundText ?? props.props.failedText : props.props.failedText, level: 2 }} />
                    <Text props={{ content: props.props.catalogLabel ?? props.props.retryLabel, size: "sm", tone: "muted" }} />
                </div>
            </div>
            <div className={playgroundActionsClassName}>
                <Button props={{ label: props.props.catalogLabel ?? props.props.titleFallback, variant: "primary", icon: "back" }} on={{ press: props.on.back }} />
                <Button props={{ label: props.props.retryLabel, variant: "secondary", icon: "retry" }} on={{ press: props.on.retry }} />
            </div>
        </div></SurfaceCard> : <>
            {stageLabels.length === 0 ? null : <ol className={playgroundSetupStagesClassName} aria-label={props.props.preparationTitle}>
                {stageLabels.slice(0, 3).map((label, index) => {
                    const stage = stageState(props.state, index)
                    return <li className={stage === "complete" ? playgroundSetupStageCompleteClassName : stage === "current" ? playgroundSetupStageCurrentClassName : playgroundSetupStageClassName} key={label} aria-current={stage === "current" ? "step" : undefined}>
                        <Icon props={{ name: stage === "complete" ? "complete" : stage === "current" ? "playground" : "pending", role: "leading" }} isLoading={loading} />
                        <Text props={{ content: label, size: "sm", weight: stage === "current" ? "semibold" : undefined }} isLoading={loading} />
                    </li>
                })}
            </ol>}

            <div className={playgroundSetupGridClassName}>
                <SurfaceCard><section className={playgroundPreparationClassName}>
                    <Heading props={{ content: props.props.preparationTitle, level: 2 }} isLoading={loading} />
                    {props.props.preparationSteps.map((step, index) => <div className={playgroundPreparationStepClassName} key={step}>
                        <LeadingNumber position={index + 1} />
                        <Text props={{ content: step, size: "sm" }} isLoading={loading} />
                    </div>)}
                </section></SurfaceCard>

                <SurfaceCard><aside className={playgroundPairingClassName}>
                    <div className={playgroundPairingHeaderClassName}>
                        <Icon props={{ name: props.state === "ready" ? "complete" : "playground", role: "heading" }} isLoading={loading} />
                        <div>
                            <Heading props={{ content: props.props.sessionTitle ?? props.props.startLabel, level: 2 }} isLoading={loading} />
                        </div>
                    </div>

                    {!paired ? null : <div className={playgroundPairingCodeClassName}>
                        <Text props={{ content: props.props.pairingLabel, size: "xs", tone: "muted", weight: "semibold" }} />
                        <span className={playgroundPairingCodeValueClassName}>{props.props.pairingCode}</span>
                        {props.props.copyLabel === undefined ? null : <div className={playgroundActionsClassName}>
                            <Button props={{ label: props.props.copied ? props.props.copiedLabel ?? props.props.copyLabel : props.props.copyLabel, variant: "tertiary", size: "sm", icon: props.props.copied ? "complete" : "code" }} on={{ press: props.on.copy }} />
                        </div>}
                    </div>}

                    <div className={playgroundStatusClassName}>
                        <Icon props={{ name: props.state === "ready" ? "complete" : "pending", role: "leading" }} isLoading={loading} />
                        <Text props={{ content: statusCopy, size: "sm", tone: "muted", live: "polite" }} isLoading={loading} />
                    </div>

                    <div className={playgroundActionsClassName}>
                        <Button
                            props={{
                                label: paired ? props.props.enterLabel : props.state === "starting" ? props.props.startingLabel : props.props.startLabel,
                                variant: "primary",
                                icon: paired ? "next" : "playground",
                                iconPlacement: paired ? "trailing" : "leading",
                                disabled: paired && props.state !== "ready",
                                isPending: props.state === "starting",
                            }}
                            on={{ press: paired ? props.on.enter : props.on.start }}
                            isLoading={loading}
                        />
                    </div>
                </aside></SurfaceCard>
            </div>
        </>}
    </section>
}
