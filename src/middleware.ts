import createMiddleware from "next-intl/middleware"
import {
    NextRequest,
    NextResponse,
} from "next/server"
import { routing } from "@/i18n/routing"
import { canonicalLocalUrl } from "@/modules/routing/canonical-local-url"

const intlMiddleware = createMiddleware(routing)

/** Numeric loopback aliases are accepted only long enough to move the browser onto localhost. */
export const canonicalLocalRedirect = (request: NextRequest): NextResponse | undefined => {
    const target = canonicalLocalUrl(request.nextUrl, {
        host: request.headers.get("host"),
        forwardedHost: request.headers.get("x-forwarded-host"),
        forwardedProto: request.headers.get("x-forwarded-proto"),
    })
    if (!target) return undefined
    return NextResponse.redirect(target, 308)
}

/**
 * The one thing that runs before a route exists: deciding which language it is in.
 *
 * A request for `/league` carries no locale, so something has to choose one and send the reader to
 * the addressed form. next-intl's middleware is that something: it reads the cookie this app
 * already sets, falls back to the default, and redirects to the prefixed path.
 */
const middleware = (request: NextRequest) => {
    return canonicalLocalRedirect(request) ?? intlMiddleware(request)
}

export default middleware

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
