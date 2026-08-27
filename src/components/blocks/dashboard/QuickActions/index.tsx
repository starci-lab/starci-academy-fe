"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import type { IconName } from "@/components/leaves/Icon"
import { QuickActionsBase } from "./component"

/**
 * BLOCK - `QuickActions`: the rail of shortcuts beside the reading column.
 *
 * IT READS NO REQUEST, but translation and routing still make this the connected half. The pure
 * `QuickActionsBase` twin receives resolved labels and reports an id; only this file knows which
 * locale is active and what navigation means.
 *
 * ORDERED BY EVERYDAY FREQUENCY, not alphabetically and not by section. The rail exists to save a
 * reader the trip through a menu, which it only does if the thing they want most is nearest the
 * top.
 */

/** The shortcuts, in the order a reader reaches for them. */
const ACTIONS: ReadonlyArray<{ id: string, path: string, icon: IconName }> = [
    { id: "course", path: "/courses", icon: "course" },
    { id: "review", path: "/review", icon: "review" },
    { id: "practice", path: "/practice", icon: "practice" },
    { id: "league", path: "/league", icon: "league" },
    { id: "saved", path: "/saved", icon: "saved" },
    { id: "rewards", path: "/rewards", icon: "reward" },
    { id: "blog", path: "/blog", icon: "blog" },
    { id: "talents", path: "/talents", icon: "talents" },
    { id: "jobs", path: "/jobs", icon: "jobs" },
]

/**
 * Draw the rail.
 */
/** Props for the connected quick actions block. */
export type QuickActionsProps = Record<string, never>
/** Connect the QuickActions block to its data source. */
export const QuickActions = (props: QuickActionsProps) => {
    void props
    const t = useTranslations("shell")
    const router = useRouter()
    return (
        <QuickActionsBase
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
                    if (destination !== undefined) router.push(destination.path)
                },
            }}
        />
    )
}
