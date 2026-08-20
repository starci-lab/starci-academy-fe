import { beforeEach, describe, expect, it, vi } from "vitest"

const lang = vi.hoisted(() => vi.fn())

vi.mock("next/root-params", () => ({ lang }))
vi.mock("next-intl/server", () => ({
    getRequestConfig: (factory: () => unknown) => factory,
}))
vi.mock("next-intl", () => ({
    hasLocale: (locales: ReadonlyArray<string>, value: string | undefined) => value !== undefined && locales.includes(value),
}))

describe("i18n request config", () => {
    beforeEach(() => {
        lang.mockReset()
    })

    it("loads messages for the routed root language", async () => {
        lang.mockResolvedValue("vi")
        const { default: requestConfig } = await import("../../i18n/request")
        const config = await requestConfig({ requestLocale: Promise.resolve(undefined) })
        expect(config.locale).toBe("vi")
        expect(config.timeZone).toBe("Asia/Ho_Chi_Minh")
        expect(config.messages).toHaveProperty("app")
    })

    it("falls back when the generated root parameter is unsupported", async () => {
        lang.mockResolvedValue("fr")
        const { default: requestConfig } = await import("../../i18n/request")
        const config = await requestConfig({ requestLocale: Promise.resolve(undefined) })
        expect(config.locale).toBe("en")
        expect(config.messages).toHaveProperty("app")
    })
})
