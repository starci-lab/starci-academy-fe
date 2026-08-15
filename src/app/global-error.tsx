"use client"

import * as Sentry from "@sentry/nextjs"
import {
    useEffect,
} from "react"

/** Values Next passes to the root error boundary. */
interface GlobalErrorProps {
    /** The fatal render error, including Next's optional server digest. */
    error: Error & { digest?: string }
    /** Retry the failed render without a full browser refresh. */
    reset: () => void
}

const ERROR_TITLE = "Something went wrong"
const ERROR_MESSAGE = "StarCi could not load this page. Please try again."
const RETRY_LABEL = "Try again"

/** Capture fatal render errors while preserving a usable provider-independent fallback. */
const GlobalError = ({
    error,
    reset,
}: GlobalErrorProps) => {
    useEffect(() => {
        Sentry.captureException(error)
    }, [error])

    return (
        <html lang="en">
            <body>
                <p role="heading" aria-level={1}>{ERROR_TITLE}</p>
                <p>{ERROR_MESSAGE}</p>
                <button type="button" onClick={reset}>
                    {RETRY_LABEL}
                </button>
            </body>
        </html>
    )
}

export default GlobalError
