import type { NextConfig } from "next"

/**
 * Candidate runtime configuration.
 *
 * Deliberately NOT the production config: production wraps itself in the next-intl plugin so
 * `src/i18n/request.ts` can resolve a locale per request. The candidate has no request pipeline
 * and no message catalogue of its own, so it mounts `NextIntlClientProvider` directly with the
 * fixture locale instead. That is the only runtime difference, and it is recorded here rather
 * than left for Apply to discover.
 *
 * Everything else — React 19, Next 16, Tailwind v4 through the same PostCSS plugin, HeroUI 3 —
 * resolves from the target's own `node_modules` by walking up from this directory.
 */
const nextConfig: NextConfig = {
    // The candidate imports locked target source from outside this directory. Next traces files
    // from the workspace root, so point it at the repository that owns those modules.
    outputFileTracingRoot: "D:/Repositories/starci-academy-fe",
    // Static export, because the review lab is a static server and embeds each rendered state
    // through a plain `candidateUrl`. The scenarios are driven by client state over fixture data,
    // so nothing here needs a request pipeline.
    output: "export",
    images: { unoptimized: true },
    // THE SERVING ROOT IS `out` ITSELF, so no base path is written into the export.
    //
    // The previous case pinned `/candidate/out` because its lab served the artifact root. Copied
    // here unchanged and served from `out`, every stylesheet and chunk 404d while the server HTML
    // still rendered - text present, no styling, and a build that reported success. A base path is
    // a fact about WHERE this is served, so it stays with the serving decision rather than being
    // inherited from another case.
}

export default nextConfig
