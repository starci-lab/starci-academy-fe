/**
 * BRAND MARKS - the two glyphs that may not be redrawn.
 *
 * Every other glyph in this vocabulary comes from Heroicons, sized by class and inheriting the
 * colour of the line it sits on. These two cannot: a sign-in shortcut has to show the provider's
 * OWN mark, in the provider's own colours, because that is what a reader recognises before they
 * read anything - and a monochrome stand-in reads as a generic button rather than as Google.
 *
 * They are ported from the live product's `src/components/svg`, path for path, so the two apps
 * cannot come to disagree about what Google looks like.
 *
 * GITHUB IS `currentColor` ON PURPOSE and Google is not. GitHub's mark is monochrome by
 * specification, so it takes the row's own colour and stays legible in either theme; Google's is
 * defined by its colours, and drawing it in one would be drawing a different mark.
 */

import type { SVGProps } from "react"

/** Google's mark, in Google's colours. */
export const GoogleMark = (input: SVGProps<SVGSVGElement>) => (
    <svg {...input} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M22.36 10H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09c.87-2.6 3.3-4.53 6.16-4.53 1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07 1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93C3.99 20.53 7.7 23 12 23c2.97 0 5.46-.98 7.28-2.66 2.08-1.92 3.28-4.74 3.28-8.09 0-.78-.07-1.53-.2-2.25z"
            fill="#4285f4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53l-3.66 2.83C3.99 20.53 7.7 23 12 23z"
            fill="#34a853"
        />
        <path
            d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1L2.18 7.07C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
            fill="#fbbc05"
        />
        <path
            d="M12 5.48c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.3 9.14 5.48 12 5.48z"
            fill="#ea4335"
        />
    </svg>
)

/** GitHub's mark, which is monochrome by specification and so takes the row's own colour. */
export const GithubMark = (input: SVGProps<SVGSVGElement>) => (
    <svg {...input} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.65.5.5 5.74.5 12.22c0 5.18 3.29 9.58 7.86 11.14.58.11.79-.26.79-.57 0-.28-.01-1.02-.02-2-3.2.71-3.88-1.58-3.88-1.58-.52-1.36-1.28-1.72-1.28-1.72-1.04-.74.08-.73.08-.73 1.15.08 1.76 1.21 1.76 1.21 1.02 1.79 2.67 1.27 3.32.97.1-.76.4-1.27.73-1.56-2.56-.3-5.25-1.3-5.25-5.8 0-1.28.44-2.33 1.16-3.15-.12-.3-.51-1.5.11-3.12 0 0 .95-.31 3.11 1.2a10.49 10.49 0 0 1 5.66 0c2.16-1.5 3.11-1.2 3.11-1.2.62 1.62.23 2.82.11 3.12.72.82 1.16 1.87 1.16 3.15 0 4.51-2.7 5.5-5.26 5.79.41.36.77 1.08.77 2.18 0 1.57-.01 2.83-.01 3.21 0 .31.2.69.8.57 4.57-1.56 7.85-5.96 7.85-11.14C23.5 5.74 18.35.5 12 .5Z" />
    </svg>
)

/**
 * Facebook's mark, in Facebook's blue.
 *
 * The legacy contact page drew this from `react-icons/fa6`, which ICON-7 refuses by name. The mark
 * itself is not the objection - reaching a whole general-purpose brand catalogue is - so it is
 * ported here as a local path the same way Google's was, and the vocabulary stays closed.
 */
export const FacebookMark = (input: SVGProps<SVGSVGElement>) => (
    <svg {...input} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z"
            fill="#1877f2"
        />
        <path
            d="m16.67 15.56.53-3.49h-3.33V9.82c0-.96.47-1.89 1.96-1.89h1.51V4.96s-1.37-.24-2.68-.24c-2.74 0-4.53 1.67-4.53 4.69v2.66H7.08v3.49h3.05V24a12.1 12.1 0 0 0 3.74 0v-8.44h2.8Z"
            fill="#fff"
        />
    </svg>
)

/**
 * LinkedIn's mark, in LinkedIn's blue. Same porting reason as Facebook's above.
 */
export const LinkedinMark = (input: SVGProps<SVGSVGElement>) => (
    <svg {...input} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"
            fill="#0a66c2"
        />
    </svg>
)
