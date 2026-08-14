import { redirect } from "next/navigation"

interface FlashcardsIndexRouteProps {
    readonly params: Promise<{ readonly lang: string; readonly displayId: string }>
}

/** Preserves the legacy flashcards entry by forwarding to the review overview. */
const FlashcardsIndexRoute = async ({ params }: FlashcardsIndexRouteProps) => {
    const { lang, displayId } = await params
    redirect(`/${lang}/courses/${displayId}/learn/flashcards/review`)
}

export default FlashcardsIndexRoute
