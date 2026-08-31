/**
 * Seed the development test account in Keycloak, and make the account the dev-session door opens.
 *
 * WHY THIS EXISTS AS A SCRIPT. The local Keycloak container runs with no volume, so recreating it
 * wipes every user - including this one. An account that has to be re-created by hand, from memory
 * of which realm and which client, is an account that is missing exactly when somebody is already
 * blocked on something else.
 *
 * WHAT IT ALSO FIXES, and the reason it does more than create a user: the `master` realm ships an
 * access-token lifespan of SIXTY SECONDS. That is not merely inconvenient for testing - it logs a
 * real local sign-in out after a minute, which reads as a broken session rather than as a
 * configured one. This raises it for local development only, on a container that is wiped anyway.
 *
 * IT IS IDEMPOTENT. Running it twice re-uses the account and resets its password, so it is safe to
 * run whenever something looks wrong rather than only after a wipe.
 *
 * NOT FOR ANY DEPLOYED ENVIRONMENT. It refuses to run against a non-local Keycloak, because the
 * one thing worse than no test account is a known-password account on a host somebody can reach.
 *
 * Usage: node scripts/provision-test-account.mjs
 */

/** Where the local Keycloak lives. Overridable only within localhost - see the guard below. */
const KEYCLOAK_URL = process.env.KEYCLOAK_URL ?? "http://localhost:8080"

/** The realm the back end authenticates against. */
const REALM = process.env.KEYCLOAK_REALM ?? "master"

/** The client the back end exchanges passwords through. */
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID ?? "academy-web"

/**
 * The local admin, and the account to seed.
 *
 * NO DEFAULTS ON EITHER PASSWORD, deliberately, and it is worth saying why given everything else
 * here has one. This repository is public. A default is a value somebody reads, and a
 * password-shaped string in a public file is worth publishing even when the container it opens is
 * local and disposable - it tells a stranger what to try first everywhere else. The names live in
 * `.env.example`; the values live in `.env.local`, which is git-ignored.
 */
const ADMIN_USERNAME = process.env.KEYCLOAK_ADMIN_USERNAME ?? "admin"
const ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD
const TEST_EMAIL = process.env.DEV_TEST_ACCOUNT_EMAIL ?? "test@starci.local"
const TEST_PASSWORD = process.env.DEV_TEST_ACCOUNT_PASSWORD

/** Eight hours. Long enough to test through, short enough to still be a session. */
const ACCESS_TOKEN_LIFESPAN_SECONDS = 28800

/**
 * Refuse anything that is not the canonical local hostname.
 *
 * A hostname check rather than a flag: a flag is something somebody can pass by accident at 2am,
 * and the failure mode here is a published account whose password is in this file.
 */
const assertLocal = () => {
    const { hostname } = new URL(KEYCLOAK_URL)
    if (hostname !== "localhost") {
        throw new Error(`refusing to seed a test account outside canonical localhost: ${hostname}`)
    }
}

/** Refuse to guess at either password, and say which name is missing rather than "unauthorized". */
const assertConfigured = () => {
    if (!ADMIN_PASSWORD) {
        throw new Error("KEYCLOAK_ADMIN_PASSWORD is unset - copy .env.example to .env.local and fill it in")
    }
    if (!TEST_PASSWORD) {
        throw new Error("DEV_TEST_ACCOUNT_PASSWORD is unset - copy .env.example to .env.local and fill it in")
    }
}

/**
 * Ask Keycloak for an admin token.
 */
const adminToken = async () => {
    const response = await fetch(`${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "password",
            client_id: "admin-cli",
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD,
        }).toString(),
    })
    const body = await response.json()
    if (!body.access_token) throw new Error(`admin sign-in refused: ${body.error_description ?? body.error}`)
    return body.access_token
}

/**
 * Call the admin API.
 *
 * @param token - The admin token.
 * @param path - Path under `/admin/realms/<realm>`.
 * @param init - Fetch options; a body is sent as JSON.
 */
const admin = async (token, path, init = {}) => {
    const response = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}${path}`, {
        ...init,
        headers: {
            authorization: `Bearer ${token}`,
            ...(init.body ? { "content-type": "application/json" } : {}),
        },
    })
    if (!response.ok && response.status !== 409) {
        throw new Error(`${init.method ?? "GET"} ${path} -> ${response.status} ${await response.text()}`)
    }
    const text = await response.text()
    return text ? JSON.parse(text) : undefined
}

const main = async () => {
    assertLocal()
    assertConfigured()
    const token = await adminToken()

    // The sixty-second default is the thing that makes a local session look broken.
    await admin(token, "", {
        method: "PUT",
        body: JSON.stringify({
            accessTokenLifespan: ACCESS_TOKEN_LIFESPAN_SECONDS,
            ssoSessionIdleTimeout: ACCESS_TOKEN_LIFESPAN_SECONDS,
            ssoSessionMaxLifespan: ACCESS_TOKEN_LIFESPAN_SECONDS * 3,
        }),
    })
    console.log(`realm ${REALM}: access-token lifespan set to ${ACCESS_TOKEN_LIFESPAN_SECONDS}s`)

    const existing = await admin(token, `/users?email=${encodeURIComponent(TEST_EMAIL)}&exact=true`)
    let id = existing?.[0]?.id

    if (id === undefined) {
        await admin(token, "/users", {
            method: "POST",
            body: JSON.stringify({
                username: TEST_EMAIL,
                email: TEST_EMAIL,
                emailVerified: true,
                enabled: true,
                firstName: "Test",
                lastName: "Learner",
            }),
        })
        const created = await admin(token, `/users?email=${encodeURIComponent(TEST_EMAIL)}&exact=true`)
        id = created?.[0]?.id
        if (id === undefined) throw new Error("user was created but could not be read back")
        console.log(`created ${TEST_EMAIL}`)
    } else {
        console.log(`${TEST_EMAIL} already exists`)
    }

    // Reset unconditionally: an account that exists with a forgotten password is the same
    // problem as no account, and this is the one place that knows what the password should be.
    await admin(token, `/users/${id}/reset-password`, {
        method: "PUT",
        body: JSON.stringify({ type: "password", value: TEST_PASSWORD, temporary: false }),
    })
    console.log("password set")

    // Prove it end to end rather than trusting the admin API: the thing that must work is the
    // password grant the dev-session route actually uses, not the record it wrote.
    const secret = process.env.KEYCLOAK_CLIENT_SECRET
    const form = new URLSearchParams({
        grant_type: "password",
        client_id: CLIENT_ID,
        username: TEST_EMAIL,
        password: TEST_PASSWORD,
        scope: "openid",
    })
    if (secret) form.set("client_secret", secret)
    const grant = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: form.toString(),
    }).then((response) => response.json())

    if (!grant.access_token) {
        console.error(`the account exists but the password grant was refused: ${grant.error_description ?? grant.error}`)
        console.error("set KEYCLOAK_CLIENT_SECRET (same value as .env.local) and run again")
        process.exitCode = 1
        return
    }
    console.log(`password grant works, token good for ${grant.expires_in}s`)
}

main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
})
