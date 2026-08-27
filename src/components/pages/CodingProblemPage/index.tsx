"use client"

import { CodingProblemPageBase } from "./component"

/** Route input supplied by the application segment. */
export type CodingProblemPageProps = { readonly slug: string }

/** Resolve only the route slug; reading, verdict and editor state belong to connected blocks. */
export const CodingProblemPage = (props: CodingProblemPageProps) => {
    const { slug } = props
    return <CodingProblemPageBase slug={slug} />
}
