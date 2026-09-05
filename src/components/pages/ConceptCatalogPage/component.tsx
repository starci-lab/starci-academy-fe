import { Badge, EmptyNotice, Heading, PageContainer, SurfaceCard, Text } from "@starci/grammar/common"
import type { ConceptSummary } from "@/modules/api/graphql/queries/types/concept"
import {
    catalogCardBodyClassName,
    catalogCardCopyClassName,
    catalogCardFootClassName,
    catalogCardMetaClassName,
    catalogGridClassName,
    catalogHeaderClassName,
    catalogPageClassName,
} from "./classNames"

/** Transport and content states the catalog can truthfully present. */
export type ConceptCatalogState = "pending" | "ready" | "empty" | "failed"

/** Localized copy required by the pure catalog renderer. */
export interface ConceptCatalogLabels {
    readonly eyebrow: string
    readonly title: string
    readonly description: string
    readonly empty: string
    readonly failed: string
    readonly retry: string
    readonly open: (title: string) => string
    readonly minutes: (count: number) => string
    readonly category: (value: string) => string
    readonly difficulty: (value: string) => string
}

/** Closed data and actions accepted by the public concept catalog. */
export interface ConceptCatalogPageProps {
    readonly state: ConceptCatalogState
    readonly concepts: ReadonlyArray<ConceptSummary & { readonly href: string }>
    readonly labels: ConceptCatalogLabels
    readonly onRetry?: () => void
}

const RestingCard = () => (
    <SurfaceCard state="pending" composition="single">
        <div className={catalogCardBodyClassName}>
            <Heading level={2} isSkeleton>Loading concept</Heading>
            <Text isSkeleton>Loading the concept summary.</Text>
        </div>
    </SurfaceCard>
)

/** Draw the complete public concept catalog from API records only. */
export const ConceptCatalogPageBase = (props: ConceptCatalogPageProps) => {
    const { state, concepts, labels, onRetry } = props
    return <main>
        <PageContainer className={catalogPageClassName}>
            <header className={catalogHeaderClassName}>
                <Text size="sm" tone="accent" weight="semibold">{labels.eyebrow}</Text>
                <Heading level={1}>{labels.title}</Heading>
                <Text tone="muted">{labels.description}</Text>
            </header>
            {state === "failed" ? (
                <EmptyNotice message={labels.failed} actionLabel={labels.retry} onAction={onRetry} />
            ) : state === "empty" ? (
                <EmptyNotice message={labels.empty} />
            ) : (
                <section aria-label={labels.title} className={catalogGridClassName}>
                    {state === "pending" ? [0, 1, 2].map((index) => <RestingCard key={index} />) : concepts.map((concept) => (
                        <SurfaceCard
                            key={concept.displayId}
                            composition="single"
                            wholeAction={{ kind: "link", href: concept.href, label: labels.open(concept.title) }}
                        >
                            <div className={catalogCardBodyClassName}>
                                <div className={catalogCardMetaClassName}>
                                    <Badge tone="accent">{labels.category(concept.category)}</Badge>
                                    <Badge>{labels.difficulty(concept.difficulty)}</Badge>
                                </div>
                                <div className={catalogCardCopyClassName}>
                                    <Heading level={2}>{concept.title}</Heading>
                                    <Text tone="muted">{concept.description}</Text>
                                </div>
                                <div className={catalogCardFootClassName}>
                                    <Text size="sm" weight="semibold">{concept.implementation}</Text>
                                    <Text size="sm" tone="muted">{labels.minutes(concept.minutesRead)}</Text>
                                </div>
                            </div>
                        </SurfaceCard>
                    ))}
                </section>
            )}
        </PageContainer>
    </main>
}
