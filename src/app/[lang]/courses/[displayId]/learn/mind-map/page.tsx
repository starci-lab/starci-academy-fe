import { CourseMindMapPage } from "@/components/pages/CourseMindMapPage"

type MindMapRouteProps = { readonly params: Promise<{ displayId: string }> }

/** Mount the canonical backend-computed course mind map. */
const MindMapPage = async (input: MindMapRouteProps) => {
    const { displayId } = await input.params
    return <CourseMindMapPage displayId={displayId} />
}

export default MindMapPage
