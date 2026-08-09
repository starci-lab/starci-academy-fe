"use client"

import { AuthenticationPage } from "@/components/pages/AuthenticationPage"

/**
 * The `/authentication` route. It renders the page component and nothing else: the route is a
 * mounting point, so every decision about what signing in IS lives one tier down where it can
 * be rendered, tested and changed without a router.
 */
const AuthenticationRoute = () => <AuthenticationPage />

export default AuthenticationRoute
