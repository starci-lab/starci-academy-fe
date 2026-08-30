import { SurfaceCard as GrammarSurfaceCard } from "@starci/grammar/core"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
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
                {blockState === "failed" ? <SurfaceCard><section className={flashcardResultRecoveryClassName}>
                    <Heading props={{ content: data.title, level: 1 }} />
                    <Text props={{ content: data.failedText, size: "md" }} />
                    <div className={flashcardResultActionClassName}>
                        <Button props={{ label: data.retryLabel, variant: "primary" }} on={{ press: on.retryLoad }} />
                        <Button props={{ label: data.backLabel, variant: "outline" }} on={{ press: on.back }} />
                    </div>
                </section></SurfaceCard> : <>
                    <SurfaceCard><section className={flashcardSummaryClassName}>
                        <Text props={{ content: data.modeText, size: "sm", tone: "muted" }} />
                        <div className={titlePairClassName}><Heading props={{ content: data.title, level: 1 }} isLoading={isLoading} /><Text props={{ content: data.subtitle, size: "sm", tone: "muted" }} isLoading={isLoading} /></div>
                        <div className={flashcardStatGridClassName}>{statValues.map(([label, value]) => <div key={label} className={flashcardStatClassName}><Text props={{ content: label, size: "xs" }} isLoading={isLoading} /><Heading props={{ content: value, level: 2 }} isLoading={isLoading} /></div>)}</div>
                        {data.scorePercent === undefined ? null : <Progress props={{ value: data.scorePercent, label: data.scoreLabel }} isLoading={isLoading} />}
                    </section></SurfaceCard>
                    {blockState === "ready" ? <div className={flashcardResultBodyClassName}>
                        <div className={flashcardEvidenceClassName}>
                            {data.gradeRows.length === 0 ? null : <SurfaceCard props={{ label: data.breakdownTitle }}><div className={flashcardFactListClassName}>{data.gradeRows.map((row) => <div key={row.label} className={flashcardFactRowClassName}><Text props={{ content: row.label, size: "sm", weight: "medium" }} /><Text props={{ content: row.value.toString(), size: "sm", tone: "muted" }} /></div>)}</div></SurfaceCard>}
                            {data.weakTopics.length === 0 ? null : <SurfaceCard props={{ label: data.weakTopicsTitle }}><div className={flashcardFactListClassName}>{data.weakTopics.map((topic) => <div key={topic.tag} className={flashcardFactRowClassName}><Text props={{ content: topic.tag, size: "sm", weight: "medium" }} /><Text props={{ content: topic.value, size: "sm", tone: "muted" }} />{topic.percent === undefined ? null : <Progress props={{ value: topic.percent, label: topic.tag }} />}</div>)}</div></SurfaceCard>}
                        </div>
                        <div className={flashcardNextActionRailClassName}><SurfaceCard><aside className={nextActionClassName}>
                            {data.nextDueText === undefined ? null : <div className={titlePairClassName}><Heading props={{ content: data.nextDueLabel, level: 3 }} /><Text props={{ content: data.nextDueText, size: "sm", weight: "semibold" }} /></div>}
                            <Button props={{ label: data.retrySessionLabel, variant: "primary" }} on={{ press: on.retrySession }} />
                            <Button props={{ label: data.backLabel, variant: "outline" }} on={{ press: on.back }} />
                        </aside></SurfaceCard></div>
                    </div> : null}
                </>}
            </main>
        </GrammarSurfaceCard>
    )
}
