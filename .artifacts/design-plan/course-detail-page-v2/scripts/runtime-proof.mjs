import { createHash } from "node:crypto"
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"

/**
 * RUNTIME PROOF, one file per rendered state.
 *
 * The review chrome refuses to embed a candidate unless the proof it fetches from the export matches
 * the digests written in `cases.js`. That is the whole point: a manifest can claim anything, and the
 * export is the only thing a reviewer actually looked at. Regenerating after ANY source or fixture
 * edit is therefore not housekeeping - a stale digest is the lab correctly reporting that the record
 * and the render have drifted apart.
 *
 * WHAT EACH DIGEST COVERS, stated because a hash nobody can reproduce proves nothing:
 *   candidateDigest    - every file under `src/components/**`, i.e. exactly what Apply ports. The
 *                        chrome (`app/**`, `states.ts`, `RenderState.tsx`) is deliberately OUT: it
 *                        never reaches production, so an edit to it must not invalidate a review.
 *   fixtureSha256      - the fixture, byte for byte.
 *   runtimeFingerprint - the exported HTML for THIS state. Different states have different ones;
 *                        that is what stops one screenshot standing in for another.
 */

const ROOT = "D:/Repositories/starci-academy-fe/.artifacts/design-plan/course-detail-page-v2"
const CANDIDATE = `${ROOT}/candidate`
const sha = (value) => createHash("sha256").update(value).digest("hex")

/** Every file under a directory, path-sorted so the digest does not depend on the filesystem. */
const walk = (dir) => {
    const out = []
    for (const entry of readdirSync(dir).sort()) {
        const full = `${dir}/${entry}`
        if (statSync(full).isDirectory()) out.push(...walk(full))
        else out.push(full)
    }
    return out
}

const ported = walk(`${CANDIDATE}/src/components`)
const candidateDigest = sha(
    ported.map((file) => `${file.slice(CANDIDATE.length + 1)}\n${readFileSync(file, "utf8")}`).join("\n"),
)
const fixtureSha256 = sha(readFileSync(`${CANDIDATE}/src/fixtures/course-detail.json`))

/**
 * stateId -> the exported document it renders.
 *
 * Not one-per-file: `ready-mobile` is the SAME document at a 375px viewport. The pinned bar only
 * exists below the rail's breakpoint, so it is a state that was genuinely observed and must carry
 * its own screenshot - but it is not a second render, and pretending it were would put a second
 * fingerprint on one file.
 */
const STATE_FILES = Object.fromEntries([
    ...readdirSync(`${CANDIDATE}/out/state`).filter((f) => f.endsWith(".html")).sort().map((f) => [f.replace(".html", ""), f]),
    ["ready-mobile", "ready.html"],
])

mkdirSync(`${CANDIDATE}/out/.well-known`, { recursive: true })
const rows = []
for (const [id, file] of Object.entries(STATE_FILES)) {
    const proof = {
        candidateDigest,
        stateId: id,
        fixtureSha256,
        runtimeFingerprint: sha(readFileSync(`${CANDIDATE}/out/state/${file}`)),
    }
    writeFileSync(`${CANDIDATE}/out/.well-known/starci-preview-${id}.json`, `${JSON.stringify(proof, null, 2)}\n`)
    rows.push({ ...proof, htmlFile: `state/${file}` })
}

console.log(`ported source files: ${ported.length}`)
console.log(`candidateDigest: ${candidateDigest}`)
console.log(`fixtureSha256:   ${fixtureSha256}`)
for (const r of rows) console.log(`  ${r.stateId.padEnd(14)} ${r.runtimeFingerprint}`)
writeFileSync(`${ROOT}/scripts/proofs.json`, `${JSON.stringify(rows, null, 2)}\n`)
