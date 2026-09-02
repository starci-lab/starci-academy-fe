import { SurfaceCard } from "@starci/grammar/common"
import { EmptyNotice } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import { Heading } from "@starci/grammar/common"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Text } from "@starci/grammar/common"
import type { PlaygroundSummary } from "@/modules/api/graphql/queries/query-playgrounds"
import {
    playgroundCatalogActionClassName,
    playgroundCatalogCardBodyClassName,
    playgroundCatalogCardClassName,
    playgroundCatalogCardTopClassName,
    playgroundCatalogClassName,
    playgroundCatalogEyebrowClassName,
    playgroundCatalogFactClassName,
    playgroundCatalogFactsClassName,
    playgroundCatalogGridClassName,
    playgroundCatalogHeaderClassName,
    playgroundCatalogHeroClassName,
    playgroundCatalogHeroContentClassName,
    playgroundCatalogHeroCopyClassName,
    playgroundCatalogIconClassName,
    playgroundCatalogMetaClassName,
    playgroundCatalogNoticeClassName,
    playgroundCatalogPreviewClassName,
    playgroundCatalogPreviewImageClassName,
    playgroundCatalogProcessClassName,
    playgroundCatalogProcessNumberClassName,
    playgroundCatalogProcessStepClassName,
    playgroundCatalogVerificationClassName,
} from "./classNames"

/** Catalog states exposed by the pure playground hub. */
export type CoursePlaygroundPageState = "pending" | "ready" | "empty" | "failed"
/** Resolved catalog data and navigation actions for the playground hub. */
export type CoursePlaygroundCatalogProps = {
    readonly state: CoursePlaygroundPageState
    readonly props: {
        readonly title: string
        readonly description: string
        readonly eyebrow: string
        readonly verifiedLabel: string
        readonly previewAlt: string
        readonly previewImageUrl?: string | null
        readonly startLabel: string
        readonly labsTitle: string
        readonly labsDescription: string
        readonly labCountLabel: string
        readonly labLabel: string
        readonly stepLabel: string
        readonly openLabel: string
        readonly emptyText: string
        readonly failedText: string
        readonly retryLabel: string
        readonly processTitle?: string
        readonly processSteps?: ReadonlyArray<string>
        readonly playgrounds: ReadonlyArray<PlaygroundSummary>
    }
    readonly on: { readonly openSetup: (slug: string) => void; readonly retry: () => void }
}

/** Draw the backend-owned playground catalog. */
export const CoursePlaygroundCatalogBase = (props: CoursePlaygroundCatalogProps) => {
    const loading = props.state === "pending"
    const isSettledNotice = props.state === "empty" || props.state === "failed"
    const rows = loading && props.props.playgrounds.length === 0
        ? Array.from({ length: 2 }, (_, index) => ({ id: `pending-${index}`, slug: `pending-${index}`, title: "", icon: null, stepCount: 0 }))
        : props.props.playgrounds
    const totalSteps = props.props.playgrounds.reduce((total, playground) => total + playground.stepCount, 0)
    const firstPlayground = props.props.playgrounds[0]
    const processSteps = props.props.processSteps ?? []

    return <section className={playgroundCatalogClassName}>
        <SurfaceCard composition="joined" state={loading ? "pending" : "neutral"}>
            <div className={playgroundCatalogHeroClassName}>
                <div className={playgroundCatalogHeroContentClassName}>
                    <div className={playgroundCatalogEyebrowClassName}>
                        <Icon source={iconSourceFor("playground", "chip")} usage={"chip"} isSkeleton={loading} />
                        <Text size={"sm"} weight={"semibold"} isSkeleton={loading}>{props.props.eyebrow}</Text>
                    </div>
                    <div className={playgroundCatalogHeroCopyClassName}>
                        <Heading level={1} isSkeleton={loading}>{props.props.title}</Heading>
                        <Text tone={"muted"} isSkeleton={loading}>{props.props.description}</Text>
                    </div>
                    {props.state === "failed" ? null : <div className={playgroundCatalogFactsClassName} aria-label={props.props.labsTitle}>
                        <div className={playgroundCatalogFactClassName}>
                            <Text weight={"semibold"} isSkeleton={loading}>{String(props.props.playgrounds.length)}</Text>
                            <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.labCountLabel}</Text>
                        </div>
                        <div className={playgroundCatalogFactClassName}>
                            <Text weight={"semibold"} isSkeleton={loading}>{String(totalSteps)}</Text>
                            <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.stepLabel}</Text>
                        </div>
                    </div>}
                    {firstPlayground === undefined || loading || isSettledNotice ? null : <div className={playgroundCatalogActionClassName}>
                        <Button variant={"primary"} onPress={({ press: () => props.on.openSetup(firstPlayground.slug) })?.press} endContent={<Icon source={iconSourceFor("next", "chip")} usage="chip" />}>{props.props.startLabel}</Button>
                    </div>}
                </div>
                <div className={playgroundCatalogPreviewClassName}>
                    {loading || props.props.previewImageUrl === null || props.props.previewImageUrl === undefined
                        ? <>
                            <div className={playgroundCatalogVerificationClassName}>
                                <Icon source={iconSourceFor("complete", "chip")} usage={"chip"} isSkeleton={loading} />
                                <Text size={"xs"} weight={"semibold"} isSkeleton={loading}>{props.props.verifiedLabel}</Text>
                            </div>
                            {props.props.processTitle === undefined ? null : <Heading level={2} isSkeleton={loading}>{props.props.processTitle}</Heading>}
                            <ol className={playgroundCatalogProcessClassName} aria-label={props.props.processTitle}>
                                {(loading && processSteps.length === 0 ? ["", "", ""] : processSteps).map((step, index) => <li className={playgroundCatalogProcessStepClassName} key={`${step}-${index}`}>
                                    <span className={playgroundCatalogProcessNumberClassName} aria-hidden>{index + 1}</span>
                                    <Text size={"sm"} weight={"semibold"} isSkeleton={loading}>{step}</Text>
                                </li>)}
                            </ol>
                        </>
                        : <>
                            <img src={props.props.previewImageUrl} alt={props.props.previewAlt} className={playgroundCatalogPreviewImageClassName} />
                            <div className={playgroundCatalogVerificationClassName}>
                                <Icon source={iconSourceFor("complete", "chip")} usage={"chip"} />
                                <Text size={"xs"} weight={"semibold"}>{props.props.verifiedLabel}</Text>
                            </div>
                        </>}
                </div>
            </div>
        </SurfaceCard>

        <header className={playgroundCatalogHeaderClassName}>
            <Heading level={2} isSkeleton={loading}>{props.props.labsTitle}</Heading>
            <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.labsDescription}</Text>
        </header>

        {isSettledNotice ? <SurfaceCard composition="joined"><div className={playgroundCatalogNoticeClassName}><EmptyNotice message={props.state === "failed" ? props.props.failedText : props.props.emptyText} actionLabel={props.state === "failed" ? props.props.retryLabel : undefined} iconSource={iconSourceFor(props.state === "failed" ? "incomplete" : "playground", "leading")} onAction={({ act: props.on.retry })?.act} /></div></SurfaceCard> : null}

        {isSettledNotice ? null : <ol className={playgroundCatalogGridClassName}>{rows.map((playground, index) => <li key={playground.id}>
            <SurfaceCard composition="joined" state={loading ? "pending" : "neutral"}>
                <article className={playgroundCatalogCardClassName}>
                    <div className={playgroundCatalogCardTopClassName}>
                        <Text size={"xs"} tone={"muted"} weight={"semibold"} isSkeleton={loading}>{`${props.props.labLabel} ${String(index + 1).padStart(2, "0")}`}</Text>
                        <div className={playgroundCatalogIconClassName}><Icon source={iconSourceFor("playground", "heading")} usage={"heading"} isSkeleton={loading} /></div>
                    </div>
                    <div className={playgroundCatalogCardBodyClassName}>
                        <Heading level={3} isSkeleton={loading}>{playground.title}</Heading>
                        <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{`${playground.stepCount} ${props.props.stepLabel}`}</Text>
                    </div>
                    <div className={playgroundCatalogMetaClassName}>
                        <span className={playgroundCatalogVerificationClassName}>
                            <Icon source={iconSourceFor("complete", "chip")} usage={"chip"} isSkeleton={loading} />
                            <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{props.props.verifiedLabel}</Text>
                        </span>
                        {loading ? null : <Button variant={"ghost"} size={"sm"} onPress={({ press: () => props.on.openSetup(playground.slug) })?.press} endContent={<Icon source={iconSourceFor("next", "chip")} usage="chip" />}>{props.props.openLabel}</Button>}
                    </div>
                </article>
            </SurfaceCard>
        </li>)}</ol>}
    </section>
}
