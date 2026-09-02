"use client"

import { ProSubscriptionPageBase } from "./component"

/** Route-level owner for the StarCi Pro purchase surface. */
export type ProSubscriptionPageProps = Record<never, never>

/** Render the connected Pro purchase route. */
export const ProSubscriptionPage = (props: ProSubscriptionPageProps) => {
    void props
    return <ProSubscriptionPageBase {...{}} />
}
