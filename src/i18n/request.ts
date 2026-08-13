import { getRequestConfig } from "next-intl/server"
import { hasLocale } from "next-intl"
import { routing } from "./routing"

/**
 * WHERE COPY COMES FROM, resolved once per request on the server.
 *
 * Every string a reader sees is a key in `src/messages/*.json`, and a component receives it
 * already resolved. That is the same boundary the blocks already draw between their two halves:
 * the connected half knows who is looking and hands the presentational half words, so the
 * presentational half can be rendered from a test with no locale, no request and no provider.
 *
 * THE LOCALE COMES FROM THE ROUTE NOW. It used to be read from a cookie, and the note that stood
 * here said routing was the better answer and the next decision to take - because a cookie is not
 * in the link, so a Vietnamese page could not be shared, bookmarked or indexed as the page the
 * reader actually saw. The `[lang]` segment is that decision, and the cookie has moved to the
 * smaller job of remembering a returning reader's choice at `/`.
 */

/**
 * The zone every date on the screen is written in.
 *
 * FIXED, NOT INFERRED, and that is the point. Left unset, next-intl formats on the server in the
 * server's zone and on the client in the reader's, so a streak calendar renders one set of days
 * and hydrates into another - a markup mismatch that React does not patch up, which takes the
 * handlers on that whole subtree down with it. A product whose readers are in one country has one
 * honest answer to "what day is it", and this is where it is written down.
 */
const TIME_ZONE = "Asia/Ho_Chi_Minh"

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
    return {
        locale,
        timeZone: TIME_ZONE,
        messages: (await import(`../messages/${locale}.json`)).default,
    }
})
