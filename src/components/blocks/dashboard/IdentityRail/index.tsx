"use client"

import { useTranslations } from "next-intl"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { StreakStatRow } from "@/components/blocks/dashboard/StreakStatRow"
import { CreditStatRow } from "@/components/blocks/dashboard/CreditStatRow"
import { RewardStatRow } from "@/components/blocks/dashboard/RewardStatRow"

/**
 * BLOCK - `IdentityRail`: the three standing figures, read as one rail.
 *
 * A BLOCK MADE OF BLOCKS. It owns no request of its own - each row settles on its own - so it has
 * no state either, and the three rows appear as each one answers rather than all at the speed of
 * the slowest. That is the deliberate trade: out of step beats held hostage.
 *
 * WHAT IT DOES OWN is the seam between them, which is a contract, and the name over them, which is
 * copy. Nothing else.
 *
 * THE UNDERSCORE'S PROMISE IS LOCAL, NOT TRANSITIVE. There is no `_IdentityRail` because there is
 * nothing to resolve here; and a test rendering this mounts three blocks that fetch.
 */
export const IdentityRail = () => {
    const t = useTranslations("dashboard")
    return (
        <SurfaceCard props={{ label: t("railHeading") }}>
            <Tree contract="stacked-sections">
                <StreakStatRow />
                <CreditStatRow />
                <RewardStatRow />
            </Tree>
        </SurfaceCard>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "identity" } as const
