import { SurfaceFormCard } from "@/components/branches/SurfaceFormCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Icon } from "@/components/leaves/Icon"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import { Textarea } from "@/components/leaves/Textarea"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type BlockProps,
    type LeafProps,
} from "@/components/contracts/props"

/** One resolved question or reply line rendered by the Q&A list. */
export type CourseQaThreadRow = {
    readonly id: string
    readonly body: string
    readonly meta: string
    readonly replyLabel?: string
}

type CourseQaPageData = {
    readonly title: string
    readonly trail: ReadonlyArray<BreadcrumbStep>
    readonly searchPlaceholder: string
    readonly searchLabel: string
    readonly clearSearchLabel: string
    readonly askLabel: string
    readonly askPlaceholder: string
    readonly questionsLabel: string
    readonly repliesLabel: string
    readonly backLabel: string
    readonly draftKey: number
    readonly draft: string
    readonly isSubmitting?: boolean
    readonly questions: ReadonlyArray<CourseQaThreadRow>
    readonly selectedQuestion?: CourseQaThreadRow
    readonly replies: ReadonlyArray<CourseQaThreadRow>
    readonly emptyMessage: string
    readonly emptySearchMessage: string
    readonly errorMessage: string
    readonly retryLabel: string
}

type CourseQaPageActions = {
    readonly course?: () => void
    readonly search?: (query: string) => void
    readonly changeDraft?: (value: string) => void
    readonly ask?: () => void
    readonly openThread?: (id: string) => void
    readonly closeThread?: () => void
    readonly retry?: () => void
}

type CourseQaPageProps = BlockProps<"pending" | "ready" | "empty" | "failed", CourseQaPageData> & {
    readonly on?: CourseQaPageActions
}

type CourseQaListData = SurfaceListCardData & {
    readonly rows: ReadonlyArray<CourseQaThreadRow>
    readonly emptyMessage: string
}

type CourseQaListActions = {
    readonly [key: string]: (() => void) | undefined
}

const PENDING_QA_ROWS: ReadonlyArray<CourseQaThreadRow> = Array.from(
    { length: 4 },
    (_unused, index) => ({ id: `pending-${index}`, body: "", meta: "" }),
)

const CourseQaList = ({ props, on, isLoading = false }: LeafProps<CourseQaListData, CourseQaListActions>) => {
    const steps = !isLoading && props.rows.length === 0
        ? [defineContractProjection("next-action-row", () => <EmptyNotice props={{ message: props.emptyMessage }} />)]
        : (isLoading ? PENDING_QA_ROWS : props.rows).map((row) => defineContractComponent("next-action-row", {
            label: defineLeafComponent("text", { size: "md" }, () => (
                <Text
                    props={{
                        content: row.replyLabel === undefined ? `${row.body} · ${row.meta}` : `${row.body} · ${row.meta} · ${row.replyLabel}`,
                        size: "md",
                        isPressLabel: on?.[`open:${row.id}`] !== undefined,
                    }}
                    isLoading={isLoading}
                />
            )),
            ...(on?.[`open:${row.id}`] === undefined ? {} : {
                disclosure: defineLeafComponent("icon", {}, () => <Icon props={{ name: "disclosure", role: "chip" }} />),
            }),
        }))
    return <Tree contract="next-action-list" render={defineContractComponent("next-action-list", { step: steps })} />
}

const CourseQaListContent = defineContractComponent("next-action-list", CourseQaList)

/** Pure course Q&A list, inline ask form and one selected thread. */
export const _CourseQaPage = (input: CourseQaPageProps) => {
    const isLoading = input.state === "pending"
    const rows = input.props.selectedQuestion === undefined ? input.props.questions : input.props.replies
    const label = input.props.selectedQuestion === undefined ? input.props.questionsLabel : input.props.repliesLabel
    const listActions: CourseQaListActions = Object.fromEntries(
        input.props.questions.map((question) => [`open:${question.id}`, () => input.on?.openThread?.(question.id)]),
    )
    const header = defineContractComponent("page-header-stack", {
        trail: defineLeafComponent("breadcrumbs", {}, () => (
            <Breadcrumbs props={{ steps: input.props.trail, label: input.props.title }} on={{ course: input.on?.course }} />
        )),
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.title, level: 1 }} />),
    })
    const toolbar = defineContractProjection("catalog-search-count-view-row", () => (
        <>
            <SearchBox
                props={{
                    placeholder: input.props.searchPlaceholder,
                    label: input.props.searchLabel,
                    clearLabel: input.props.clearSearchLabel,
                }}
                on={{ search: input.on?.search }}
            />
            <SurfaceFormCard
                contract="stacked-peer-controls"
                render={defineContractComponent("stacked-peer-controls", {
                    control: [
                        defineContractProjection("spread-choice-row", () => (
                            <Textarea
                                key={input.props.draftKey}
                                props={{
                                    id: "course-question",
                                    name: "question",
                                    label: input.props.askLabel,
                                    placeholder: input.props.askPlaceholder,
                                    defaultValue: input.props.draft,
                                    rows: 3,
                                    disabled: input.props.isSubmitting,
                                }}
                                on={{ change: input.on?.changeDraft }}
                            />
                        )),
                        defineLeafComponent("button", {}, () => (
                            <Button
                                props={{
                                    label: input.props.askLabel,
                                    icon: "send",
                                    variant: "primary",
                                    isPending: input.props.isSubmitting,
                                    disabled: input.props.draft.trim() === "",
                                }}
                                on={{ press: input.on?.ask }}
                            />
                        )),
                    ],
                })}
            />
        </>
    ))

    const notice = input.state === "failed" || input.state === "empty"
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    icon: input.state === "failed" ? "retry" : "community",
                    message: input.state === "failed" ? input.props.errorMessage : input.props.emptyMessage,
                    actionLabel: input.state === "failed" ? input.props.retryLabel : undefined,
                }}
                on={{ act: input.state === "failed" ? input.on?.retry : undefined }}
            />
        ))
        : undefined

    return (
        <Tree contract="course-qa-page" render={defineContractComponent("course-qa-page", {
            header,
            composer: toolbar,
            ...(notice === undefined ? {
                thread: defineContractProjection("catalog-section-group", () => (
                    <>
                        {input.props.selectedQuestion === undefined ? null : (
                            <Button props={{ label: input.props.backLabel, variant: "ghost", size: "sm" }} on={{ press: input.on?.closeThread }} />
                        )}
                        <SurfaceListCard
                            contract="next-action-list"
                            render={CourseQaListContent}
                            props={{ label, rows, emptyMessage: input.props.emptySearchMessage }}
                            on={input.props.selectedQuestion === undefined ? listActions : undefined}
                            isLoading={isLoading}
                        />
                    </>
                )),
            } : { notice }),
        })} />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
