import { SurfaceCard, SurfaceCard as GrammarSurfaceCard, Button } from "@starci/grammar/common"

import { Heading } from "@starci/grammar/common"
import { Progress } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import type { FlashcardSessionMode } from "@/modules/api/graphql/queries/query-my-in-progress-flashcard-session"
import {
    flashcardEvidenceClassName,
    flashcardNextActionRailClassName,
    flashcardFactListClassName,
    flashcardFactRowClassName,
    flashcardResultActionClassName,
    flashcardResultBodyClassName,
    flashcardResultRecoveryClassName,
    flashcardResultWorkspaceClassName,
    flashcardStatClassName,
    flashcardStatGridClassName,
    flashcardSummaryClassName,
    nextActionClassName,
    titlePairClassName,
} from "./classNames"

/** One resolved weak-topic row from a persisted result projection. */
export type CourseFlashcardResultWeakTopic = {
    readonly tag: string
    readonly value: string
    readonly percent?: number
}

/** Pure result input after its route-specific projection resolves. */
export type CourseFlashcardResultBlockState = "pending" | "ready" | "failed"
/** Resolved flashcard result data and route actions owned by the block. */
export type FlashcardResultProps = {
    readonly blockState: CourseFlashcardResultBlockState
    readonly data: {
        readonly mode: FlashcardSessionMode
        readonly modeText: string
        readonly title: string
        readonly subtitle: string
        readonly scoreLabel: string
        readonly scoreText?: string
        readonly scorePercent?: number
        readonly reviewedLabel: string
        readonly reviewedText?: string
        readonly xpLabel: string
        readonly xpText?: string
        readonly durationLabel: string
        readonly durationText?: string
        readonly nextDueLabel: string
        readonly nextDueText?: string
        readonly breakdownTitle: string
        readonly gradeRows: ReadonlyArray<{ readonly label: string; readonly value: number }>
        readonly weakTopicsTitle: string
        readonly weakTopics: ReadonlyArray<CourseFlashcardResultWeakTopic>
        readonly failedText: string
        readonly retryLabel: string
        readonly retrySessionLabel: string
        readonly backLabel: string
    }
    readonly on: {
        readonly retryLoad: () => void
        readonly retrySession: () => void
        readonly back: () => void
    }
}

/** Renders the stable review/quiz result URL with score, history, and onward actions. */
export const FlashcardResultBase = (props: FlashcardResultProps) => {
    const { blockState, data, on } = props
    const isLoading = blockState === "pending"
    const statValues = [
        [data.scoreLabel, data.scoreText],
        [data.reviewedLabel, data.reviewedText],
        [data.xpLabel, data.xpText],
        [data.durationLabel, data.durationText],
    ] as const
    const grammarState = blockState === "pending" ? "pending" : blockState === "failed" ? "negative" : "affirmative"
    return (
        <GrammarSurfaceCard ariaLabel={data.title} frame="frameless" state={grammarState}>
            <main className={flashcardResultWorkspaceClassName}>
                {blockState === "failed" ? <SurfaceCard composition="joined"><section className={flashcardResultRecoveryClassName}>
                    <Heading level={1}>{data.title}</Heading>
                    <Text size={"md"}>{data.failedText}</Text>
                    <div className={flashcardResultActionClassName}>
                        <Button variant="primary" onPress={on.retryLoad}>{data.retryLabel}</Button>
                        <Button variant="outline" onPress={on.back}>{data.backLabel}</Button>
                    </div>
                </section></SurfaceCard> : <>
                    <SurfaceCard composition="joined"><section className={flashcardSummaryClassName}>
                        <Text size={"sm"} tone={"muted"}>{data.modeText}</Text>
                        <div className={titlePairClassName}><Heading level={1} isSkeleton={isLoading}>{data.title}</Heading><Text size={"sm"} tone={"muted"} isSkeleton={isLoading}>{data.subtitle}</Text></div>
                        <div className={flashcardStatGridClassName}>{statValues.map(([label, value]) => <div key={label} className={flashcardStatClassName}><Text size={"xs"} isSkeleton={isLoading}>{label}</Text><Heading level={2} isSkeleton={isLoading}>{value}</Heading></div>)}</div>
                        {data.scorePercent === undefined ? null : <Progress label={data.scoreLabel} value={data.scorePercent} isSkeleton={isLoading} />}
                    </section></SurfaceCard>
                    {blockState === "ready" ? <div className={flashcardResultBodyClassName}>
                        <div className={flashcardEvidenceClassName}>
                            {data.gradeRows.length === 0 ? null : <SurfaceCard label={data.breakdownTitle} composition="joined"><div className={flashcardFactListClassName}>{data.gradeRows.map((row) => <div key={row.label} className={flashcardFactRowClassName}><Text size={"sm"} weight={"medium"}>{row.label}</Text><Text size={"sm"} tone={"muted"}>{row.value.toString()}</Text></div>)}</div></SurfaceCard>}
                            {data.weakTopics.length === 0 ? null : <SurfaceCard label={data.weakTopicsTitle} composition="joined"><div className={flashcardFactListClassName}>{data.weakTopics.map((topic) => <div key={topic.tag} className={flashcardFactRowClassName}><Text size={"sm"} weight={"medium"}>{topic.tag}</Text><Text size={"sm"} tone={"muted"}>{topic.value}</Text>{topic.percent === undefined ? null : <Progress label={topic.tag} value={topic.percent} />}</div>)}</div></SurfaceCard>}
                        </div>
                        <div className={flashcardNextActionRailClassName}><SurfaceCard composition="joined"><aside className={nextActionClassName}>
                            {data.nextDueText === undefined ? null : <div className={titlePairClassName}><Heading level={3}>{data.nextDueLabel}</Heading><Text size={"sm"} weight={"semibold"}>{data.nextDueText}</Text></div>}
                            <Button variant="primary" onPress={on.retrySession}>{data.retrySessionLabel}</Button>
                            <Button variant="outline" onPress={on.back}>{data.backLabel}</Button>
                        </aside></SurfaceCard></div>
                    </div> : null}
                </>}
            </main>
        </GrammarSurfaceCard>
    )
}
