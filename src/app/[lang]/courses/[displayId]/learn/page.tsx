import { CourseLearnContentHomePage } from "@/components/pages/CourseLearnContentHomePage"

interface LearnIndexPageProps {
    params: Promise<{ lang: string, displayId: string }>
}

const LearnIndexPage = async ({ params }: LearnIndexPageProps) => {
    const { displayId } = await params
    return <CourseLearnContentHomePage displayId={displayId} />
}

export default LearnIndexPage
