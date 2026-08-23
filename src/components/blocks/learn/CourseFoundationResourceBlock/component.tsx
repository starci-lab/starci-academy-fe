import { createContext, useContext, type ReactNode } from "react"
import { Article } from "@/components/branches/Article"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import type { Foundation } from "@/modules/api/graphql/queries/query-foundations"

/** Block state owned by the foundation resource reader. */
export type CourseFoundationResourceBlockState = "pending" | "ready" | "not-found" | "failed"
/** Localized copy and resolved resource for the reader. */
export type CourseFoundationResourceBlockData = { readonly resource?: Foundation | null; readonly titleFallback: string; readonly notFound: string; readonly failed: string; readonly retry: string; readonly back: string; readonly openPlayground: string }
/** Actions emitted by the foundation resource reader. */
export type CourseFoundationResourceBlockActions = { readonly back?: () => void; readonly retry?: () => void; readonly openPlayground?: () => void }
/** Pure resource block input. */
export type CourseFoundationResourceBlockProps = { readonly blockState: CourseFoundationResourceBlockState; readonly data: CourseFoundationResourceBlockData; readonly on?: CourseFoundationResourceBlockActions; readonly render?: () => ReactNode }

const BlockContext = createContext<CourseFoundationResourceBlockProps | undefined>(undefined)
const useBlock = () => {
    const value = useContext(BlockContext)
    if (value === undefined) throw new Error("CourseFoundationResourceBlock slots must be rendered inside CourseFoundationResourceBlockBase")
    return value
}

/** Render the page-owned back control. */
export const CourseFoundationResourceBlockBack = () => { const input = useBlock(); return <Button props={{ label: input.data.back, variant: "ghost" }} on={{ press: input.on?.back }} /> }
/** Render the page-owned resource heading. */
export const CourseFoundationResourceBlockHeader = () => { const input = useBlock(); return input.blockState === "not-found" || input.blockState === "failed" ? null : <Heading props={{ content: input.data.resource?.title ?? input.data.titleFallback, level: 1 }} isLoading={input.blockState === "pending"} /> }
/** Render the page-owned resource description. */
export const CourseFoundationResourceBlockDescription = () => { const input = useBlock(); return input.blockState === "not-found" || input.blockState === "failed" ? null : <Text props={{ content: input.data.resource?.description ?? "", size: "sm", tone: "muted" }} isLoading={input.blockState === "pending"} /> }
/** Render the page-owned resource article. */
export const CourseFoundationResourceBlockBody = () => { const input = useBlock(); return input.blockState === "not-found" || input.blockState === "failed" ? null : <Article props={{ body: input.data.resource?.value ?? undefined }} isLoading={input.blockState === "pending"} /> }
/** Render the page-owned practice action. */
export const CourseFoundationResourceBlockPractice = () => { const input = useBlock(); return input.blockState === "not-found" || input.blockState === "failed" ? null : <Button props={{ label: input.data.openPlayground, variant: "primary" }} on={{ press: input.on?.openPlayground }} isLoading={input.blockState === "pending"} /> }
/** Render the block-owned unavailable notice. */
export const CourseFoundationResourceBlockNotice = () => { const input = useBlock(); return input.blockState === "not-found" || input.blockState === "failed" ? <EmptyNotice props={{ message: input.blockState === "failed" ? input.data.failed : input.data.notFound, actionLabel: input.blockState === "failed" ? input.data.retry : undefined }} on={{ act: input.on?.retry }} /> : null }

/** Provide resolved resource state/data/actions to page-owned inner slots. */
export const CourseFoundationResourceBlockBase = ({ render, ...input }: CourseFoundationResourceBlockProps) => <BlockContext.Provider value={input}>{render?.()}</BlockContext.Provider>

/** Source-level ownership marker for the pure block slots. */
export const meta = { world: "pure", domain: "learn" } as const
