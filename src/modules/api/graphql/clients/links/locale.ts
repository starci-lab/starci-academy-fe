import { ApolloLink } from "@apollo/client"
import { DEFAULT_LOCALE, LOCALE_COOKIE, toLocale, type Locale } from "@/i18n/config"

/**
 * LOCALE ATTACHMENT - tell the API which language the reader is reading in.
 *
 * WHY THIS EXISTS AT ALL. The server already speaks both: `resolveLocale` reads `x-locale`, then
 * the `LOCALE` cookie, then `accept-language`, and only then falls back to English - and the course
 * documents are stored per locale, so `course` returns an already-translated blob. The app was
 * nonetheless serving English course copy on `/vi`, because it sent NONE of those three. The cookie
 * could not stand in for them: the API is a different origin, so it does not travel unless the
 * request opts into credentials, and the anonymous path deliberately does not.
 *
 * So the missing piece was one header, and it was missing everywhere rather than on one page. That
 * is why this is a link: every query and mutation in the app goes through the chain, so attaching
 * it here makes the whole surface bilingual at once instead of one hook at a time.
 *
 * WHERE THE LOCALE COMES FROM, in the order the reader would expect:
 *
 *   1. the `[lang]` segment of the URL they are on - the address is the strongest statement of
 *      intent, and it is what the middleware already redirected them to;
 *   2. the cookie next-intl remembers their choice in, for the moment before a client component
 *      knows its route;
 *   3. the app default, so a request is never sent with a header the server has to guess about.
 *
 * IT READS THE ADDRESS RATHER THAN TAKING A PARAMETER because the alternative is threading a locale
 * through every hook and every query function, where the first one that forgets goes back to
 * English silently - which is the failure this is fixing.
 */

/** Read the locale out of the current address, when there is one to read. */
const localeFromPath = (pathname: string): Locale | undefined => {
    const [, first] = pathname.split("/")
    if (first === undefined || first === "") return undefined
    const resolved = toLocale(first)
    // `toLocale` answers with the default for anything unknown, so an unrecognised first segment -
    // `/dashboard` before the middleware has redirected - must not be read as a real choice.
    return resolved === first ? resolved : undefined
}

/** Read the locale out of the cookie next-intl writes. */
const localeFromCookie = (cookie: string): Locale | undefined => {
    const match = cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`))
    if (match?.[1] === undefined) return undefined
    return toLocale(decodeURIComponent(match[1].trim()))
}

/** Resolve the locale this request should declare. */
export const resolveRequestLocale = (): Locale => {
    // On the server there is no `document`; a server-rendered call carries the app default and the
    // client re-fetch corrects it, which is the same shape the bearer link already has.
    if (typeof window === "undefined") return DEFAULT_LOCALE
    return localeFromPath(window.location.pathname)
        ?? localeFromCookie(document.cookie)
        ?? DEFAULT_LOCALE
}

/** Everything the locale link needs. */
export interface CreateAttachLocaleLinkParams {
    /** Where the locale comes from. The seam stays so a test can supply a fixed one. */
    getLocale?: () => Locale
    /** When true, logs which locale each operation declared. */
    debug?: boolean
}

/** Attaches `x-locale` to every operation, so the server serves the copy the reader is reading. */
export const createAttachLocaleLink = ({
    getLocale = resolveRequestLocale,
    debug = false,
}: CreateAttachLocaleLinkParams = {}) => new ApolloLink((operation, forward) => {
    const locale = getLocale()
    operation.setContext((previous) => ({
        headers: {
            ...(previous.headers as Record<string, string> | undefined),
            "x-locale": locale,
        },
    }))
    if (debug) {
        console.log(`[locale] op=${operation.operationName ?? "anonymous"} locale=${locale}`)
    }
    return forward(operation)
})
