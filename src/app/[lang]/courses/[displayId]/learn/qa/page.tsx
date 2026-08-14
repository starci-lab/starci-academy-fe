import { redirect } from "next/navigation"

type QaPageProps = { params: Promise<{ lang: string; displayId: string }> }

/** Legacy QA entry remains resolvable while the learn shell has no QA owner yet. */
const QaFallbackPage = async ({ params }: QaPageProps) => {
    const { lang, displayId } = await params
    redirect(`/${lang}/courses/${displayId}/learn/content`)
}

export default QaFallbackPage
