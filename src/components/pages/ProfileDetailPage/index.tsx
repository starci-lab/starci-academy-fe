"use client"

import { ProfileDetailPageBase } from "./component"

/** Render the route shell; params and coding-proof evidence belong to the connected block. */
export const ProfileDetailPage = () => <ProfileDetailPageBase />

export * from "./component"
/** Source-level ownership marker for the connected route entry. */
export const meta = { world: "connected", domain: "profile" } as const
