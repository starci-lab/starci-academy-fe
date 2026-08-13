import { readFileSync, writeFileSync } from "node:fs"

/**
 * Copy the freshly generated digests into `cases.js`.
 *
 * Hand-editing seven hashes across six state blocks is the kind of task that is done correctly four
 * times out of five, and the fifth is a lab that silently refuses to render one state - or worse,
 * renders it under a digest that no longer describes it.
 */
const ROOT = "D:/Repositories/starci-academy-fe/.artifacts/design-plan/course-detail-page-v2"
const proofs = JSON.parse(readFileSync(`${ROOT}/scripts/proofs.json`, "utf8"))
let manifest = readFileSync(`${ROOT}/cases.js`, "utf8")

const before = manifest
manifest = manifest.replace(/candidateDigest: "[a-f0-9]{64}"/g, `candidateDigest: "${proofs[0].candidateDigest}"`)
manifest = manifest.replace(/fixtureSha256: "[a-f0-9]{64}"/g, `fixtureSha256: "${proofs[0].fixtureSha256}"`)

let replaced = 0
for (const proof of proofs) {
    // Anchor on the stateId that sits directly above each fingerprint, so a state can never take
    // another state's hash - which is exactly the mistake the proof exists to catch.
    const pattern = new RegExp(`(stateId: "${proof.stateId}",\\s*\\n\\s*fixtureSha256: "[a-f0-9]{64}",\\s*\\n\\s*runtimeFingerprint: )"[a-f0-9]{64}"`)
    if (!pattern.test(manifest)) throw new Error(`no manifest block for state "${proof.stateId}"`)
    manifest = manifest.replace(pattern, `$1"${proof.runtimeFingerprint}"`)
    replaced += 1
}

writeFileSync(`${ROOT}/cases.js`, manifest)
console.log(`states synced: ${replaced}/${proofs.length}`)
console.log(`manifest changed: ${manifest !== before}`)
