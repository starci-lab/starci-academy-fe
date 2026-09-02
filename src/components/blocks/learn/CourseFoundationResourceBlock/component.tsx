import { createContext, useContext, type ReactNode } from "react"
import { Article } from "@/components/branches/Article"
import { EmptyNotice } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"

import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
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
/** Props for the resource back slot. */
export type CourseFoundationResourceBlockBackProps = Record<never, never>
/** Render the page-owned back control. */
export const CourseFoundationResourceBlockBack = (props: CourseFoundationResourceBlockBackProps) => { void props; const input = useBlock(); return <Button variant="ghost" onPress={input.on?.back}>{input.data.back}</Button> }
/** Render the page-owned resource heading. */
/** Props for the resource header slot. */
export type CourseFoundationResourceBlockHeaderProps = Record<never, never>
/** Render the page-owned resource heading. */
export const CourseFoundationResourceBlockHeader = (props: CourseFoundationResourceBlockHeaderProps) => { void props; const input = useBlock(); return input.blockState === "not-found" || input.blockState === "failed" ? null : <Heading level={1} isSkeleton={input.blockState === "pending"}>{input.data.resource?.title ?? input.data.titleFallback}</Heading> }
/** Render the page-owned resource description. */
/** Props for the resource description slot. */
export type CourseFoundationResourceBlockDescriptionProps = Record<never, never>
/** Render the page-owned resource description. */
export const CourseFoundationResourceBlockDescription = (props: CourseFoundationResourceBlockDescriptionProps) => { void props; const input = useBlock(); return input.blockState === "not-found" || input.blockState === "failed" ? null : <Text size={"sm"} tone={"muted"} isSkeleton={input.blockState === "pending"}>{input.data.resource?.description ?? ""}</Text> }
/** Render the page-owned resource article. */
/** Props for the resource body slot. */
export type CourseFoundationResourceBlockBodyProps = Record<never, never>
/** Render the page-owned resource article. */
export const CourseFoundationResourceBlockBody = (props: CourseFoundationResourceBlockBodyProps) => { void props; const input = useBlock(); return input.blockState === "not-found" || input.blockState === "failed" ? null : <Article props={{ body: input.data.resource?.value ?? undefined }} isLoading={input.blockState === "pending"} /> }
/** Render the page-owned practice action. */
/** Props for the resource practice slot. */
export type CourseFoundationResourceBlockPracticeProps = Record<never, never>
/** Render the page-owned practice action. */
export const CourseFoundationResourceBlockPractice = (props: CourseFoundationResourceBlockPracticeProps) => { void props; const input = useBlock(); return input.blockState === "not-found" || input.blockState === "failed" ? null : <Button variant={"primary"} isSkeleton={input.blockState === "pending"} onPress={({ press: input.on?.openPlayground })?.press}>{input.data.openPlayground}</Button> }
/** Render the block-owned unavailable notice. */
/** Props for the resource notice slot. */
export type CourseFoundationResourceBlockNoticeProps = Record<never, never>
/** Render the block-owned unavailable notice. */
export const CourseFoundationResourceBlockNotice = (props: CourseFoundationResourceBlockNoticeProps) => { void props; const input = useBlock(); return input.blockState === "not-found" || input.blockState === "failed" ? <EmptyNotice message={input.blockState === "failed" ? input.data.failed : input.data.notFound} actionLabel={input.blockState === "failed" ? input.data.retry : undefined} onAction={({ act: input.on?.retry })?.act} /> : null }

/** Provide resolved resource state/data/actions to page-owned inner slots. */
export const CourseFoundationResourceBlockBase = (props: CourseFoundationResourceBlockProps) => {
    const { render, ...input } = props
    return <BlockContext.Provider value={input}>{render?.()}</BlockContext.Provider>
}
