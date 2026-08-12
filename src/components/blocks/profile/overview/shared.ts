import type { ProfileEvidenceKind } from "@/modules/api/graphql/queries/types/profile-evidence"

/** Coerce one backend numeric field without changing its semantic value. */
export const number = (value: unknown): number => typeof value === "number" ? value : Number(value ?? 0)
/** Resolve one optional backend label into renderable copy. */
export const text = (value: unknown): string | undefined => typeof value === "string" ? value : value == null ? undefined : String(value)
/** Keep a backend score inside the Progress leaf's accepted range. */
export const clamp = (value: number): number => Math.min(100, Math.max(0, Math.round(value)))

/** Public-profile evidence families owned by the Overview route. */
export type OverviewEvidenceKind = Extract<ProfileEvidenceKind,
    "job-readiness" | "courses" | "contributions" | "solved-challenges" | "coding-skills">
