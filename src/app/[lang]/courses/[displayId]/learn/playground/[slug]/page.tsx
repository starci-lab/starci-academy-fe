import { getLocale } from "next-intl/server"
import { PlaygroundPrepare } from "../_components"
export default async function PlaygroundPreparePage({ params }: { params: Promise<{ displayId: string, slug: string }> }) { const [{ displayId, slug }, locale] = await Promise.all([params, getLocale()]); return <PlaygroundPrepare displayId={displayId} slug={slug} isVi={locale === "vi"} /> }
