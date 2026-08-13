import createMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"

/**
 * The one thing that runs before a route exists: deciding which language it is in.
 *
 * A request for `/league` carries no locale, so something has to choose one and send the reader to
 * the addressed form. next-intl's middleware is that something: it reads the cookie this app
 * already sets, falls back to the default, and redirects to the prefixed path.
 */
export default createMiddleware(routing)

/** Which requests this middleware is allowed to touch, and by omission which it must leave alone. */
export const config = {
    /*
     * Everything except the things that are not pages.
     *
     * `_next` is the build output, `api` is not localised, and the last alternative excludes any
     * path with a dot in it - `favicon.ico`, `reactions/like.svg`, every file under `public/`.
     * Without that last one the middleware would redirect an image request to `/en/logo.svg` and
     * the asset would 404 in one locale and not the other.
     */
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
