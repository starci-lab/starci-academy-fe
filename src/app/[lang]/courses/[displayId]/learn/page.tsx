import { redirect } from "next/navigation"

interface LearnIndexPageProps {
    params: Promise<{ lang: string, displayId: string }>
}

const LearnIndexPage = async ({ params }: LearnIndexPageProps) => {
    const { lang, displayId } = await params
    redirect(`/${lang}/courses/${displayId}/learn/content`)
}

export default LearnIndexPage
