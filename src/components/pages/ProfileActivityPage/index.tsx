"use client"
import { ProfileActivityPageBase } from "./component"
/** Render the activity page shell. */
export const ProfileActivityPage = () => <ProfileActivityPageBase />
export * from "./component"
/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "profile" } as const
