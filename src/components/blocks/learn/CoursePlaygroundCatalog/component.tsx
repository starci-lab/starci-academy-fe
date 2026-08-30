import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Icon } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
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
    playgroundCatalogPreviewClassName,
    playgroundCatalogPreviewImageClassName,
    playgroundCatalogVerificationClassName,
} from "./classNames"

/** Catalog states exposed by the pure playground hub. */
export type CoursePlaygroundPageState = "pending" | "ready" | "empty" | "failed"
/** Resolved catalog data and navigation actions for the playground hub. */
export type CoursePlaygroundCatalogProps = { readonly state: CoursePlaygroundPageState; readonly props: { readonly title: string; readonly description: string; readonly eyebrow: string; readonly verifiedLabel: string; readonly previewAlt: string; readonly previewImageUrl?: string | null; readonly startLabel: string; readonly labsTitle: string; readonly labsDescription: string; readonly labCountLabel: string; readonly labLabel: string; readonly stepLabel: string; readonly openLabel: string; readonly emptyText: string; readonly failedText: string; readonly retryLabel: string; readonly playgrounds: ReadonlyArray<PlaygroundSummary> }; readonly on: { readonly openSetup: (slug: string) => void; readonly retry: () => void } }

/** Draw the backend-owned playground catalog. */
export const CoursePlaygroundCatalogBase = (props: CoursePlaygroundCatalogProps) => {
    const loading = props.state === "pending"
    const rows = loading && props.props.playgrounds.length === 0 ? Array.from({ length: 3 }, (_, index) => ({ id: `pending-${index}`, slug: `pending-${index}`, title: "", icon: null, stepCount: 0 })) : props.props.playgrounds
    const totalSteps = props.props.playgrounds.reduce((total, playground) => total + playground.stepCount, 0)
    const firstPlayground = props.props.playgrounds[0]
    return <section className={playgroundCatalogClassName}>
        <SurfaceCard isLoading={loading}>
            <div className={playgroundCatalogHeroClassName}>
                <div className={playgroundCatalogHeroContentClassName}>
                    <div className={playgroundCatalogEyebrowClassName}>
                        <Icon props={{ name: "practice", role: "chip" }} isLoading={loading} />
                        <Text props={{ content: props.props.eyebrow, size: "sm", weight: "semibold" }} isLoading={loading} />
                    </div>
                    <div className={playgroundCatalogHeroCopyClassName}>
                        <Heading props={{ content: props.props.title, level: 1 }} isLoading={loading} />
                        <Text props={{ content: props.props.description, tone: "muted" }} isLoading={loading} />
                    </div>
                    <div className={playgroundCatalogFactsClassName}>
                        <div className={playgroundCatalogFactClassName}>
                            <Text props={{ content: String(props.props.playgrounds.length), weight: "semibold" }} isLoading={loading} />
                            <Text props={{ content: props.props.labCountLabel, size: "xs", tone: "muted" }} isLoading={loading} />
                        </div>
                        <div className={playgroundCatalogFactClassName}>
                            <Text props={{ content: String(totalSteps), weight: "semibold" }} isLoading={loading} />
                            <Text props={{ content: props.props.stepLabel, size: "xs", tone: "muted" }} isLoading={loading} />
                        </div>
                    </div>
                    {firstPlayground === undefined || loading ? null : <div className={playgroundCatalogActionClassName}>
                        <Button props={{ label: props.props.startLabel, variant: "primary", icon: "next", iconPlacement: "trailing" }} on={{ press: () => props.on.openSetup(firstPlayground.slug) }} />
                    </div>}
                </div>
                <div className={playgroundCatalogPreviewClassName}>
                    {loading || props.props.previewImageUrl === null || props.props.previewImageUrl === undefined
                        ? <div aria-hidden className={playgroundCatalogPreviewImageClassName} />
                        : <img src={props.props.previewImageUrl} alt={props.props.previewAlt} className={playgroundCatalogPreviewImageClassName} />}
                    <div className={playgroundCatalogVerificationClassName}>
                        <Text props={{ content: props.props.verifiedLabel, size: "xs", weight: "semibold" }} isLoading={loading} />
                    </div>
                </div>
            </div>
        </SurfaceCard>
        <header className={playgroundCatalogHeaderClassName}>
            <Heading props={{ content: props.props.labsTitle, level: 2 }} isLoading={loading} />
            <Text props={{ content: props.props.labsDescription, size: "sm", tone: "muted" }} isLoading={loading} />
        </header>
        {props.state === "empty" || props.state === "failed" ? <SurfaceCard><EmptyNotice props={{ message: props.state === "failed" ? props.props.failedText : props.props.emptyText, actionLabel: props.state === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.on.retry }} /></SurfaceCard> : null}
        {props.state === "empty" || props.state === "failed" ? null : <ol className={playgroundCatalogGridClassName}>{rows.map((playground, index) => <li key={playground.id}>
            <SurfaceCard isLoading={loading}>
                <article className={playgroundCatalogCardClassName}>
                    <div className={playgroundCatalogCardTopClassName}>
                        <Text props={{ content: `${props.props.labLabel} ${String(index + 1).padStart(2, "0")}`, size: "xs", tone: "muted", weight: "semibold" }} isLoading={loading} />
                        <div className={playgroundCatalogIconClassName} aria-hidden>{loading ? null : playground.icon ?? "⌁"}</div>
                    </div>
                    <div className={playgroundCatalogCardBodyClassName}>
                        <Heading props={{ content: playground.title, level: 3 }} isLoading={loading} />
                        <Text props={{ content: `${playground.stepCount} ${props.props.stepLabel}`, size: "sm", tone: "muted" }} isLoading={loading} />
                    </div>
                    <div className={playgroundCatalogMetaClassName}>
                        <Text props={{ content: props.props.verifiedLabel, size: "xs", tone: "muted" }} isLoading={loading} />
                        {loading ? null : <Button props={{ label: props.props.openLabel, variant: "ghost", size: "sm", icon: "next", iconPlacement: "trailing" }} on={{ press: () => props.on.openSetup(playground.slug) }} />}
                    </div>
                </article>
            </SurfaceCard>
        </li>)}</ol>}
    </section>
}
