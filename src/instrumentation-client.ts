import * as Sentry from "@sentry/nextjs"
import {
    buildSentryOptions,
    readSentryRuntimeConfig,
} from "@/config/sentry"

Sentry.init(buildSentryOptions(readSentryRuntimeConfig()))

/** Let Sentry measure client-side App Router transitions. */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
