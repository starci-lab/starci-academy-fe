const NUMERIC_LOOPBACK_HOSTS = new Set(["127.0.0.1", "::1", "[::1]"])
const LOCAL_SOURCE_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "0.0.0.0", "[::]"])

interface CanonicalRequestAuthority {
    host?: string | null
    forwardedHost?: string | null
    forwardedProto?: string | null
}

const firstAuthority = (value?: string | null): string | undefined => value?.split(",", 1)[0]?.trim() || undefined

const hostnameFromAuthority = (authority?: string | null): string | undefined => {
    const first = firstAuthority(authority)
    if (!first) return undefined
    try {
        return new URL(`http://${first}`).hostname
    } catch {
        return undefined
    }
}

/** Returns a localhost equivalent only when a browser URL uses a numeric loopback alias. */
export const canonicalLocalUrl = (
    source: URL,
    authority?: CanonicalRequestAuthority,
): URL | undefined => {
    const forwardedHostname = hostnameFromAuthority(authority?.forwardedHost)
    const sourceIsLocal = LOCAL_SOURCE_HOSTS.has(source.hostname)

    // A public source URL or original host supplied by a trusted proxy owns request authority.
    // The numeric Host header in that topology describes only the internal proxy hop.
    if (!sourceIsLocal || (forwardedHostname && !NUMERIC_LOOPBACK_HOSTS.has(forwardedHostname))) {
        return undefined
    }

    const requestedHostname = forwardedHostname ?? hostnameFromAuthority(authority?.host) ?? source.hostname
    if (!NUMERIC_LOOPBACK_HOSTS.has(requestedHostname)) return undefined

    const target = new URL(source)
    target.hostname = "localhost"
    return target
}
