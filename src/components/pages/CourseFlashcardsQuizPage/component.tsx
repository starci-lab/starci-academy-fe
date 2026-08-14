import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
} from "@/components/contracts/props"

/** Pure quiz-setup contract after configuration facts and actions resolve. */
export type CourseFlashcardsQuizPageProps = {
    readonly state: "pending" | "ready" | "empty" | "failed"
    readonly props: {
        readonly title: string
        readonly subtitle: string
        readonly reviewLabel: string
        readonly quizLabel: string
        readonly configurationTitle: string
        readonly modeLabel: string
        readonly quickLabel: string
        readonly deepLabel: string
        readonly levelLabel: string
        readonly allLevelsLabel: string
        readonly juniorLabel: string
        readonly middleLabel: string
        readonly seniorLabel: string
        readonly staffLabel: string
        readonly startLabel: string
        readonly resumeLabel: string
        readonly retryLabel: string
        readonly emptyText: string
        readonly failedText: string
        readonly selectedMode: "quick" | "deep"
        readonly selectedLevel: string | null
        readonly cardCount: number
        readonly cardsLabel: string
        readonly resumeSessionId?: string
    }
    readonly on: {
        readonly openReview: () => void
        readonly selectMode: (mode: "quick" | "deep") => void
        readonly selectLevel: (level: string | null) => void
        readonly start: () => void
        readonly resume: (sessionId: string) => void
        readonly retry: () => void
    }
}

/** Renders the legacy quiz setup hierarchy without fetching or routing internally. */
export const _CourseFlashcardsQuizPage = (input: CourseFlashcardsQuizPageProps) => {
    const state = input.state
    const data = input.props
    const on = input.on
    const isLoading = state === "pending"
    const levels = [
        { id: null, label: data.allLevelsLabel },
        { id: "junior", label: data.juniorLabel },
        { id: "middle", label: data.middleLabel },
        { id: "senior", label: data.seniorLabel },
        { id: "staff", label: data.staffLabel },
    ] as const
    const header = defineContractComponent("centred-title-pair", {
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: data.title, level: 1 }} isLoading={isLoading} />
        )),
        description: defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: data.subtitle, size: "sm", tone: "muted" }} isLoading={isLoading} />
        )),
    })
    const modes = defineContractComponent("flashcard-mode-tabs", {
        tab: [
            defineLeafComponent("nav-link", { kind: "tab" }, () => (
                <NavLink props={{ label: data.reviewLabel, kind: "tab" }} on={{ press: on.openReview }} />
            )),
            defineLeafComponent("nav-link", { kind: "tab" }, () => (
                <NavLink props={{ label: data.quizLabel, kind: "tab", isCurrent: true }} />
            )),
        ],
    })
    const configuration = state === "ready" || state === "pending"
        ? defineContractComponent("flashcard-quiz-configuration", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: data.configurationTitle, level: 2 }} isLoading={isLoading} />
            )),
            fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: `${data.cardCount} ${data.cardsLabel}`, size: "sm", tone: "muted" }} isLoading={isLoading} />
            )),
            resume: data.resumeSessionId === undefined
                ? undefined
                : defineLeafComponent("button", {}, () => (
                    <Button props={{ label: data.resumeLabel, variant: "outline" }} on={{ press: () => on.resume(data.resumeSessionId ?? "") }} />
                )),
            modeLabel: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                <Text props={{ content: data.modeLabel, size: "sm", weight: "semibold" }} isLoading={isLoading} />
            )),
            mode: (["quick", "deep"] as const).map((mode) => defineLeafComponent("button", {}, () => (
                <Button
                    props={{
                        label: mode === "quick" ? data.quickLabel : data.deepLabel,
                        variant: data.selectedMode === mode ? "primary" : "outline",
                    }}
                    on={{ press: () => on.selectMode(mode) }}
                    isLoading={isLoading}
                />
            ))),
            levelLabel: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                <Text props={{ content: data.levelLabel, size: "sm", weight: "semibold" }} isLoading={isLoading} />
            )),
            level: levels.map((level) => defineLeafComponent("button", {}, () => (
                <Button
                    props={{
                        label: level.label,
                        variant: data.selectedLevel === level.id ? "primary" : "outline",
                    }}
                    on={{ press: () => on.selectLevel(level.id) }}
                    isLoading={isLoading}
                />
            ))),
            start: defineLeafComponent("button", {}, () => (
                <Button props={{ label: data.startLabel, variant: "primary" }} on={{ press: on.start }} isLoading={isLoading} />
            )),
        })
        : undefined
    const notice = state === "failed" || state === "empty"
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    message: state === "failed" ? data.failedText : data.emptyText,
                    actionLabel: state === "failed" ? data.retryLabel : undefined,
                }}
                on={{ act: on.retry }}
            />
        ))
        : undefined

    return (
        <Tree contract="course-flashcards-quiz-page" render={defineContractComponent("course-flashcards-quiz-page", {
            header,
            modes,
            configuration,
            notice,
        })} />
    )
}

/** Canon metadata for the pure page half. */
export const meta = { world: "pure", domain: "learn" } as const
