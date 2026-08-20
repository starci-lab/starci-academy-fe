// Operational HTTP smoke assertion. It runs only through `npm run test:e2e` after a production build.
import {strict as assert} from "node:assert"

const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3101"
const response = await fetch(`${baseUrl}/en`)
assert.equal(response.status, 200)
const body = await response.text()
assert.match(body, /StarCi/)
console.log(`e2e smoke: GET /en returned ${response.status} and rendered the application shell`)
