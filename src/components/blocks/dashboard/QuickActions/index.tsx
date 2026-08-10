"use client"

import { useTranslations } from "next-intl"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { QuickActionRow } from "@/components/leaves/QuickActionRow"
import type { IconName } from "@/components/leaves/Icon"

/**
 * BLOCK - `QuickActions`: the rail of shortcuts beside the reading column.
 *
 * IT READS NO REQUEST, so it has no state and no second half. The destinations are a fact about
 * the product rather than about the reader, and a rail that waited on a request would be blank on
 * every first paint for no reason.
 *
 * ORDERED BY EVERYDAY FREQUENCY, not alphabetically and not by section. The rail exists to save a
 * reader the trip through a menu, which it only does if the thing they want most is nearest the
 * top.
 */

/** The shortcuts, in the order a reader reaches for them. */
const ACTIONS: ReadonlyArray<{ id: string, href: string, icon: IconName }> = [
    { id: "course", href: "/courses", icon: "course" },
    { id: "review", href: "/review", icon: "review" },
    { id: "practice", href: "/practice", icon: "practice" },
    { id: "league", href: "/league", icon: "league" },
    { id: "saved", href: "/saved", icon: "saved" },
    { id: "rewards", href: "/rewards", icon: "reward" },
    { id: "blog", href: "/blog", icon: "explore" },
    { id: "talents", href: "/talents", icon: "talents" },
    { id: "jobs", href: "/jobs", icon: "jobs" },
]

/**
 * Draw the rail.
 */
export const QuickActions = () => {
    const t = useTranslations("shell")
    return (
        <SurfaceCard props={{ label: t("quickActions") }}>
            <Tree contract="stacked-peer-controls">
                {ACTIONS.map((action) => (
                    <QuickActionRow
                        key={action.id}
                        props={{
                            id: action.id,
                            href: action.href,
                            icon: action.icon,
                            label: t(`actions.${action.id}`),
                        }}
                    />
                ))}
            </Tree>
        </SurfaceCard>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "pure", domain: "shell" } as const
