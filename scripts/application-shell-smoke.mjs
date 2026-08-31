// Operational HTTP smoke assertion. It runs only through `npm run test:e2e` after a production build.
import {strict as assert} from "node:assert"

const baseUrl = process.env.E2E_BASE_URL ?? "http://localhost:3101"
const response = await fetch(`${baseUrl}/en`)
assert.equal(response.status, 200)
const body = await response.text()
assert.match(body, /StarCi/)

if (new URL(baseUrl).hostname === "localhost") {
    const aliasUrl = new URL("/en", baseUrl)
    aliasUrl.hostname = "127.0.0.1"
    const canonicalResponse = await fetch(aliasUrl, {redirect: "manual"})
    assert.equal(canonicalResponse.status, 308)
    assert.equal(new URL(canonicalResponse.headers.get("location")).hostname, "localhost")
}

console.log("e2e smoke: localhost rendered the application shell and numeric loopback canonicalized")
