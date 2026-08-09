"use client"

import { _DashboardPage, type DashboardPageLabels } from "./component"

/**
 * PAGE - `DashboardPage`, connected half.
 *
 * The page owns no request of its own: every figure on screen belongs to a block that
 * fetches it, so the only thing left to resolve here is the copy. When the translation
 * tier lands, this is the file that reads it - the presentational half keeps rendering
 * already-resolved strings and does not change.
 */

/** Copy the dashboard renders. It moves to the translation tier when that tier exists. */
const LABELS: DashboardPageLabels = {
    title: "Dashboard",
    progressHeading: "Your progress",
}

/**
 * The dashboard surface.
 */
export const DashboardPage = () => <_DashboardPage labels={LABELS} />
