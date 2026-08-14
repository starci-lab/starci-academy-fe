import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
    type BlockProps,
} from "@/components/contracts/props"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { Textarea } from "@/components/leaves/Textarea"

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
export type ContentDiscussionPanelProps = BlockProps<ContentDiscussionPanelState, ContentDiscussionPanelData> & {
    readonly on?: ContentDiscussionPanelActions
}

const PENDING_COMMENTS: ReadonlyArray<ContentDiscussionComment> = Array.from(
    { length: 3 },
    (_unused, index) => ({ id: `pending-${index}`, author: "", meta: "", body: "" }),
)

/** Draws top-level lesson comments and their composer without reading transport. */
export const _ContentDiscussionPanel = (input: ContentDiscussionPanelProps) => {
    const isLoading = input.state === "pending"
    const isSubmitting = input.state === "submitting"
    const comments = isLoading ? PENDING_COMMENTS : input.props.comments
    const canCompose = input.state === "ready" || input.state === "empty" || isSubmitting

    const list = defineContractComponent("content-discussion-list", {
        comment: comments.map((comment) => defineContractComponent("content-discussion-comment-row", {
            author: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                <Text
                    props={{ content: comment.author, size: "sm", weight: "semibold" }}
                    isLoading={isLoading}
                />
            )),
            meta: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: comment.meta, size: "xs", tone: "muted" }} isLoading={isLoading} />
            )),
            body: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: comment.body, size: "sm" }} isLoading={isLoading} />
            )),
        })),
    })

    return (
        <Tree
            contract="content-discussion-panel"
            render={defineContractComponent("content-discussion-panel", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.labels.title, level: 2 }} />
                )),
                ...(canCompose ? {
                    composer: defineLeafComponent("textarea", {}, () => (
                        <Textarea
                            key={input.props.draftKey}
                            props={{
                                id: "content-discussion-comment",
                                name: "content-discussion-comment",
                                label: input.props.labels.composerLabel,
                                placeholder: input.props.labels.placeholder,
                                defaultValue: input.props.draft,
                                rows: 3,
                                disabled: isSubmitting,
                            }}
                            on={{ change: input.on?.changeDraft }}
                        />
                    )),
                    submit: defineLeafComponent("button", {}, () => (
                        <Button
                            props={{
                                label: isSubmitting ? input.props.labels.submitting : input.props.labels.submit,
                                variant: "primary",
                                icon: "send",
                                disabled: input.props.draft.trim() === "",
                                isPending: isSubmitting,
                            }}
                            on={{ press: input.on?.submit }}
                        />
                    )),
                } : {}),
                ...(input.state === "failed" || input.state === "empty" ? {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{
                                icon: input.state === "failed" ? "retry" : "community",
                                message: input.state === "failed"
                                    ? input.props.labels.failed
                                    : input.props.labels.empty,
                                actionLabel: input.state === "failed" ? input.props.labels.retry : undefined,
                            }}
                            on={{ act: input.state === "failed" ? input.on?.retry : undefined }}
                        />
                    )),
                } : {}),
                ...(input.state === "failed" || input.state === "empty" ? {} : { list }),
            })}
        />
    )
}

/** Architectural identity for the pure discussion block. */
export const meta = { world: "pure", domain: "learn" } as const
