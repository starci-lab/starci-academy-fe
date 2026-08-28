import { readFile } from "node:fs/promises"

const activeCaseIds = new Set([
    "authentication.sign-in.happy",
    "authentication.sign-in.password-failed",
    "authentication.sign-in.not-receive-otp",
    "authentication.sign-in.invalid-otp",
    "authentication.sign-in.expired-otp",
    "authentication.sign-in.missing-challenge",
    "authentication.sign-in.server-unavailable",
    "authentication.sign-in.rate-limited",
    "authentication.sign-in.duplicate-submission",
    "authentication.sign-up.happy",
    "authentication.sign-up.existing-email",
    "authentication.sign-up.password-mismatch",
    "authentication.sign-up.terms-required",
    "authentication.forgot-password.happy",
    "authentication.forgot-password.unhappy",
    "dashboard.landing-and-tabs.happy",
    "dashboard.landing-and-tabs.unhappy",
    "profile.public-view.happy",
    "profile.public-view.unhappy",
])

const retiredCaseIds = new Set([
    "authentication.sign-in.unhappy",
    "authentication.sign-up.unhappy",
])

const requiredCaseIds = new Set([...activeCaseIds, ...retiredCaseIds])

const legacyReviewFiles = [
    "../reviews/authentication/sign-in.md",
    "../reviews/authentication/sign-up.md",
    "../reviews/authentication/forgot-password.md",
    "../reviews/dashboard/landing-and-tabs.md",
    "../reviews/profile/public-view.md",
]

const caseReviewFiles = [
    "../reviews/authentication/sign-in-happy.md",
    "../reviews/authentication/sign-in-password-failed.md",
    "../reviews/authentication/sign-in-not-receive-otp.md",
    "../reviews/authentication/sign-in-invalid-otp.md",
    "../reviews/authentication/sign-in-expired-otp.md",
    "../reviews/authentication/sign-in-missing-challenge.md",
    "../reviews/authentication/sign-in-server-unavailable.md",
    "../reviews/authentication/sign-in-rate-limited.md",
    "../reviews/authentication/sign-in-duplicate-submission.md",
    "../reviews/authentication/sign-up-existing-email.md",
    "../reviews/authentication/sign-up-password-mismatch.md",
    "../reviews/authentication/sign-up-terms-required.md",
]

const retiredReviewFiles = [
    "../reviews/authentication/sign-in-unhappy.md",
    "../reviews/authentication/sign-up-unhappy.md",
]

const registry = JSON.parse(await readFile(new URL("../accounts.json", import.meta.url), "utf8"))
if (registry.version !== 1 || !Array.isArray(registry.accounts)) {
    throw new Error("accounts.json must be a version 1 registry")
}
if (registry.password_binding?.encrypted_ref !== "backend:.stacks/dev/runtime/files/uat-account-password.key.enc"
    || registry.password_binding?.handling !== "plaintext-memory-only") {
    throw new Error("accounts.json must declare the encrypted UAT password binding")
}

const caseIds = registry.accounts.map((account) => account.case_id)
const emails = registry.accounts.map((account) => account.email)
if (new Set(caseIds).size !== caseIds.length) throw new Error("accounts.json contains duplicate case_id")
if (new Set(emails).size !== emails.length) throw new Error("accounts.json contains reused UAT identities")

for (const account of registry.accounts) {
    if (account.is_uat !== true) throw new Error(`${account.case_id} is missing is_uat=true`)
    if (!["present", "absent"].includes(account.initial_state)) {
        throw new Error(`${account.case_id} has an invalid initial_state`)
    }
    const expectedStatus = retiredCaseIds.has(account.case_id) ? "retired" : "active"
    if ((account.status ?? "active") !== expectedStatus) {
        throw new Error(`${account.case_id} must have status=${expectedStatus}`)
    }
}

const actualCaseIds = new Set(caseIds)
const missing = [...requiredCaseIds].filter((caseId) => !actualCaseIds.has(caseId))
const unexpected = [...actualCaseIds].filter((caseId) => !requiredCaseIds.has(caseId))
if (missing.length || unexpected.length) {
    throw new Error(`pilot registry mismatch; missing=${missing.join(",") || "none"}; unexpected=${unexpected.join(",") || "none"}`)
}

const retiredAccount = registry.accounts.find((account) => account.case_id === "authentication.sign-in.unhappy")
const granularSignInCaseIds = [...activeCaseIds].filter((caseId) => caseId.startsWith("authentication.sign-in.") && caseId !== "authentication.sign-in.happy")
if (!retiredAccount || !Array.isArray(retiredAccount.replaced_by)) {
    throw new Error("retired authentication.sign-in.unhappy must preserve a replaced_by provenance map")
}
const missingReplacements = granularSignInCaseIds.filter((caseId) => !retiredAccount.replaced_by.includes(caseId))
const unexpectedReplacements = retiredAccount.replaced_by.filter((caseId) => !granularSignInCaseIds.includes(caseId))
if (missingReplacements.length || unexpectedReplacements.length) {
    throw new Error(`retired sign-in replacement map mismatch; missing=${missingReplacements.join(",") || "none"}; unexpected=${unexpectedReplacements.join(",") || "none"}`)
}

const retiredSignUpAccount = registry.accounts.find((account) => account.case_id === "authentication.sign-up.unhappy")
const granularSignUpCaseIds = [...activeCaseIds].filter((caseId) => caseId.startsWith("authentication.sign-up.") && caseId !== "authentication.sign-up.happy")
if (!retiredSignUpAccount || !Array.isArray(retiredSignUpAccount.replaced_by)) {
    throw new Error("retired authentication.sign-up.unhappy must preserve a replaced_by provenance map")
}
const missingSignUpReplacements = granularSignUpCaseIds.filter((caseId) => !retiredSignUpAccount.replaced_by.includes(caseId))
const unexpectedSignUpReplacements = retiredSignUpAccount.replaced_by.filter((caseId) => !granularSignUpCaseIds.includes(caseId))
if (missingSignUpReplacements.length || unexpectedSignUpReplacements.length) {
    throw new Error(`retired sign-up replacement map mismatch; missing=${missingSignUpReplacements.join(",") || "none"}; unexpected=${unexpectedSignUpReplacements.join(",") || "none"}`)
}

const template = await readFile(new URL("../REVIEW-TEMPLATE.md", import.meta.url), "utf8")
for (const requiredText of [
    "## Behavior decision",
    "## UX decision",
    "## UI decision",
    "## Case contract",
    "## Isolation receipt",
    "## Steps and checkpoints",
    "## Findings and repair loop",
    "## Terminal gate",
    "SUSPENSE",
    "NO SUSPENSE",
    "UAT account or absent reservation",
    "Password binding",
    "Browser session",
]) {
    if (!template.includes(requiredText)) throw new Error(`REVIEW-TEMPLATE.md is missing: ${requiredText}`)
}

const readme = await readFile(new URL("../README.md", import.meta.url), "utf8")
for (const requiredText of [
    "`.uat` thuộc repository FE",
    "feedback → sửa → retest cho đến `NO SUSPENSE`",
    "shared append-or-merge",
]) {
    if (!readme.includes(requiredText)) throw new Error(`README.md is missing: ${requiredText}`)
}

for (const reviewFile of legacyReviewFiles) {
    await readFile(new URL(reviewFile, import.meta.url), "utf8")
}

const reviewOwners = []
for (const reviewFile of caseReviewFiles) {
    const review = await readFile(new URL(reviewFile, import.meta.url), "utf8")
    for (const requiredHeading of [
        "## Case contract",
        "## Isolation receipt",
        "## Steps and checkpoints",
        "## Behavior decision",
        "## UX decision",
        "## UI decision",
        "## Findings and repair loop",
        "## Terminal gate",
        "TEACHER feedback",
    ]) {
        if (!review.includes(requiredHeading)) {
            throw new Error(`${reviewFile} is missing: ${requiredHeading}`)
        }
    }
    const caseId = review.match(/\| Case ID \| `([^`]+)` \|/)?.[1]
    const account = review.match(/\| UAT account(?: or absent reservation)? \| `([^`]+)` \|/)?.[1]
    const agent = review.match(/\| Agent \| `([^`]+)` \|/)?.[1]
    const browser = review.match(/\| Browser session \| `([^`]+)` \|/)?.[1]
    if (!caseId || !account || !agent || !browser) {
        throw new Error(`${reviewFile} must declare exact case/account/agent/browser owners`)
    }
    const registryAccount = registry.accounts.find((entry) => entry.case_id === caseId)
    if (!registryAccount || registryAccount.email !== account) {
        throw new Error(`${reviewFile} account does not match its registry reservation`)
    }
    reviewOwners.push({ reviewFile, caseId, account, agent, browser })
}

for (const ownerKind of ["caseId", "account", "agent", "browser"]) {
    const values = reviewOwners.map((owner) => owner[ownerKind])
    if (new Set(values).size !== values.length) {
        throw new Error(`active case reviews reuse ${ownerKind}`)
    }
}

for (const reviewFile of retiredReviewFiles) {
    const review = await readFile(new URL(reviewFile, import.meta.url), "utf8")
    for (const requiredText of [
        "Retired umbrella provenance",
        "TEACHER feedback",
        "verdict bên dưới được giữ nguyên",
    ]) {
        if (!review.includes(requiredText)) throw new Error(`${reviewFile} is missing: ${requiredText}`)
    }
}

console.log(`UAT journal valid: ${caseIds.length} isolated reservations (${activeCaseIds.size} active, ${retiredCaseIds.size} retired), ${caseReviewFiles.length} active case reviews, ${retiredReviewFiles.length} retired provenance reviews, ${legacyReviewFiles.length} legacy reviews`)
