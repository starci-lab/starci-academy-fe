"use client"

import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { LOCALES, type Locale } from "@/i18n/config"
import { LanguageMenuBase } from "./component"

/** Props for the connected locale owner; the active locale comes from navigation state. */
type LanguageMenuProps = Record<never, never>
/** Connected locale owner: keeps the current path while replacing only its locale prefix. */
/** Keep the current route while switching its locale prefix. */
export const LanguageMenu = (props: LanguageMenuProps) => {
    void props
    const t = useTranslations("shell")
    const locale = useLocale() as Locale
    const pathname = usePathname()
    const router = useRouter()

    return (
        <LanguageMenuBase
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
