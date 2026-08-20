import { describe, expect, it } from "vitest"
import { withoutLocale } from "./localised-path"

describe("withoutLocale", () => {
    it("strips a leading locale segment so the router does not add a second one", () => {
        expect(withoutLocale("/vi/courses/fullstack", "vi")).toBe("/courses/fullstack")
        expect(withoutLocale("/en/dashboard", "en")).toBe("/dashboard")
    })

    it("answers the root for a path that is nothing but the locale", () => {
        expect(withoutLocale("/vi", "vi")).toBe("/")
    })

    it("leaves an already-unprefixed path exactly as it was", () => {
        expect(withoutLocale("/courses/fullstack", "vi")).toBe("/courses/fullstack")
        expect(withoutLocale("/", "vi")).toBe("/")
    })

    it("does not mistake a longer first segment for the locale", () => {
        expect(withoutLocale("/vietnam/guides", "vi")).toBe("/vietnam/guides")
        expect(withoutLocale("/en/dashboard", "vi")).toBe("/en/dashboard")
    })
})
