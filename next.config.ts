import createNextIntlPlugin from "next-intl/plugin"
import {
    withSentryConfig,
} from "@sentry/nextjs"
import type {
    NextConfig,
} from "next"

/**
 * Next configuration for the greenfield app.
 *
 * Deliberately bare apart from the translation plugin. The old app's config also carried an ESM
 * transpile list and a barrel-import optimisation for packages this repo does not depend on;
 * neither is inherited here.
 *
 * The i18n plugin is what lets `src/i18n/request.ts` resolve a locale per request, so a
 * component can ask for a string instead of holding an English sentence.
 *
 * `typescript.ignoreBuildErrors` is NOT set. The previous app disabled it to
 * ship past accumulated type debt — this repo starts with none, so the build
 * stays the gate it is meant to be.
 */
const nextConfig: NextConfig = {
    devIndicators: false,
    // Parallel local UAT uses one loopback hostname per browser case so HttpOnly cookies do not
    // collide. Keep the allowlist exact: these origins exist only in the local test topology.
    allowedDevOrigins: [
        "expired-otp.lvh.me",
        "missing-challenge.lvh.me",
        "duplicate-submit.lvh.me",
        "server-unavailable.lvh.me",
        "rate-limited.lvh.me",
        "not-receive-otp.lvh.me",
    ],
}

const configuredNext = createNextIntlPlugin()(nextConfig)
const canUploadSentrySourceMaps = Boolean(
    process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_PROJECT,
)

export default withSentryConfig(configuredNext, {
    authToken: process.env.SENTRY_AUTH_TOKEN,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: !process.env.CI,
    sourcemaps: {
        disable: !canUploadSentrySourceMaps,
    },
})
