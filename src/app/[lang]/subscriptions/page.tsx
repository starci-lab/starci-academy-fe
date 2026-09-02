import { ShellNav } from "@/components/product-shells/ShellNav"
import { ProSubscriptionPage } from "@/components/pages/ProSubscriptionPage"

/** Canonical localized route for the StarCi Pro subscription offer. */
export const dynamic = "force-dynamic"

const Route = () => (
    <>
        <ShellNav {...{}} />
        <ProSubscriptionPage {...{}} />
    </>
)

export default Route
