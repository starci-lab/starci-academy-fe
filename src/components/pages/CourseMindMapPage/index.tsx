"use client"
import { CourseMindMapPageBase } from "./component"
/** Render the course mind-map route shell. */
export const CourseMindMapPage = (input: Parameters<typeof CourseMindMapPageBase>[0]) => <CourseMindMapPageBase {...input} />
export * from "./component"
/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
