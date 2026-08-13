import { readFileSync, writeFileSync } from "node:fs"

/**
 * Revision 1.5, record-only: correct the route target, and correct the reason recorded for it.
 *
 * Apply reported that this repository "has no [locale] segment". That was read off the `src/app`
 * folder listing, and it described the FILESYSTEM while being written as though it described the
 * URL. The URL has carried a locale all along: `src/middleware.ts` runs next-intl's middleware over
 * everything that is not `api`, `_next` or a file with a dot, and the production build lists every
 * route as `/[lang]/…` - `/[lang]/courses`, `/[lang]/dashboard`, `/[lang]/authentication`.
 *
 * So the folder is flat ON PURPOSE and the locale is prefixed by middleware. The route needs no
 * locale folder of its own, and creating one would add a second, competing mechanism for the same
 * thing. Two claims made on the strength of the wrong reading are also withdrawn here rather than
 * left standing: that reproducing /vi/courses/... required a new segment, and that moving routes
 * under a locale would break the Keycloak redirect URI - authentication is already at
 * /[lang]/authentication, so nothing about it moves.
 */
const ROOT = "D:/Repositories/starci-academy-fe/.artifacts/design-plan/course-detail-page-v2"
const path = `${ROOT}/design-record.json`
const record = JSON.parse(readFileSync(path, "utf8"))

const edit = record.integrationEdits.find((entry) => entry.targetPath.includes("courses/[displayId]"))
edit.targetPath = "src/app/courses/[displayId]/page.tsx"
edit.reason = "The route does not exist in the target. Apply creates it together with the single-course GraphQL document and its SWR hook; the candidate has no request pipeline and drives its states from a fixture. The folder carries NO locale segment because the locale is not in the folder: src/middleware.ts runs next-intl's middleware over every non-api, non-asset path and prefixes it, so this file is served at /vi/courses/<displayId> - the production baseline URL - with src/app staying flat exactly as every other route in this repository does."

record.approvedRevision = "1.5"
record.preview.revision = "1.5"
record.revisionHistory.unshift({
    revision: "1.5",
    summary: "Record-only. The route target loses its [locale] folder, because the repository already prefixes the locale in middleware and its src/app is flat by design.",
    affected: ["integrationEdits: src/app/courses/[displayId]/page.tsx"],
    retained: ["No candidate source, fixture, screenshot, hash or state changed. 1.4's seal content is otherwise intact."],
    rejected: [
        {
            trait: "Creating src/app/[locale]/courses/[displayId]/page.tsx",
            reason: "It would add a second mechanism for something middleware already does, and it would be the only route in the repository shaped that way. The production build lists /[lang]/courses, /[lang]/dashboard and /[lang]/authentication - all from flat folders.",
        },
        {
            trait: "Leaving the earlier drift note standing",
            reason: "It said the repository has no [locale] segment. That was true of the folder tree and false of the URL, and it was written as though it were about the URL - which is what a decision was then taken on. Two further claims rested on it and are withdrawn: that the baseline URL needed a new segment, and that a locale migration would break the Keycloak redirect URI.",
        },
    ],
    evidence: "src/i18n/routing.ts defines locales and defaultLocale; src/middleware.ts exports createMiddleware(routing) with matcher /((?!api|_next|_vercel|.*\\..*).*); next build --webpack lists every page route under /[lang]/.",
})
record.approval.restatement += " Revision 1.5 is record-only and CORRECTS an error of mine: the [locale] question was put to the user on a wrong reading of the repository, and the answer they gave - add the segment - is already what the repository does, in middleware rather than in folders."
record.approval.source += " / (1.5 record-only correction)"

writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`, "utf8")
console.log(`approvedRevision: ${record.approvedRevision}`)
console.log(`route target:     ${edit.targetPath}`)
