"use client"

import { DashboardPage } from "@/components/pages/DashboardPage"

/**
 * The `/dashboard` route. It renders the page component and nothing else: the route
 * is a mounting point, so every decision about what the dashboard IS lives one tier
 * down where it can be rendered, tested and changed without a router.
 */
const DashboardRoute = () => <DashboardPage />

export default DashboardRoute
