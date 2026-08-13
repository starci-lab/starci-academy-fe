import { cn } from "@heroui/react"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `MessageBubble`: one message, and whose it is.
 *
 * Target path: `src/components/leaves/MessageBubble/index.tsx`.
 *
 * IT DOES NOT SIDE ITSELF. Which edge a message hangs from is a fact about the row it sits in, not
 * about the message, so `justify-end` and `justify-start` live in the two row contracts and this
 * file never writes a placement class. What it does own is its own SHAPE - a measure it will not
 * exceed, and the one corner that is square on the side it came from - because a bubble that spans
 * the whole column has stopped being a bubble and the corner is the only thing that says which
 * direction the message travelled.
 *
 * A FAILED MESSAGE KEEPS ITS TEXT. The retry sits inside the bubble beside the words it would
 * resend, because the alternative every messaging UI gets wrong once is clearing the box on send
 * and then losing the paragraph when the request fails.
 */

/** Who wrote it. */
export type MessageAuthor = "viewer" | "other"

/** Where a message has got to. Absent means it is simply sent. */
export type MessageStatus = "pending" | "failed"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type MessageBubbleData = {
    /** The message itself. */
    readonly content: string
    /** Whose it is - which decides its colours and its square corner, never its position. */
    readonly author: MessageAuthor
    /** The already-formatted time, as a reader would say it. */
    readonly timeLabel: string
    /** Whether it is still in flight or did not make it. */
    readonly status?: MessageStatus
    /** The already-resolved word on the retry control, required when the message failed. */
    readonly retryLabel?: string
}

/** What a failed message offers. */
export type MessageBubbleActions = {
    /** Called when the reader asks for the message to be sent again. */
    readonly retry?: () => void
}

/** Props for {@link MessageBubble}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type MessageBubbleProps = LeafProps<MessageBubbleData, MessageBubbleActions>

/** The shell every bubble wears, whoever wrote it. */
const BUBBLE_CLASSES = "flex max-w-md flex-col gap-1 rounded-2xl px-4 py-3"

/**
 * Draw one message.
 *
 * @param input - {@link MessageBubbleProps}
 */
export const MessageBubble = ({ props, on }: MessageBubbleProps) => {
    const isViewer = props.author === "viewer"

    return (
        <div
            data-tier="leaf"
            data-component="MessageBubble"
            data-author={props.author}
            data-status={props.status ?? "sent"}
            className={cn(
                BUBBLE_CLASSES,
                isViewer
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-default text-foreground",
                props.status === "pending" && "opacity-60",
            )}
        >
            <p className="text-sm whitespace-pre-line">{props.content}</p>
            <span className={cn("text-xs", isViewer ? "opacity-80" : "text-muted")}>
                {props.timeLabel}
            </span>
            {props.status === "failed" && props.retryLabel !== undefined ? (
                <button type="button" onClick={on?.retry} className="text-xs underline">
                    {props.retryLabel}
                </button>
            ) : null}
        </div>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
