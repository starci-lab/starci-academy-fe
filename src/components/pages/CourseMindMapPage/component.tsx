import { CourseMindMapBlock } from "@/components/blocks/learn/CourseMindMap"
/** Route identity passed to the connected graph block. */
export type CourseMindMapPageProps = { readonly displayId: string }
/** Route shell; the connected graph block owns query, search, selection and navigation. */
export const CourseMindMapPageBase = (props: CourseMindMapPageProps) => {
    const { displayId } = props
    return <CourseMindMapBlock displayId={displayId} />
}
