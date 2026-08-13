import { redirect } from "next/navigation"

/**
 * The site root carries no content of its own in this build - the dashboard is the
 * only surface, so the root hands the reader straight to it rather than rendering a
 * second, emptier version of the same page.
 *
 * IT USES THE PLAIN SERVER REDIRECT, NOT THE LOCALE-AWARE ONE. next-intl's helper takes its
 * destination as an `href` object when a locale is passed, and `href` for internal navigation is
 * exactly what the canon rule refuses. This file is also the one place where writing the segment
 * out is honest rather than a shortcut: adding the language to a path IS its whole job, and it
 * already holds the language it must add.
 *
 * @param props - The routed segment carrying the language.
 */
const HomePage = async ({ params }: PageProps<"/[lang]">) => {
    const { lang } = await params
    redirect(`/${lang}/dashboard`)
}

export default HomePage
