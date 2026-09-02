import { SurfaceCard } from "@starci/grammar/common"
import { SurfaceListCard } from "@starci/grammar/common"
import { EmptyNotice } from "@starci/grammar/common"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Button } from "@starci/grammar/common"
import { Heading } from "@starci/grammar/common"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Textarea } from "@/components/leaves/Textarea"

/** One resolved question or reply line. */
export type CourseQaThreadRow = { readonly id: string; readonly body: string; readonly meta: string; readonly replyLabel?: string }
type CourseQaPageData = { readonly title: string; readonly trail: ReadonlyArray<BreadcrumbStep>; readonly searchPlaceholder: string; readonly searchLabel: string; readonly clearSearchLabel: string; readonly askLabel: string; readonly askPlaceholder: string; readonly questionsLabel: string; readonly repliesLabel: string; readonly backLabel: string; readonly draftKey: number; readonly draft: string; readonly isSubmitting?: boolean; readonly questions: ReadonlyArray<CourseQaThreadRow>; readonly selectedQuestion?: CourseQaThreadRow; readonly replies: ReadonlyArray<CourseQaThreadRow>; readonly emptyMessage: string; readonly emptySearchMessage: string; readonly errorMessage: string; readonly retryLabel: string }
type CourseQaPageActions = { readonly course?: () => void; readonly search?: (query: string) => void; readonly changeDraft?: (value: string) => void; readonly ask?: () => void; readonly openThread?: (id: string) => void; readonly closeThread?: () => void; readonly retry?: () => void }
/** Resolved state, copy and actions for the pure Q&A board. */
export type CourseQaProps = { readonly state: "pending" | "ready" | "empty" | "failed"; readonly props: CourseQaPageData; readonly on?: CourseQaPageActions }

/** Draw the course Q&A list, composer and selected thread using ordinary JSX. */
export const CourseQaBase = (props: CourseQaProps) => {
    const loading = props.state === "pending"
    const selected = props.props.selectedQuestion !== undefined
    const rows = selected ? props.props.replies : props.props.questions
    const label = selected ? props.props.repliesLabel : props.props.questionsLabel
    const notice = props.state === "failed" || props.state === "empty"
    return <main aria-label={props.props.title}>
        <header><Breadcrumbs props={{ steps: props.props.trail, label: props.props.title }} on={{ course: props.on?.course }} /><Heading level={1}>{props.props.title}</Heading></header>
        <section><SearchBox props={{ placeholder: props.props.searchPlaceholder, label: props.props.searchLabel, clearLabel: props.props.clearSearchLabel }} on={{ search: props.on?.search }} /><SurfaceCard composition="joined"><Textarea key={props.props.draftKey} props={{ id: "course-question", name: "question", label: props.props.askLabel, placeholder: props.props.askPlaceholder, defaultValue: props.props.draft, rows: 3, disabled: props.props.isSubmitting }} on={{ change: props.on?.changeDraft }} /><Button variant="primary" isDisabled={props.props.draft.trim() === ""} isPending={props.props.isSubmitting} onPress={props.on?.ask}>{props.props.askLabel}</Button></SurfaceCard></section>
        {notice ? <EmptyNotice message={props.state === "failed" ? props.props.errorMessage : props.props.emptyMessage} actionLabel={props.state === "failed" ? props.props.retryLabel : undefined} iconSource={iconSourceFor(props.state === "failed" ? "retry" : "community", "leading")} onAction={({ act: props.on?.retry })?.act} /> : <section>{selected ? <Button variant="ghost" size="sm" onPress={props.on?.closeThread}>{props.props.backLabel}</Button> : null}<SurfaceListCard label={label} isLoading={loading}><ul aria-label={label}>{rows.length === 0 && !loading ? <EmptyNotice message={props.props.emptySearchMessage} /> : rows.map((row) => <li key={row.id}><Button variant="ghost" size="sm" onPress={selected ? undefined : () => props.on?.openThread?.(row.id)}>{row.replyLabel === undefined ? `${row.body} · ${row.meta}` : `${row.body} · ${row.meta} · ${row.replyLabel}`}</Button>{!selected ? <Icon source={iconSourceFor("disclosure", "chip")} usage={"chip"} /> : null}</li>)}</ul></SurfaceListCard></section>}
    </main>
}
