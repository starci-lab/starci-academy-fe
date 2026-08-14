import { getLocale } from "next-intl/server"
import { FoundationResource } from "../../_components"

export default async function FoundationResourcePage({ params }: { params: Promise<{ displayId: string, categoryId: string, foundationId: string }> }) { const [{ displayId, categoryId, foundationId }, locale] = await Promise.all([params, getLocale()]); return <FoundationResource displayId={displayId} categoryId={categoryId} foundationId={foundationId} isVi={locale === "vi"} /> }
