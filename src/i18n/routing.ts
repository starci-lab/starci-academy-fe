import { defineRouting } from "next-intl/routing"
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "./config"

/**
 * THE LOCALE IS PART OF THE ADDRESS.
 *
 * It used to live in a cookie alone, and `request.ts` said in as many words that routing was the
 * better answer and the next decision to take. This is that decision: a Vietnamese page now has a
 * Vietnamese URL, so it can be linked, shared, bookmarked and indexed as the thing the reader
 * actually saw. A cookie cannot do any of those, because it is not in the link.
 *
 * THE COOKIE STAYS, in a smaller job. It no longer decides what a URL means - the segment does -
 * but it still remembers which language a returning reader chose, so `/` sends them where they were
 * rather than to the default every time.
 */
export const routing = defineRouting({
    locales: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    localeCookie: {
        name: LOCALE_COOKIE,
        maxAge: LOCALE_COOKIE_MAX_AGE,
        path: "/",
    },
})
