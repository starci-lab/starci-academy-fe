import { readFileSync, writeFileSync } from "node:fs"

/**
 * Set the manifest and the record to `TO`.
 *
 * This used to also APPEND to `approval.restatement`, which made it unsafe to run twice: a second
 * run duplicated the sentence and, because FROM/TO were the previous pair, quietly walked
 * `preview.revision` backwards while `approvedRevision` stayed ahead. The verifier catches the
 * mismatch, but a script that damages the record when re-run is the wrong shape. It now only SETS
 * values, so running it again is a no-op rather than a second edit.
 */
const ROOT = "D:/Repositories/starci-academy-fe/.artifacts/design-plan/course-detail-page-v2"
const TO = "1.3"

const manifestPath = `${ROOT}/cases.js`
const manifest = readFileSync(manifestPath, "utf8").replace(/revision 1\.\d+/g, `revision ${TO}`)
writeFileSync(manifestPath, manifest, "utf8")

const recordPath = `${ROOT}/design-record.json`
const record = JSON.parse(readFileSync(recordPath, "utf8"))
record.approvedRevision = TO
record.preview.revision = TO
// The append above ran twice before it was fixed; collapse the repeat rather than leaving a record
// that says the same thing about the same revision in two places.
record.approval.restatement = record.approval.restatement
    .split(" Revision 1.2 then adopted production's own CoverImage")
    .slice(0, 2)
    .join(" Revision 1.2 then adopted production's own CoverImage")
record.approval.source = [...new Set(record.approval.source.split(" / "))].join(" / ")
writeFileSync(recordPath, `${JSON.stringify(record, null, 2)}\n`, "utf8")

console.log(`approvedRevision: ${record.approvedRevision}`)
console.log(`preview.revision: ${record.preview.revision}`)
console.log(`in history:       ${record.revisionHistory.some((entry) => entry.revision === TO)}`)
console.log(`restatement repeats: ${(record.approval.restatement.match(/Revision 1\.2 then adopted/g) ?? []).length}`)
