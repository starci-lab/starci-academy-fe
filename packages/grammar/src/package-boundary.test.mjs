import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const packageUrl = new URL("../package.json", import.meta.url)

test("the package exposes only the three supported entry-point families", async () => {
    const packageJson = JSON.parse(await readFile(packageUrl, "utf8"))
    const exportKeys = Object.keys(packageJson.exports).sort()
    const supportedKeys = [
        "./common",
        "./common.css",
        "./common/styles.css",
        "./core",
        "./core.css",
        "./core/styles.css",
        "./offset-pop.css",
        "./offset-pop/styles.css",
        "./package.json",
    ].sort()

    assert.deepEqual(exportKeys, supportedKeys)
    assert.equal(exportKeys.some((key) => key.includes("registry") || key.includes("tree")), false)
    assert.equal(exportKeys.some((key) => key.includes("contract") || key.includes("projection")), false)
})

test("runtime dependencies stay at the neutral peer boundary", async () => {
    const packageJson = JSON.parse(await readFile(packageUrl, "utf8"))
    assert.deepEqual(Object.keys(packageJson.dependencies ?? {}), [])
    assert.deepEqual(Object.keys(packageJson.peerDependencies).sort(), ["@heroui/react", "react"])
})
