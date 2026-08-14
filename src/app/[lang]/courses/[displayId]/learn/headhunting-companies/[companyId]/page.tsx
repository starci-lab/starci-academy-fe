import { CourseHeadhuntingCompanyPage } from "@/components/pages/CourseHeadhuntingCompanyPage"

interface HeadhuntingCompanyRouteProps {
    readonly params: Promise<{ readonly displayId: string; readonly companyId: string }>
}

const HeadhuntingCompanyRoute = async ({ params }: HeadhuntingCompanyRouteProps) => {
    const { displayId, companyId } = await params
    return <CourseHeadhuntingCompanyPage displayId={displayId} companyId={companyId} />
}

export default HeadhuntingCompanyRoute
