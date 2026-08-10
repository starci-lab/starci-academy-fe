import createNextIntlPlugin from "next-intl/plugin"
import type {
    NextConfig,
} from "next"

/**
 * Next configuration for the greenfield app.
 *
 * Deliberately bare apart from the translation plugin. The old app's config also carried an ESM
 * transpile list and a barrel-import optimisation for packages this repo does not depend on;
 * neither is inherited here.
 *
 * The i18n plugin is what lets `src/i18n/request.ts` resolve a locale per request, so a
 * component can ask for a string instead of holding an English sentence.
 *
 * `typescript.ignoreBuildErrors` is NOT set. The previous app disabled it to
 * ship past accumulated type debt — this repo starts with none, so the build
 * stays the gate it is meant to be.
 */
const nextConfig: NextConfig = {
}

export default createNextIntlPlugin()(nextConfig)
