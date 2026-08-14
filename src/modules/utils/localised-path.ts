/**
 * The path to hand a locale-aware router, given one that may already carry a locale.
 *
 * THE ROUTER ADDS THE LOCALE ITSELF. `@/i18n/navigation` returns a router that prefixes every push
 * with the active locale, so a caller that prefixes as well produces `/vi/vi/courses/...` - a real
 * 404 on a link that looks correct in the source, because both halves of the mistake read as
 * careful code. Four call sites did exactly this.
 *
 * IT ACCEPTS EITHER SHAPE, because the answer comes from a server that is free to include the
 * locale or not: `resolveRoute` returns a path for a course, and whether that path is localised is
 * its business rather than the caller's. So the caller states what it wants - a path with no locale
 * on it - and this is the one place that knows how to get one.
 *
 * @param path - a route path, with or without a leading locale segment.
 * @param locale - the active locale.
 */
export const withoutLocale = (path: string, locale: string): string =>
    path === `/${locale}`
        ? "/"
        : path.startsWith(`/${locale}/`)
            ? path.slice(locale.length + 1)
            : path
