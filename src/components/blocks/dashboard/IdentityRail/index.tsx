"use client"

import { StreakStatRow } from "@/components/blocks/dashboard/StreakStatRow"
import { CreditStatRow } from "@/components/blocks/dashboard/CreditStatRow"
import { RewardStatRow } from "@/components/blocks/dashboard/RewardStatRow"
import { ProfileIdentityRow } from "@/components/blocks/dashboard/ProfileIdentityRow"
import { identityRailClassName } from "./classNames"

/**
 * BLOCK - `IdentityRail`: the three standing figures, read as one rail.
 *
 * A BLOCK MADE OF BLOCKS. It owns no request of its own - each row settles on its own - so it has
 * no state either, and the three rows appear as each one answers rather than all at the speed of
 * the slowest. That is the deliberate trade: out of step beats held hostage.
 *
 * WHAT IT DOES OWN is the seam between them, and the name over them, which is
 * copy. Nothing else.
 *
 * THE BASE SUFFIX'S PROMISE IS LOCAL, NOT TRANSITIVE. There is no `IdentityRailBase` because there is
 * nothing to resolve here; and a test rendering this mounts three blocks that fetch.
 */
/** Props for the connected identity rail. */
export type IdentityRailProps = Record<string, never>
/** Connect the IdentityRail block to its data source. */
export const IdentityRail = (props: IdentityRailProps) => {
    void props
    return (
        <div className={identityRailClassName}><ProfileIdentityRow /><StreakStatRow /><CreditStatRow /><RewardStatRow /></div>
    )
}
