import { ErrorMessage as HeroErrorMessage } from "@heroui/react"

/** Resolved copy for one surface-level failure. */
export type ErrorMessageData = {
    readonly content: string
}

/** Props for {@link ErrorMessage}. */
export type ErrorMessageProps = {
    readonly props: ErrorMessageData
}

/** Draw an assertive HeroUI error message for a non-field surface failure. */
export const ErrorMessage = (props: ErrorMessageProps) => (
    <HeroErrorMessage role="alert" aria-live="assertive">
        {props.props.content}
    </HeroErrorMessage>
)
