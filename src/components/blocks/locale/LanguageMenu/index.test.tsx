/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { LanguageMenu } from "./index"

const replace = vi.fn()
let locale = "vi"
let pathname = "/courses/typescript"

vi.mock("next-intl", () => ({
    useLocale: () => locale,
    useTranslations: () => (key: string) => key,
}))

vi.mock("@/i18n/navigation", () => ({
    usePathname: () => pathname,
    useRouter: () => ({ replace }),
}))

afterEach(() => {
    locale = "vi"
    pathname = "/courses/typescript"
    cleanup()
    vi.clearAllMocks()
})

describe("LanguageMenu", () => {
    it("offers every locale the app ships and marks the one being read", async () => {
        render(<LanguageMenu />)

        fireEvent.click(screen.getByRole("button", { name: "locale" }))
        const english = await screen.findByRole("menuitemradio", { name: "localeOptions.en" })
        const vietnamese = screen.getByRole("menuitemradio", { name: "localeOptions.vi" })
        expect(english).toHaveAttribute("aria-checked", "false")
        expect(vietnamese).toHaveAttribute("aria-checked", "true")
    })

    it("keeps the reader on the same page and swaps only its language", async () => {
        render(<LanguageMenu />)

        fireEvent.click(screen.getByRole("button", { name: "locale" }))
        fireEvent.click(await screen.findByRole("menuitemradio", { name: "localeOptions.en" }))
        expect(replace).toHaveBeenCalledExactlyOnceWith("/courses/typescript", { locale: "en" })
    })

    it("does not navigate when the reader picks the language they are already reading in", async () => {
        render(<LanguageMenu />)

        fireEvent.click(screen.getByRole("button", { name: "locale" }))
        fireEvent.click(await screen.findByRole("menuitemradio", { name: "localeOptions.vi" }))
        expect(replace).not.toHaveBeenCalled()
    })

    it("carries the whole current path, whatever it is, into the other language", async () => {
        locale = "en"
        pathname = "/profile/reader/cv"
        render(<LanguageMenu />)

        fireEvent.click(screen.getByRole("button", { name: "locale" }))
        expect(await screen.findByRole("menuitemradio", { name: "localeOptions.en" }))
            .toHaveAttribute("aria-checked", "true")
        fireEvent.click(screen.getByRole("menuitemradio", { name: "localeOptions.vi" }))
        expect(replace).toHaveBeenCalledExactlyOnceWith("/profile/reader/cv", { locale: "vi" })
    })
})
