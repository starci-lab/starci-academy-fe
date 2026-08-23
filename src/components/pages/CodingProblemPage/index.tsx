"use client"

import { CodingProblemPageBase } from "./component"

/** Route input supplied by the application segment. */
export interface CodingProblemPageRouteProps { readonly slug: string }

/** Resolve only the route slug; reading, verdict and editor state belong to connected blocks. */
export const CodingProblemPage = ({ slug }: CodingProblemPageRouteProps) => <CodingProblemPageBase slug={slug} />

/** Source-level ownership marker for the connected problem page shell. */
export const meta = { world: "connected", domain: "coding" } as const
