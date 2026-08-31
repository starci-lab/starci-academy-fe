import {
    errorMessageClassName,
} from "./classNames"

/** Resolved copy for one surface-level failure. */
export type ErrorMessageData = {
    readonly content: string
}

/** Props for {@link ErrorMessage}. */
export type ErrorMessageProps = {
    readonly props: ErrorMessageData
}

/** Draw an assertive semantic error message without requiring a field-slot context. */
export const ErrorMessage = (props: ErrorMessageProps) => (
    <p slot="errorMessage" role="alert" aria-live="assertive" className={errorMessageClassName}>
        {props.props.content}
    </p>
)
