/**
 * Provision only the UAT identities whose registry state is `present`.
 *
 * Required environment:
 *   KEYCLOAK_ADMIN_PASSWORD
 *   UAT_ACCOUNT_PASSWORD
 *
 * Optional environment:
 *   KEYCLOAK_ADMIN_USERNAME (default: admin)
 *   KEYCLOAK_URL (default: http://localhost:8080; loopback only)
 *   KEYCLOAK_REALM (default: master)
 *   STARCI_ACADEMY_BACKEND_ROOT (defaults to the routed sibling checkout)
 */

import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { resolve, sep } from "node:path"
import process from "node:process"
import { pathToFileURL } from "node:url"

const backendRoot = process.env.STARCI_ACADEMY_BACKEND_ROOT
    ? pathToFileURL(resolve(process.env.STARCI_ACADEMY_BACKEND_ROOT) + sep)
    : new URL("../../../ac/starci-academy-backend/", import.meta.url)
const requireBackend = createRequire(new URL("package.json", backendRoot))
const { Client } = requireBackend("pg")

const keycloakUrl = process.env.KEYCLOAK_URL ?? "http://localhost:8080"
const realm = process.env.KEYCLOAK_REALM ?? "master"
const adminUsername = process.env.KEYCLOAK_ADMIN_USERNAME ?? "admin"
const adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD
const passwordFile = new URL(".stacks/dev/runtime/files/uat-account-password.key", backendRoot)
const accountPassword = process.env.UAT_ACCOUNT_PASSWORD
    ?? (await readFile(passwordFile, "utf8").catch(() => "")).trim()
const postgresUserFile = new URL(".stacks/dev/runtime/files/postgres-user.txt", backendRoot)
const postgresPasswordFile = new URL(".stacks/dev/runtime/files/postgres-password.txt", backendRoot)
const postgresUser = process.env.POSTGRESQL_PRIMARY_USERNAME
    ?? (await readFile(postgresUserFile, "utf8").catch(() => "")).trim()
const postgresPassword = process.env.POSTGRESQL_PRIMARY_PASSWORD
    ?? (await readFile(postgresPasswordFile, "utf8").catch(() => "")).trim()

const hostname = new URL(keycloakUrl).hostname
if (!["localhost", "127.0.0.1", "::1"].includes(hostname)) {
    throw new Error(`Refusing to provision UAT accounts on non-loopback host: ${hostname}`)
}
if (!adminPassword) throw new Error("KEYCLOAK_ADMIN_PASSWORD is required")
if (!accountPassword) {
    throw new Error("UAT password is missing; decrypt .stacks/dev/runtime/files/uat-account-password.key first")
}
if (!postgresUser || !postgresPassword) {
    throw new Error("PostgreSQL credentials are missing from the local stack")
}

const registryUrl = new URL("../accounts.json", import.meta.url)
const registry = JSON.parse(await readFile(registryUrl, "utf8"))
const finalizeCreated = process.argv.includes("--finalize-created")
const caseArgumentIndex = process.argv.indexOf("--case")
const selectedCaseId = caseArgumentIndex >= 0 ? process.argv[caseArgumentIndex + 1] : undefined
if (caseArgumentIndex >= 0 && !selectedCaseId) throw new Error("--case requires one exact case_id")
const fixtures = selectedCaseId
    ? registry.accounts.filter((fixture) => fixture.case_id === selectedCaseId)
    : registry.accounts
if (selectedCaseId && fixtures.length !== 1) throw new Error(`Unknown or duplicate UAT case: ${selectedCaseId}`)
const postgres = new Client({
    host: process.env.POSTGRESQL_PRIMARY_HOST ?? "127.0.0.1",
    port: Number(process.env.POSTGRESQL_PRIMARY_PORT ?? 5432),
    database: process.env.POSTGRESQL_PRIMARY_DATABASE ?? "starci-academy",
    user: postgresUser,
    password: postgresPassword,
})
await postgres.connect()

const tokenResponse = await fetch(
    `${keycloakUrl}/realms/master/protocol/openid-connect/token`,
    {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "password",
            client_id: "admin-cli",
            username: adminUsername,
            password: adminPassword,
        }),
    },
)
const tokenBody = await tokenResponse.json()
if (!tokenBody.access_token) throw new Error("Keycloak admin sign-in failed")

const admin = async (path, init = {}) => {
    const response = await fetch(`${keycloakUrl}/admin/realms/${realm}${path}`, {
        ...init,
        headers: {
            authorization: `Bearer ${tokenBody.access_token}`,
            ...(init.body ? { "content-type": "application/json" } : {}),
        },
    })
    if (!response.ok && response.status !== 409) {
        throw new Error(`${init.method ?? "GET"} ${path} -> ${response.status}`)
    }
    const text = await response.text()
    return text ? JSON.parse(text) : undefined
}

try {
    for (const fixture of fixtures) {
        if (fixture.is_uat !== true) throw new Error(`Fixture ${fixture.case_id} is missing is_uat=true`)
        const shouldCreate = fixture.initial_state === "present"
        const shouldFinalize = finalizeCreated
            && fixture.initial_state === "absent"
            && fixture.expected_final_state === "present"
        if (!shouldCreate && !shouldFinalize) {
            console.log(`reserved ${fixture.case_id} (${fixture.initial_state})`)
            continue
        }

        const found = await admin(`/users?email=${encodeURIComponent(fixture.email)}&exact=true`)
        let userId = found?.[0]?.id
        const user = {
            username: fixture.email,
            email: fixture.email,
            emailVerified: true,
            enabled: true,
            firstName: "UAT",
            lastName: fixture.case_id,
            attributes: {
                is_uat: ["true"],
                uat_case: [fixture.case_id],
            },
        }

        if (!userId) {
            if (shouldFinalize) {
                throw new Error(`Expected journey-created identity is absent: ${fixture.case_id}`)
            }
            await admin("/users", { method: "POST", body: JSON.stringify(user) })
            const created = await admin(`/users?email=${encodeURIComponent(fixture.email)}&exact=true`)
            userId = created?.[0]?.id
            if (!userId) throw new Error(`Created but could not resolve ${fixture.case_id}`)
        } else {
            await admin(`/users/${userId}`, { method: "PUT", body: JSON.stringify({ ...found[0], ...user }) })
        }

        if (shouldCreate) {
            await admin(`/users/${userId}/reset-password`, {
                method: "PUT",
                body: JSON.stringify({ type: "password", value: accountPassword, temporary: false }),
            })
        }
        await postgres.query(
            `INSERT INTO users (keycloak_id, email, username, authentication_type, is_uat)
             VALUES ($1, $2, $2, 'credentials', true)
             ON CONFLICT (keycloak_id) DO UPDATE
             SET email = EXCLUDED.email,
                 username = EXCLUDED.username,
                 authentication_type = EXCLUDED.authentication_type,
                 is_uat = true,
                 updated_at = now()`,
            [userId, fixture.email],
        )
        console.log(`${shouldFinalize ? "finalized" : "ready"} ${fixture.case_id}`)
    }
} finally {
    await postgres.end()
}
