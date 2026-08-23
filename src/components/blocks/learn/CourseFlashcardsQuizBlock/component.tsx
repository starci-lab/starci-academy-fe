import { Tree } from "@/components/branches/Tree"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Input } from "@/components/leaves/Input"
import { NavLink } from "@/components/leaves/NavLink"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type LeafProps,
} from "@/components/contracts/props"

/** Local evidence panel selected independently from the review/quiz route mode. */
export type FlashcardQuizView = "setup" | "history" | "stats"
/** Transport state for the quiz workspace. */
export type CourseFlashcardsQuizBlockState = "pending" | "ready" | "empty" | "failed"
/** Page-owned evidence tab state. */
export type CourseFlashcardsQuizPageState = FlashcardQuizView
/** One comparable quiz history or coverage row. */
export type FlashcardQuizEvidenceRow = { readonly id: string, readonly title: string, readonly description: string, readonly fact: string }

/** Pure quiz-setup contract after configuration facts and actions resolve. */
export type CourseFlashcardsQuizBlockProps = {
    readonly pageState: CourseFlashcardsQuizPageState
    readonly blockState: CourseFlashcardsQuizBlockState
    readonly props: {
        readonly title: string
        readonly subtitle: string
        readonly reviewLabel: string
        readonly quizLabel: string
        readonly setupLabel: string
        readonly historyLabel: string
        readonly statsLabel: string
        readonly activeView: FlashcardQuizView
        readonly evidenceTitle: string
        readonly evidenceRows: ReadonlyArray<FlashcardQuizEvidenceRow>
        readonly configurationTitle: string
        readonly sessionNameLabel: string
        readonly sessionNamePlaceholder: string
        readonly sessionName: string
        readonly scopeLabel: string
        readonly allScopeLabel: string
        readonly dueScopeLabel: string
        readonly selectedScope: "all" | "due"
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
        readonly selectView: (view: FlashcardQuizView) => void
        readonly selectMode: (mode: "quick" | "deep") => void
        readonly changeSessionName: (value: string) => void
        readonly selectScope: (scope: "all" | "due") => void
        readonly selectLevel: (level: string | null) => void
        readonly start: () => void
        readonly resume: (sessionId: string) => void
        readonly retry: () => void
    }
}
/** Compatibility name for the quiz presentation contract. */
export type CourseFlashcardsQuizPageProps = CourseFlashcardsQuizBlockProps

type EvidenceListData = SurfaceListCardData & { readonly rows: ReadonlyArray<FlashcardQuizEvidenceRow> }
const EvidenceListView = ({ props, isLoading }: LeafProps<EvidenceListData>) => (
    <Tree contract="flashcard-evidence-list" render={defineContractComponent("flashcard-evidence-list", {
        row: props.rows.map((row) => defineContractComponent("flashcard-evidence-row", {
            title: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => <Text props={{ content: row.title, size: "sm", weight: "medium" }} isLoading={isLoading} />),
            description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: row.description, size: "sm", tone: "muted" }} isLoading={isLoading} />),
            fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: row.fact, size: "xs", tone: "muted" }} isLoading={isLoading} />),
        })),
    })} />
)
const EvidenceList = defineContractComponent("flashcard-evidence-list", EvidenceListView)

/** Renders the legacy quiz setup hierarchy without fetching or routing internally. */
export const CourseFlashcardsQuizBlockBase = (input: CourseFlashcardsQuizBlockProps) => {
    const pageState = input.pageState
    const blockState = input.blockState
    const data = input.props
    const on = input.on
    const resumeSessionId = data.resumeSessionId
    const isLoading = blockState === "pending"
    const levels = [
        { id: null, label: data.allLevelsLabel },
        { id: "junior", label: data.juniorLabel },
        { id: "middle", label: data.middleLabel },
        { id: "senior", label: data.seniorLabel },
        { id: "staff", label: data.staffLabel },
    ] as const
    const header = defineContractComponent("learn-page-title-pair", {
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: data.title, level: 1 }} />
        )),
        description: defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: data.subtitle, size: "sm", tone: "muted" }} />
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
    const views = defineContractComponent("flashcard-view-tabs", {
        tab: (["setup", "history", "stats"] as const).map((view) => defineLeafComponent("nav-link", { kind: "tab" }, () => (
            <NavLink props={{ label: view === "setup" ? data.setupLabel : view === "history" ? data.historyLabel : data.statsLabel, kind: "tab", isCurrent: pageState === view }} on={{ press: () => on.selectView(view) }} />
        ))),
    })
    const toolbar = defineContractComponent("flashcard-dual-tab-toolbar", { mode: modes, view: views })
    const configuration = (blockState === "ready" || blockState === "pending") && pageState === "setup"
        ? defineContractComponent("flashcard-quiz-configuration", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: data.configurationTitle, level: 2 }} isLoading={isLoading} />
            )),
            fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: `${data.cardCount} ${data.cardsLabel}`, size: "sm", tone: "muted" }} isLoading={isLoading} />
            )),
            resume: resumeSessionId === undefined
                ? undefined
                : defineLeafComponent("button", {}, () => (
                    <Button props={{ label: data.resumeLabel, variant: "outline" }} on={{ press: () => on.resume(resumeSessionId) }} />
                )),
            nameLabel: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                <Text props={{ content: data.sessionNameLabel, size: "sm", weight: "semibold" }} isLoading={isLoading} />
            )),
            name: defineLeafComponent("input", {}, () => (
                <Input props={{ id: "flashcard-quiz-session-name", name: "sessionName", kind: "text", placeholder: data.sessionNamePlaceholder, defaultValue: data.sessionName }} on={{ change: on.changeSessionName }} isLoading={isLoading} />
            )),
            scopeLabel: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                <Text props={{ content: data.scopeLabel, size: "sm", weight: "semibold" }} isLoading={isLoading} />
            )),
            scope: (["all", "due"] as const).map((scope) => defineLeafComponent("button", {}, () => (
                <Button props={{ label: scope === "all" ? data.allScopeLabel : data.dueScopeLabel, variant: data.selectedScope === scope ? "primary" : "outline" }} on={{ press: () => on.selectScope(scope) }} isLoading={isLoading} />
            ))),
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
    const visibleEvidenceRows = blockState === "pending" ? Array.from({ length: 4 }, (_, index) => ({ id: `pending-${index}`, title: data.evidenceTitle, description: "", fact: "" })) : data.evidenceRows
    const evidence = (blockState === "ready" || blockState === "pending") && pageState !== "setup" ? defineContractProjection("flashcard-evidence-list", () => (
        <SurfaceListCard contract="flashcard-evidence-list" render={EvidenceList} props={{ label: data.evidenceTitle, rows: visibleEvidenceRows }} isLoading={isLoading} />
    )) : undefined
    const notice = blockState === "failed" || blockState === "empty"
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    message: blockState === "failed" ? data.failedText : data.emptyText,
                    actionLabel: blockState === "failed" ? data.retryLabel : undefined,
                }}
                on={{ act: on.retry }}
            />
        ))
        : undefined

    return (
        <Tree contract={"course-flashcards-quiz-page"} render={defineContractComponent("course-flashcards-quiz-page", {
            header,
            toolbar,
            configuration,
            evidenceTitle: (blockState === "ready" || blockState === "pending") && pageState !== "setup" ? defineLeafComponent("heading", {}, () => <Heading props={{ content: data.evidenceTitle, level: 2 }} isLoading={isLoading} />) : undefined,
            evidence,
            notice,
        })} />
    )
}

/** Canon metadata for the pure page half. */
export const meta = { world: "pure", domain: "learn" } as const

