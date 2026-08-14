import { CourseLearnTodayPage } from "@/components/pages/CourseLearnTodayPage"

interface LearnIndexPageProps {
    params: Promise<{ lang: string, displayId: string }>
}

const LearnIndexPage = async ({ params }: LearnIndexPageProps) => {
    const { displayId } = await params
    return <CourseLearnTodayPage displayId={displayId} />
}

export default LearnIndexPage
