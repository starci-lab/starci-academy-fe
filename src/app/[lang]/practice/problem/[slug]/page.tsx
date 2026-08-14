import { CodingProblemPage } from "@/components/pages/CodingProblemPage"

/** Props the segment hands down. */
interface PageProps {
    /** Route params; `slug` is the problem's stable URL slug. */
    params: Promise<{ slug: string }>
}

/** One problem: read it, solve it, watch the verdict. */
const Page = async ({ params }: PageProps) => {
    const { slug } = await params
    return <CodingProblemPage slug={slug} />
}

export default Page
