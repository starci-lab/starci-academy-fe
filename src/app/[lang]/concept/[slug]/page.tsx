import { ConceptDetailPage } from "@/components/pages/ConceptDetailPage"

type ConceptDetailRouteProps = { readonly params: Promise<{ readonly slug: string }> }

/** Mount one standalone concept by the stable display id carried in its URL. */
const ConceptDetailRoute = async ({ params }: ConceptDetailRouteProps) => {
    const { slug } = await params
    return <ConceptDetailPage displayId={slug} />
}

export default ConceptDetailRoute
