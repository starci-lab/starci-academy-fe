/** Decode one opaque GraphQL global id; malformed values never become mutation ids. */
export const fromGlobalId = (value: string): { entityName: string; id: string } | null => {
    try {
        const decoded = globalThis.atob(value)
        const separator = decoded.indexOf(":")
        if (separator <= 0 || separator === decoded.length - 1) return null
        return { entityName: decoded.slice(0, separator), id: decoded.slice(separator + 1) }
    } catch { return null }
}
