import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { Textarea } from "@/components/leaves/Textarea"
import {
    contentDiscussionCommentClassName,
    contentDiscussionListClassName,
    contentDiscussionPanelClassName,
} from "./classNames"

/** One resolved top-level lesson comment. */
export type ContentDiscussionComment = {
    readonly id: string
    readonly author: string
    readonly meta: string
    readonly body: string
}

/** Already-resolved discussion copy. */
export type ContentDiscussionLabels = {
    readonly title: string
    readonly composerLabel: string
    readonly placeholder: string
    readonly submit: string
    readonly submitting: string
    readonly empty: string
    readonly failed: string
    readonly retry: string
}

/** Facts rendered by the lesson discussion. */
export type ContentDiscussionPanelData = {
    readonly labels: ContentDiscussionLabels
    readonly draft: string
    readonly draftKey: number
    readonly comments: ReadonlyArray<ContentDiscussionComment>
}

/** Actions emitted by the lesson discussion. */
export type ContentDiscussionPanelActions = {
    readonly changeDraft?: (value: string) => void
    readonly submit?: () => void
    readonly retry?: () => void
}

/** Finite transport and content states owned by the lesson discussion. */
export type ContentDiscussionPanelState = "pending" | "ready" | "empty" | "failed" | "submitting"

/** Props for the pure discussion block. */
export type ContentDiscussionPanelProps = {
    readonly state: ContentDiscussionPanelState
    readonly props: ContentDiscussionPanelData
    readonly on?: ContentDiscussionPanelActions
}

const PENDING_COMMENTS: ReadonlyArray<ContentDiscussionComment> = Array.from(
    { length: 3 },
    (_unused, index) => ({ id: `pending-${index}`, author: "", meta: "", body: "" }),
)

/** Draws top-level lesson comments and their composer without reading transport. */
export const ContentDiscussionPanelBase = (props: ContentDiscussionPanelProps) => {
    const isLoading = props.state === "pending"
    const isSubmitting = props.state === "submitting"
    const comments = isLoading ? PENDING_COMMENTS : props.props.comments
    const canCompose = props.state === "ready" || props.state === "empty" || isSubmitting

    return (
        <section className={contentDiscussionPanelClassName} aria-label={props.props.labels.title}>
            <Heading props={{ content: props.props.labels.title, level: 2 }} />
            {canCompose ? <>
                <Textarea
                    key={props.props.draftKey}
                    props={{
                        id: "content-discussion-comment",
                        name: "content-discussion-comment",
                        label: props.props.labels.composerLabel,
                        placeholder: props.props.labels.placeholder,
                        defaultValue: props.props.draft,
                        rows: 3,
                        disabled: isSubmitting,
                    }}
                    on={{ change: props.on?.changeDraft }}
                />
                <Button
                    props={{
                        label: isSubmitting ? props.props.labels.submitting : props.props.labels.submit,
                        variant: "primary",
                        icon: "send",
                        disabled: props.props.draft.trim() === "",
                        isPending: isSubmitting,
                    }}
                    on={{ press: props.on?.submit }}
                />
            </> : null}
            {props.state === "failed" || props.state === "empty" ? (
                <EmptyNotice
                    props={{
                        icon: props.state === "failed" ? "retry" : "community",
                        message: props.state === "failed" ? props.props.labels.failed : props.props.labels.empty,
                        actionLabel: props.state === "failed" ? props.props.labels.retry : undefined,
                    }}
                    on={{ act: props.state === "failed" ? props.on?.retry : undefined }}
                />
            ) : (
                <ul className={contentDiscussionListClassName}>
                    {comments.map((comment) => (
                        <li key={comment.id} className={contentDiscussionCommentClassName}>
                            <Text props={{ content: comment.author, size: "sm", weight: "semibold" }} isLoading={isLoading} />
                            <Text props={{ content: comment.meta, size: "xs", tone: "muted" }} isLoading={isLoading} />
                            <Text props={{ content: comment.body, size: "sm" }} isLoading={isLoading} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
