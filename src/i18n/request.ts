import { cookies } from "next/headers"
import { getRequestConfig } from "next-intl/server"
import { LOCALE_COOKIE, toLocale } from "./config"

/**
 * WHERE COPY COMES FROM, resolved once per request on the server.
 *
 * Every string a reader sees is a key in `src/messages/*.json`, and a component receives it
 * already resolved. That is the same boundary the blocks already draw between their two halves:
 * the connected half knows who is looking and hands the presentational half words, so the
 * presentational half can be rendered from a test with no locale, no request and no provider.
 *
 * THIS FILE IS SERVER-ONLY, because reading a cookie is. The vocabulary a client component needs -
 * the cookie name, the locale union - lives in `./config` so importing one constant does not drag
 * `next/headers` into the browser bundle.
 *
 * NO LOCALE ROUTING, DELIBERATELY AND STATED. The locale is read from a cookie rather than from a
 * `/[locale]/` segment. Routing is the better answer for a product that wants a Vietnamese URL to
 * be shareable and indexable, and it is a structural change to every route - so it is named here
 * as the next decision rather than half-built now.
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

export default getRequestConfig(async () => {
    const store = await cookies()
    const locale = toLocale(store.get(LOCALE_COOKIE)?.value)
    return {
        locale,
        timeZone: TIME_ZONE,
        messages: (await import(`../messages/${locale}.json`)).default,
    }
})
