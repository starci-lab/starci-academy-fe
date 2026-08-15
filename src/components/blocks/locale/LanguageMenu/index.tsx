"use client"

import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { LOCALES, type Locale } from "@/i18n/config"
import { _LanguageMenu } from "./component"

/** Connected locale owner: keeps the current path while replacing only its locale prefix. */
export const LanguageMenu = () => {
    const t = useTranslations("shell")
    const locale = useLocale() as Locale
    const pathname = usePathname()
    const router = useRouter()

    return (
        <_LanguageMenu
            props={{
                label: t("locale"),
                selectedLocale: locale,
                options: LOCALES.map((id) => ({ id, label: t(`localeOptions.${id}`) })),
            }}
            on={{
                select: (next) => {
                    if (next !== locale) router.replace(pathname, { locale: next })
                },
            }}
        />
    )
}

/** Source-level tier marker for the connected language-menu block half. */
export const meta = { shape: "block", world: "connected", domain: "locale" } as const
