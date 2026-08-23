"use client"

import { ProfilePublicCvPageBase } from "./component"

/** Render the public profile CV page shell. */
export const ProfilePublicCvPage = () => <ProfilePublicCvPageBase />

export * from "./component"

/** Source-level tier marker. */
export const meta = { world: "connected", domain: "profile" } as const
