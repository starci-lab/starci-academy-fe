import { SurfaceCard } from "@starci/grammar/common"

import { Heading } from "@starci/grammar/common"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"
import { Text } from "@starci/grammar/common"
import { LeadingNumber, Button } from "@starci/grammar/common"
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
                <Button variant="ghost" size="sm" onPress={props.on.back}>{props.props.catalogLabel}</Button>
            </div>}
            <div className={playgroundSetupIdentityClassName}>
                <div className={playgroundSetupIdentityIconClassName}><Icon source={iconSourceFor("playground", "heading")} usage={"heading"} isSkeleton={loading} /></div>
                <div className={playgroundSetupHeaderClassName}>
                    <Text size={"xs"} tone={"muted"} weight={"semibold"} isSkeleton={loading}>{props.props.titleFallback}</Text>
                    <Heading level={1} isSkeleton={loading}>{props.props.playground?.title ?? props.props.titleFallback}</Heading>
                    {props.props.playground?.description ? <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.playground.description}</Text> : null}
                </div>
            </div>
        </header>

        {unavailable ? <SurfaceCard measure={"form"} composition="joined"><div className={playgroundNoticeClassName}>
            <div className={playgroundPairingHeaderClassName}>
                <Icon source={iconSourceFor("incomplete", "heading")} usage={"heading"} />
                <div>
                    <Heading level={2}>{props.state === "not-found" ? props.props.notFoundText ?? props.props.failedText : props.props.failedText}</Heading>
                    <Text size={"sm"} tone={"muted"}>{props.props.catalogLabel ?? props.props.retryLabel}</Text>
                </div>
            </div>
            <div className={playgroundActionsClassName}>
                <Button variant="primary" onPress={props.on.back}>{props.props.catalogLabel ?? props.props.titleFallback}</Button>
                <Button variant="secondary" onPress={props.on.retry}>{props.props.retryLabel}</Button>
            </div>
        </div></SurfaceCard> : <>
            {stageLabels.length === 0 ? null : <ol className={playgroundSetupStagesClassName} aria-label={props.props.preparationTitle}>
                {stageLabels.slice(0, 3).map((label, index) => {
                    const stage = stageState(props.state, index)
                    return <li className={stage === "complete" ? playgroundSetupStageCompleteClassName : stage === "current" ? playgroundSetupStageCurrentClassName : playgroundSetupStageClassName} key={label} aria-current={stage === "current" ? "step" : undefined}>
                        <Icon source={iconSourceFor(stage === "complete" ? "complete" : stage === "current" ? "playground" : "pending", "leading")} usage={"leading"} isSkeleton={loading} />
                        <Text size={"sm"} weight={stage === "current" ? "semibold" : undefined} isSkeleton={loading}>{label}</Text>
                    </li>
                })}
            </ol>}

            <div className={playgroundSetupGridClassName}>
                <SurfaceCard composition="joined"><section className={playgroundPreparationClassName}>
                    <Heading level={2} isSkeleton={loading}>{props.props.preparationTitle}</Heading>
                    {props.props.preparationSteps.map((step, index) => <div className={playgroundPreparationStepClassName} key={step}>
                        <LeadingNumber position={index + 1} />
                        <Text size={"sm"} isSkeleton={loading}>{step}</Text>
                    </div>)}
                </section></SurfaceCard>

                <SurfaceCard composition="joined"><aside className={playgroundPairingClassName}>
                    <div className={playgroundPairingHeaderClassName}>
                        <Icon source={iconSourceFor(props.state === "ready" ? "complete" : "playground", "heading")} usage={"heading"} isSkeleton={loading} />
                        <div>
                            <Heading level={2} isSkeleton={loading}>{props.props.sessionTitle ?? props.props.startLabel}</Heading>
                        </div>
                    </div>

                    {!paired ? null : <div className={playgroundPairingCodeClassName}>
                        <Text size={"xs"} tone={"muted"} weight={"semibold"}>{props.props.pairingLabel}</Text>
                        <span className={playgroundPairingCodeValueClassName}>{props.props.pairingCode}</span>
                        {props.props.copyLabel === undefined ? null : <div className={playgroundActionsClassName}>
                            <Button variant="tertiary" size="sm" onPress={props.on.copy}>{props.props.copied ? props.props.copiedLabel ?? props.props.copyLabel : props.props.copyLabel}</Button>
                        </div>}
                    </div>}

                    <div className={playgroundStatusClassName}>
                        <Icon source={iconSourceFor(props.state === "ready" ? "complete" : "pending", "leading")} usage={"leading"} isSkeleton={loading} />
                        <Text size={"sm"} tone={"muted"} live={"polite"} isSkeleton={loading}>{statusCopy}</Text>
                    </div>

                    <div className={playgroundActionsClassName}>
                        <Button variant="primary" isDisabled={paired && props.state !== "ready"} isPending={props.state === "starting"} isSkeleton={loading} onPress={paired ? props.on.enter : props.on.start} endContent={paired ? <Icon source={iconSourceFor("next", "chip")} usage="chip" /> : undefined}>{paired ? props.props.enterLabel : props.state === "starting" ? props.props.startingLabel : props.props.startLabel}</Button>
                    </div>
                </aside></SurfaceCard>
            </div>
        </>}
    </section>
}
