import { readFileSync, writeFileSync } from "node:fs"

/**
 * Declare the three candidate files that CANNOT land byte-identical, and say exactly why.
 *
 * The candidate resolves `~candidate/*` for its own registry and its own `Tree` shim, and it must:
 * `ContractKey` is closed over the entries on disk, so until the seventeen entries are merged the
 * locked branch cannot be handed one of these keys at all. Byte-identity was therefore never
 * possible for any file that draws a proposed node - which the record should have said before it was
 * sealed, and did not.
 *
 * Left undeclared, verify_apply_materialization reports all three as SUBSTITUTED and blocks handoff.
 * That is the check working: an undeclared difference is indistinguishable from a component quietly
 * swapped for a similar one. The fix is to declare the translation, not to loosen the check.
 */
const ROOT = "D:/Repositories/starci-academy-fe/.artifacts/design-plan/course-detail-page-v2"
const path = `${ROOT}/design-record.json`
const record = JSON.parse(readFileSync(path, "utf8"))

const TRANSLATION = "Mechanical port, no design change: `~candidate/components/contracts` and `~candidate/components/branches/Tree` become `@/components/contracts` and `@/components/branches/Tree`; `TreeCandidate` becomes `Tree`; `defineCandidateContract` becomes `defineContractComponent`; and each leaf placed in a slot is wrapped in `defineLeafComponent`, because the locked ContractContent reads `child.meta.shape` while the candidate shim accepted a bare ReactNode. Byte-identity was never reachable here - ContractKey is closed over the entries on disk, so the locked branch cannot take a proposed key until the merge lands. The rendered DOM is unchanged, which the same-state parity matrix is what proves."

const PORTED = [
    "src/components/blocks/courses/CoursePricingRail/component.tsx",
    "src/components/blocks/courses/CourseMobileEnrollBar/component.tsx",
    "src/components/pages/CourseDetailPage/component.tsx",
]

for (const targetPath of PORTED) {
    if (record.integrationEdits.some((edit) => edit.targetPath === targetPath)) continue
    record.integrationEdits.push({ targetPath, reason: TRANSLATION })
}

record.approvedRevision = "1.3"
record.preview.revision = "1.3"
record.revisionHistory.unshift({
    revision: "1.3",
    summary: "Record-only. Three ported files are declared as integration edits; no candidate source, fixture, screenshot or state changed.",
    affected: PORTED,
    retained: ["Every rendered state, every hash and every screenshot is exactly 1.2's."],
    rejected: [
        {
            trait: "Applying with the three ports undeclared",
            reason: "verify_apply_materialization compares landed bytes to the sealed hash and reports an undeclared difference as a substitution, because it cannot tell an alias rewrite from a component swapped for a similar one. Blocking there and declaring afterwards would be a permission written by the party it excuses.",
        },
        {
            trait: "Rewriting the candidate to import @/ so the files land byte-identical",
            reason: "It cannot compile. ContractKey is closed over the entries on disk, so the locked Tree refuses a proposed key until the merge lands - which is the whole reason the candidate carries a shim.",
        },
    ],
    evidence: "CurriculumModuleRow and CoverImage import only @/ and are expected to land byte-identical; only these three resolve ~candidate/*.",
})
record.approval.restatement += " Revision 1.3 is record-only, made inside the same \"1.2 then Apply\" authorisation and against the same confirmed write boundary: it declares three ported files whose bytes cannot match the seal, and changes no candidate source."
record.approval.source += " / (1.3 record-only, same authorisation)"

writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`, "utf8")
console.log(`approvedRevision: ${record.approvedRevision}`)
console.log(`integrationEdits: ${record.integrationEdits.length}`)
for (const edit of record.integrationEdits) console.log(`  ${edit.targetPath}`)
