import {
    describe,
    expect,
    it,
} from "vitest"
import {
    buildSentryOptions,
} from "./sentry"

describe("buildSentryOptions", () => {
    it("enables bounded production tracing without default PII", () => {
        const options = buildSentryOptions({
            dsn: "https://public@example.invalid/1",
            environment: "production",
            release: " web-2026.08.15 ",
        })

        expect(options).toMatchObject({
            enabled: true,
            tracesSampleRate: 0.05,
            sendDefaultPii: false,
            release: "web-2026.08.15",
        })
    })

    it("disables capture without a DSN and traces outside production", () => {
        const options = buildSentryOptions({
            dsn: "  ",
            environment: "development",
        })

        expect(options).toMatchObject({
            dsn: undefined,
            enabled: false,
            tracesSampleRate: 0,
        })
    })
})
