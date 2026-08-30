/**
 * The locale vocabulary, and NOTHING that only runs on a server.
 *
 * This file exists because of a boundary the type checker cannot see. `request.ts` reads the
 * cookie, so it imports `next/headers`, so it is server-only - and the moment a client component
 * imported one constant from it, the whole module was pulled into the browser bundle and the build
 * failed at runtime with `tsc` still reporting zero errors.
 *
 * So the names live here, where both sides may read them, and the reading of the request stays
 * next door.
 */

/** The locales this app ships copy for. The first is what an unrecognised cookie falls back to. */
export const LOCALES = ["en", "vi"] as const

/** One of the locales the app ships. */
export type Locale = (typeof LOCALES)[number]

/** The cookie the reader's choice is remembered in. */
export const LOCALE_COOKIE = "starci-locale"

/**
 * How long the choice is remembered. A year: a language is a preference, not a session, and a
 * reader who has to pick it again every visit will conclude the product does not listen.
 */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/** The locale served when the reader has expressed no preference. */
export const DEFAULT_LOCALE: Locale = "en"

/** Stable product timezone shared by server formatting and the hydrated client provider. */
export const PRODUCT_TIME_ZONE = "Asia/Ho_Chi_Minh"

/**
 * Narrow an arbitrary cookie value to a locale the app actually ships.
 *
 * A cookie is reader-supplied text, so it is checked rather than trusted: an unknown value
 * resolves to the default instead of reaching the message loader and throwing on a file that does
 * not exist.
 *
 * @param value - The raw cookie value, if there was one.
 */
export const toLocale = (value: string | undefined): Locale =>
    LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE
