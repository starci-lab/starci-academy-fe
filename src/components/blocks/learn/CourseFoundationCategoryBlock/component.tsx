import { createContext, useContext, type ReactNode } from "react"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { NavLink } from "@/components/leaves/NavLink"
import { SearchBox } from "@/components/leaves/SearchBox"
import type { Foundation } from "@/modules/api/graphql/queries/query-foundations"

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
export const CourseFoundationCategoryBlockSearch = () => {
    const input = useBlock()
    return <SearchBox props={{ label: input.data.search, placeholder: input.data.search, clearLabel: input.data.clearSearch }} on={{ search: input.on?.search }} />
}

/** Render category results or the block-owned empty/error notice in the page resource slot. */
export const CourseFoundationCategoryBlockResults = () => {
    const input = useBlock()
    const loading = input.blockState === "pending"
    const rows: ReadonlyArray<FoundationRow> = loading && input.data.foundations.length === 0
        ? Array.from({ length: 6 }, (_, index) => ({ id: `pending-${index}`, displayId: `pending-${index}`, title: "", description: null }))
        : input.data.foundations
    if (input.blockState === "empty" || input.blockState === "failed") {
        return <EmptyNotice props={{ message: input.blockState === "failed" ? input.data.failed : input.data.empty, actionLabel: input.blockState === "failed" ? input.data.retry : undefined }} on={{ act: input.on?.retry }} />
    }
    return <>{rows.map((foundation) => <NavLink key={foundation.id} props={{ label: foundation.description === null ? foundation.title : `${foundation.title} · ${foundation.description}`, kind: "section" }} on={{ press: () => input.on?.openResource?.(foundation.displayId) }} isLoading={loading} />)}</>
}

/** Provide resolved block state/data/actions to the page's legal inner slots. */
export const CourseFoundationCategoryBlockBase = ({ render, ...input }: CourseFoundationCategoryBlockProps) => <BlockContext.Provider value={input}>{render?.()}</BlockContext.Provider>

/** Source-level ownership marker for the pure block slots. */
export const meta = { world: "pure", domain: "learn" } as const
