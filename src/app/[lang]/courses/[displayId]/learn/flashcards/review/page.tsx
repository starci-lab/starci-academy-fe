import { FlashcardsSurface } from "../_components"

type PageProps = { params: Promise<{ lang: string, displayId: string }> }

const Page = async ({ params }: PageProps) => {
    const { lang, displayId } = await params
    return <FlashcardsSurface lang={lang} displayId={displayId} />
}

export default Page
