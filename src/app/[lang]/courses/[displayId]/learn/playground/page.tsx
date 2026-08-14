import { getLocale } from "next-intl/server"
import { PlaygroundHub } from "./_components"
export default async function PlaygroundPage({ params }: { params: Promise<{ displayId: string }> }) { const [{ displayId }, locale] = await Promise.all([params, getLocale()]); return <PlaygroundHub displayId={displayId} isVi={locale === "vi"} /> }
