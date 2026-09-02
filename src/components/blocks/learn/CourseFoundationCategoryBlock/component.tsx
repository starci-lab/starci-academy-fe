import { createContext, useContext, type ReactNode } from "react"
import { EmptyNotice } from "@starci/grammar/common"
import { SearchBox } from "@/components/leaves/SearchBox"
import type { Foundation } from "@/modules/api/graphql/queries/query-foundations"
import { TextAction } from "@starci/grammar/common"


/** Block state owned by the category resource collection. */
export type CourseFoundationCategoryBlockState = "pending" | "ready" | "empty" | "failed"
/** Localized copy and resolved rows for the category resource collection. */
export type CourseFoundationCategoryBlockData = {
    readonly search: string
    readonly clearSearch: string
    readonly empty: string
    readonly failed: string
    readonly retry: string
    readonly foundations: ReadonlyArray<Foundation>
}
/** Actions emitted by the category resource collection. */
export type CourseFoundationCategoryBlockActions = { readonly search?: (value: string) => void; readonly openResource?: (id: string) => void; readonly retry?: () => void }
/** Pure category block input. */
export type CourseFoundationCategoryBlockProps = { readonly blockState: CourseFoundationCategoryBlockState; readonly data: CourseFoundationCategoryBlockData; readonly on?: CourseFoundationCategoryBlockActions; readonly render?: () => ReactNode }

type FoundationRow = Pick<Foundation, "id" | "displayId" | "title" | "description">
const BlockContext = createContext<CourseFoundationCategoryBlockProps | undefined>(undefined)
const useBlock = () => {
    const value = useContext(BlockContext)
    if (value === undefined) throw new Error("CourseFoundationCategoryBlock slots must be rendered inside CourseFoundationCategoryBlockBase")
    return value
}

/** Render the category search control in the page-owned search slot. */
/** Props for the search slot. */
export type CourseFoundationCategoryBlockSearchProps = Record<never, never>
/** Render the category search control in the page-owned search slot. */
export const CourseFoundationCategoryBlockSearch = (props: CourseFoundationCategoryBlockSearchProps) => {
    void props
    const input = useBlock()
    return <SearchBox props={{ label: input.data.search, placeholder: input.data.search, clearLabel: input.data.clearSearch }} on={{ search: input.on?.search }} />
}

/** Render category results or the block-owned empty/error notice in the page resource slot. */
/** Props for the results slot. */
export type CourseFoundationCategoryBlockResultsProps = Record<never, never>
/** Render category results or the block-owned empty/error notice in the page resource slot. */
export const CourseFoundationCategoryBlockResults = (props: CourseFoundationCategoryBlockResultsProps) => {
    void props
    const input = useBlock()
    const loading = input.blockState === "pending"
    const rows: ReadonlyArray<FoundationRow> = loading && input.data.foundations.length === 0
        ? Array.from({ length: 6 }, (_, index) => ({ id: `pending-${index}`, displayId: `pending-${index}`, title: "", description: null }))
        : input.data.foundations
    if (input.blockState === "empty" || input.blockState === "failed") {
        return <EmptyNotice message={input.blockState === "failed" ? input.data.failed : input.data.empty} actionLabel={input.blockState === "failed" ? input.data.retry : undefined} onAction={({ act: input.on?.retry })?.act} />
    }
    return <>{rows.map((foundation) => <TextAction key={foundation.id} appearance={"section"} isSkeleton={loading} onPress={() => input.on?.openResource?.(foundation.displayId)}>{foundation.description === null ? foundation.title : `${foundation.title} · ${foundation.description}`}</TextAction>)}</>
}

/** Provide resolved block state/data/actions to the page's legal inner slots. */
export const CourseFoundationCategoryBlockBase = (props: CourseFoundationCategoryBlockProps) => {
    const { render, ...input } = props
    return <BlockContext.Provider value={input}>{render?.()}</BlockContext.Provider>
}
