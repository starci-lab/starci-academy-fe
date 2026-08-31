import { describe, expect, it } from "vitest"
import { canonicalLocalUrl } from "./canonical-local-url"

describe("canonicalLocalUrl", () => {
    it("moves numeric loopback requests to localhost without losing route state", () => {
        const target = canonicalLocalUrl(new URL(
            "http://127.0.0.1:3000/authentication?returnUrl=%2Fen%2Fdashboard",
        ))

        expect(target?.toString()).toBe(
            "http://localhost:3000/authentication?returnUrl=%2Fen%2Fdashboard",
        )
    })

    it("uses the browser Host authority when Next normalized its internal request URL", () => {
        const target = canonicalLocalUrl(
            new URL("http://0.0.0.0:3000/authentication?returnUrl=%2Fen%2Fdashboard"),
            {host: "127.0.0.1:3000"},
        )

        expect(target?.toString()).toBe(
            "http://localhost:3000/authentication?returnUrl=%2Fen%2Fdashboard",
        )
    })

    it("canonicalizes the bracketed hostname representation used by IPv6 URLs", () => {
        expect(canonicalLocalUrl(new URL("http://[::1]:3000/en"))?.toString()).toBe(
            "http://localhost:3000/en",
        )
    })

    it("preserves a public source URL even when its internal Host header is numeric", () => {
        expect(canonicalLocalUrl(
            new URL("https://staging.example.com/en"),
            {host: "127.0.0.1:3000"},
        )).toBeUndefined()
    })

    it("preserves the forwarded public authority of a request behind a proxy", () => {
        expect(canonicalLocalUrl(
            new URL("http://0.0.0.0:3000/en"),
            {
                host: "127.0.0.1:3000",
                forwardedHost: "staging.example.com",
                forwardedProto: "https",
            },
        )).toBeUndefined()
    })

    it("leaves canonical localhost and intentional lvh.me UAT hosts alone", () => {
        expect(canonicalLocalUrl(new URL("http://localhost:3000/en"))).toBeUndefined()
        expect(canonicalLocalUrl(new URL("http://expired-otp.lvh.me:3000/en"))).toBeUndefined()
    })
})
