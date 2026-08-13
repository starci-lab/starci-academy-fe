import { readFileSync, writeFileSync } from "node:fs"

/**
 * Revision 1.4: the candidate stops being a copy of production and becomes production.
 *
 * The shim is gone, so `candidate.files` changes shape. Two entries leave for opposite reasons and
 * both are written down, because a file quietly dropping out of an approved set is indistinguishable
 * from a file nobody built.
 */
const ROOT = "D:/Repositories/starci-academy-fe/.artifacts/design-plan/course-detail-page-v2"
const path = `${ROOT}/design-record.json`
const record = JSON.parse(readFileSync(path, "utf8"))

// The registry merge has already landed and is covered by its integrationEdit. Its candidate copy
// no longer exists - the entries live in the locked table now - so it cannot carry a sealed hash.
record.candidate.files = record.candidate.files.filter(
    (file) => file.targetPath !== "src/components/contracts/index.ts",
)
for (const file of record.candidate.files) file.sha256 = ""

// The three ports now land byte-identical, so the translation edits they needed are gone.
const PORTED = new Set([
    "src/components/blocks/courses/CoursePricingRail/component.tsx",
    "src/components/blocks/courses/CourseMobileEnrollBar/component.tsx",
    "src/components/pages/CourseDetailPage/component.tsx",
])
record.integrationEdits = record.integrationEdits.filter((edit) => !PORTED.has(edit.targetPath))

record.approvedRevision = "1.4"
record.preview.revision = "1.4"
record.revisionHistory.unshift({
    revision: "1.4",
    summary: "The candidate's Tree shim is removed. With the seventeen entries merged into the locked registry, ContractKey admits them, so the candidate imports the production branch, registry, props and page - and is checked by production's own types instead of a looser copy.",
    affected: [
        "src/components/blocks/courses/CoursePricingRail/component.tsx",
        "src/components/blocks/courses/CourseMobileEnrollBar/component.tsx",
        "src/components/pages/CourseDetailPage/component.tsx",
    ],
    retained: [
        "Every contract, every host, every reading order and every state from 1.3. The anatomy did not move.",
    ],
    rejected: [
        {
            trait: "Keeping the shim and fixing the price line by hand",
            reason: "The shim accepted a bare ReactNode in a slot, so it checked neither leaf identity nor declared props - the price-line mismatch was the FIRST such defect, not the only possible one, and patching it would have left the rest to surface one file at a time. Removing the shim turns every remaining mismatch into a compile error in one pass.",
        },
        {
            trait: "Adding an eighteenth entry so the approved price size survived",
            reason: "price-discount-line is LOCKED and already says what a price line looks like. A course page that redefines the shared price line is how two pages stop showing prices the same way. The visual moves to what the locked entry declares.",
        },
    ],
    visualChanges: [
        "The payable price is `sm` semibold, not `md`. The locked price-discount-line declares size sm; 1.3 drew md only because the shim did not check.",
        "The discount is a Badge, not accent-toned text. The locked entry declares `discount: { leaf: \"badge\" }`.",
        "The struck original price now carries tone muted, as the locked entry declares.",
        "The pinned mobile bar shows no discount at all: the rail is where a reader compares and the bar is where they act.",
    ],
    evidence: "Repository tsc --noEmit exit 0 and eslint src exit 0 with the three files landed; candidate tsc and next build --webpack both exit 0 while importing @/components/branches/Tree and the real registry.",
})
record.approval.restatement += " Revision 1.4 was authorised by \"ok\" to a stated plan that named its purpose exactly - drop the shim so every remaining mismatch becomes a compile error in one pass - and its visual consequences are listed in revisionHistory[0].visualChanges rather than left to be noticed."
record.approval.source += " / ok (1.4, drop the shim)"

writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`, "utf8")
console.log(`approvedRevision: ${record.approvedRevision}`)
console.log(`candidate.files:  ${record.candidate.files.length}`)
for (const file of record.candidate.files) console.log(`  ${file.targetPath}`)
console.log(`integrationEdits: ${record.integrationEdits.length}`)
for (const edit of record.integrationEdits) console.log(`  ${edit.targetPath}`)
