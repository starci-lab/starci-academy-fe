import { CodingDomainPage } from "@/components/pages/CodingDomainPage"

/** Props the segment hands down. */
interface PageProps {
    /** Route params; `domain` is the topic enum value. */
    params: Promise<{ domain: string }>
}

/** One interview topic and the problems in it. */
const Page = async ({ params }: PageProps) => {
    const { domain } = await params
    return <CodingDomainPage domain={domain} />
}

export default Page
