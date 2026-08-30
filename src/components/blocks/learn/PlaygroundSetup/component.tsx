import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { LeadingNumber } from "@starci/grammar/core"
import type { Playground } from "@/modules/api/graphql/queries/query-playground"
import {
    playgroundPairingClassName,
    playgroundPairingCodeClassName,
    playgroundPreparationClassName,
    playgroundPreparationStepClassName,
    playgroundSetupClassName,
    playgroundSetupGridClassName,
    playgroundSetupHeaderClassName,
} from "./classNames"
/** Setup and pairing states. */
export type CoursePlaygroundSetupState = "loading" | "not-found" | "unpaired" | "paired" | "ready" | "starting" | "failed"
/** Resolved setup copy and actions. */
export type PlaygroundSetupProps = { readonly state: CoursePlaygroundSetupState; readonly props: { readonly playground?: Playground | null; readonly titleFallback: string; readonly preparationTitle: string; readonly preparationSteps: ReadonlyArray<string>; readonly startLabel: string; readonly startingLabel: string; readonly pairingLabel: string; readonly waitingLabel: string; readonly readyLabel: string; readonly enterLabel: string; readonly retryLabel: string; readonly failedText: string; readonly notFoundText?: string; readonly pairingCode?: string }; readonly on: { readonly start: () => void; readonly enter: () => void; readonly retry: () => void } }
/** Draw playground setup, pairing progress and entry actions. */
export const PlaygroundSetupBase = (props: PlaygroundSetupProps) => {
    const loading = props.state === "loading"
    const paired = props.state === "paired" || props.state === "ready"
    if (props.state === "not-found") return <SurfaceCard><EmptyNotice props={{ message: props.props.notFoundText ?? props.props.failedText, actionLabel: props.props.retryLabel }} on={{ act: props.on.retry }} /></SurfaceCard>
    if (props.state === "failed") return <SurfaceCard><EmptyNotice props={{ message: props.props.failedText, actionLabel: props.props.retryLabel }} on={{ act: props.on.retry }} /></SurfaceCard>
    return <div className={playgroundSetupClassName}>
        <header className={playgroundSetupHeaderClassName}>
            <Text props={{ content: props.props.titleFallback, size: "xs", tone: "muted", weight: "semibold" }} isLoading={loading} />
            <Heading props={{ content: props.props.playground?.title ?? props.props.titleFallback, level: 1 }} isLoading={loading} />
            <Text props={{ content: props.props.playground?.description ?? "", size: "sm", tone: "muted" }} isLoading={loading} />
        </header>
        <div className={playgroundSetupGridClassName}>
            <SurfaceCard><section className={playgroundPreparationClassName}>
                <Heading props={{ content: props.props.preparationTitle, level: 2 }} isLoading={loading} />
                {props.props.preparationSteps.map((step, index) => <div className={playgroundPreparationStepClassName} key={step}><LeadingNumber position={index + 1} /><Text props={{ content: step, size: "sm" }} isLoading={loading} /></div>)}
            </section></SurfaceCard>
            <SurfaceCard><aside className={playgroundPairingClassName}>
                <div>
                    <Text props={{ content: paired ? props.props.pairingLabel : props.props.startLabel, size: "xs", tone: "muted", weight: "semibold" }} />
                    {paired ? <div className={playgroundPairingCodeClassName}><Text props={{ content: props.props.pairingCode, size: "sm", weight: "semibold" }} /></div> : null}
                </div>
                <Text props={{ content: props.state === "ready" ? props.props.readyLabel : props.props.waitingLabel, size: "sm", tone: "muted", live: "polite" }} />
                <Button props={{ label: paired ? props.props.enterLabel : props.state === "starting" ? props.props.startingLabel : props.props.startLabel, variant: "primary", disabled: paired && props.state !== "ready", isPending: props.state === "starting" }} on={{ press: paired ? props.on.enter : props.on.start }} isLoading={loading} />
            </aside></SurfaceCard>
        </div>
    </div>
}
