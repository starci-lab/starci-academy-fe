"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import type { IconName } from "@/components/leaves/Icon"
import { _QuickActions } from "./component"

/**
 * BLOCK - `QuickActions`: the rail of shortcuts beside the reading column.
 *
 * IT READS NO REQUEST, but translation and routing still make this the connected half. The pure
 * `_QuickActions` twin receives resolved labels and reports an id; only this file knows which
 * locale is active and what navigation means.
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
    const router = useRouter()
    return (
        <_QuickActions
            props={{
                label: t("quickActions"),
                items: ACTIONS.map((action) => ({
                    id: action.id,
                    icon: action.icon,
                    label: t(`actions.${action.id}`),
                })),
            }}
            on={{
                activate: (id) => {
                    const destination = ACTIONS.find((action) => action.id === id)
                    if (destination !== undefined) router.push(destination.href)
                },
            }}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "shell" } as const
