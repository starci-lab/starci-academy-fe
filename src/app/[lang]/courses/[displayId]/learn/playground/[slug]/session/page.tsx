import { getLocale } from "next-intl/server"
import { PlaygroundSession } from "../../_components"
export default async function PlaygroundSessionPage({ params }: { params: Promise<{ displayId: string, slug: string }> }) { const [{ displayId, slug }, locale] = await Promise.all([params, getLocale()]); return <PlaygroundSession displayId={displayId} slug={slug} isVi={locale === "vi"} /> }
