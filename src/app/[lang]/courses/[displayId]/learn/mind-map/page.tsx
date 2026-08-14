import { getLocale } from "next-intl/server"
import { MindMapWorkspace } from "./_components"
export default async function MindMapPage({ params }: { params: Promise<{ displayId: string }> }) { const [{ displayId }, locale] = await Promise.all([params, getLocale()]); return <MindMapWorkspace displayId={displayId} isVi={locale === "vi"} /> }
