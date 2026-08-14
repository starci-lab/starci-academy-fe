import { getLocale } from "next-intl/server"
import { FoundationsHub } from "./_components"

export default async function FoundationsPage({ params }: { params: Promise<{ displayId: string }> }) { const [{ displayId }, locale] = await Promise.all([params, getLocale()]); return <FoundationsHub displayId={displayId} isVi={locale === "vi"} /> }
