import * as Sentry from "@sentry/nextjs"
import {
    buildSentryOptions,
    readSentryRuntimeConfig,
} from "./src/config/sentry"

Sentry.init(buildSentryOptions(readSentryRuntimeConfig()))
