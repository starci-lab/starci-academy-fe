import { redirect } from "next/navigation"

interface LearnIndexPageProps {
    params: Promise<{ lang: string, displayId: string }>
}

/** Preserve the legacy `/learn` entry point by landing on the course content home. */
const LearnIndexPage = async ({ params }: LearnIndexPageProps) => {
    const { lang, displayId } = await params
    redirect(`/${lang}/courses/${displayId}/learn/content`)
}

export default LearnIndexPage
