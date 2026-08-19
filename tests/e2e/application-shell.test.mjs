// The declared E2E command executes this real HTTP assertion after `next build`.
// Keeping a test-shaped file in the E2E root makes discovery auditable by the Source gate.
import {strict as assert} from "node:assert"

const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3101"
const response = await fetch(`${baseUrl}/en`)
assert.equal(response.status, 200)
const body = await response.text()
assert.match(body, /StarCi/)
console.log(`e2e smoke: GET /en returned ${response.status} and rendered the application shell`)
