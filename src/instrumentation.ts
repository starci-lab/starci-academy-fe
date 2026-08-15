import * as Sentry from "@sentry/nextjs"

/** Initialize the matching Sentry SDK for the active Next.js server runtime. */
export const register = async () => {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        await import("../sentry.server.config")
    }

    if (process.env.NEXT_RUNTIME === "edge") {
        await import("../sentry.edge.config")
    }
}

/** Capture errors from nested React Server Components and request handlers. */
export const onRequestError = Sentry.captureRequestError
