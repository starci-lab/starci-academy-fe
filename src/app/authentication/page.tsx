"use client"

import { AuthenticationPanel } from "@/components/blocks/auth/AuthenticationPanel"

/**
 * The routed sign-in surface.
 *
 * It mounts the panel directly. There is no page component between them because there would be
 * nothing for it to do: a connected half exists only when there is something to resolve, and this
 * route resolves nothing the panel does not already resolve for itself.
 */
const AuthenticationRoute = () => <AuthenticationPanel />

export default AuthenticationRoute
