import { NextResponse } from "next/server"

/**
 * THE TEST ACCOUNT'S DOOR - a development convenience, and a security surface, in one file.
 *
 * WHAT IT IS FOR. Signing in here costs an address, a password and a one-time code out of a
 * mailbox. That is the right cost for a reader and the wrong one for the twentieth time somebody
 * has to look at a signed-in screen this afternoon. This route trades a seeded test account for a
 * real access token, so the screen under test is driven by the real transport, the real guard and
 * the real data - only the typing is skipped.
 *
 * WHY THE CREDENTIALS LIVE HERE AND NOT IN THE PANEL. A `NEXT_PUBLIC_*` variable is compiled INTO
 * the browser bundle: anyone with the page open can read it, and it stays readable in every deploy
 * built from that environment. These names carry no prefix, so they exist only in the server
 * process. The browser asks for a token and is handed a token; it is never handed the password
 * that produced one.
 *
 * THE THREE GATES, AND WHY THERE ARE THREE. Any one of them alone is a thing somebody can get
 * wrong once:
 *
 *   1. A production build refuses, whatever the environment says.
 *   2. An unset `DEV_TEST_ACCOUNT_EMAIL` refuses - so a deployment that never configured this
 *      does not acquire the route by upgrading.
 *   3. The account is a SEEDED one, not an escalation: the token comes from Keycloak's own
 *      password grant, so it carries exactly the roles that account was given and nothing more.
 *      This route mints no claims of its own and cannot elevate anyone.
 *
 * It answers `404` rather than `403` when it is off, because a route that says "forbidden" has
 * admitted it exists.
 *
 * WHAT IT IS NOT. Not a login flow, not a session, not a refresh path. It hands over one access
 * token with the lifetime the realm gave it. When that expires the answer is to press the control
 * again, not to build a refresh here - the real flow owns that seam.
 */

/** The shape handed back on success. One field: the thing the caller asked for. */
export interface DevSessionResponse {
    /** The bearer token, exactly as the identity provider issued it. */
    accessToken: string
}

/** What Keycloak returns from the password grant. Only the one field is read. */
interface TokenGrantResponse {
    /** The bearer token. */
    access_token?: string
    /** The provider's own error slug, when it refused. */
    error?: string
    /** The provider's description of the refusal. */
    error_description?: string
}

/** Off unless a build is explicitly not production AND the account has been configured. */
const isEnabled = (): boolean =>
    process.env.NODE_ENV !== "production" && Boolean(process.env.DEV_TEST_ACCOUNT_EMAIL)

/** The answer whenever the route is off - indistinguishable from a route that was never written. */
const notFound = (): NextResponse => NextResponse.json({ error: "not-found" }, { status: 404 })

/**
 * Trade the seeded test account for an access token.
 *
 * POST, not GET, and that is not ceremony: a GET would be reachable from an `<img>` tag on any
 * page the developer happens to open, and its answer would sit in browser history and in any proxy
 * along the way.
 */
export const POST = async (): Promise<NextResponse> => {
    if (!isEnabled()) return notFound()

    const url = process.env.KEYCLOAK_URL ?? "http://localhost:8089"
    const realm = process.env.KEYCLOAK_REALM ?? "master"
    const clientId = process.env.KEYCLOAK_CLIENT_ID ?? "academy-web"
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET
    const email = process.env.DEV_TEST_ACCOUNT_EMAIL
    const password = process.env.DEV_TEST_ACCOUNT_PASSWORD

    if (!email || !password) return notFound()

    const form = new URLSearchParams({
        grant_type: "password",
        client_id: clientId,
        username: email,
        password,
        scope: "openid",
    })
    // A public client has no secret to send, and sending an empty one is itself a refusal.
    if (clientSecret) form.set("client_secret", clientSecret)

    let grant: TokenGrantResponse
    try {
        const response = await fetch(`${url}/realms/${realm}/protocol/openid-connect/token`, {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: form.toString(),
            cache: "no-store",
        })
        grant = (await response.json()) as TokenGrantResponse
    } catch {
        // The provider was unreachable, which is a different fact from it refusing - and the one
        // a developer staring at a dead button actually needs.
        return NextResponse.json({ error: "identity-provider-unreachable" }, { status: 502 })
    }

    if (!grant.access_token) {
        return NextResponse.json(
            { error: grant.error ?? "grant-refused", detail: grant.error_description },
            { status: 502 },
        )
    }

    const body: DevSessionResponse = { accessToken: grant.access_token }
    // Never cached, anywhere: a bearer token in a shared cache is the same mistake as one in
    // web storage, with more hands able to reach it.
    return NextResponse.json(body, { headers: { "cache-control": "no-store" } })
}
