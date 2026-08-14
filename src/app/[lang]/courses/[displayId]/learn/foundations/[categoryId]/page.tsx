import { getLocale } from "next-intl/server"
import { FoundationsCategory } from "../_components"

export default async function FoundationsCategoryPage({ params }: { params: Promise<{ displayId: string, categoryId: string }> }) { const [{ displayId, categoryId }, locale] = await Promise.all([params, getLocale()]); return <FoundationsCategory displayId={displayId} categoryId={categoryId} isVi={locale === "vi"} /> }
