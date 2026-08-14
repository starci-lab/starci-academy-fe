import { CourseQaPage } from "@/components/pages/CourseQaPage"

type QaPageProps = { params: Promise<{ lang: string; displayId: string }> }

const QaPage = async ({ params }: QaPageProps) => {
    const { displayId } = await params
    return <CourseQaPage displayId={displayId} />
}

export default QaPage
