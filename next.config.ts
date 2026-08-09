import type {
    NextConfig,
} from "next"

/**
 * Next configuration for the greenfield app.
 *
 * Deliberately bare. The old app's config carried an i18n plugin, an ESM
 * transpile list and a barrel-import optimisation for packages this repo does
 * not depend on; none of that is inherited here.
 *
 * `typescript.ignoreBuildErrors` is NOT set. The previous app disabled it to
 * ship past accumulated type debt — this repo starts with none, so the build
 * stays the gate it is meant to be.
 */
const nextConfig: NextConfig = {
}

export default nextConfig
