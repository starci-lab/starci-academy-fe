import { redirect } from "next/navigation"

interface LegacySubscriptionsRouteProps {
    readonly params: Promise<{ readonly lang: string }>
}

/** Preserve old bookmarks while correcting the public route spelling. */
const LegacySubscriptionsRoute = async ({ params }: LegacySubscriptionsRouteProps) => {
    const { lang } = await params
    redirect(`/${lang}/subscriptions`)
}

export default LegacySubscriptionsRoute
