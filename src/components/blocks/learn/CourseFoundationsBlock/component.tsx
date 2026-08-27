import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { CoverImage } from "@/components/leaves/CoverImage"
import { Heading } from "@/components/leaves/Heading"
import { Pagination } from "@/components/leaves/Pagination"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"

/** Presentation-owned foundation category row. */
export type FoundationCategoryRow = { readonly id: string; readonly title: string; readonly description: string | null; readonly thumbnailUrl: string | null }
/** Reader-selected presentation for the category collection. */
export type FoundationCategoryLayout = "grid" | "line"
/** Resolved actions for the pure foundations catalog. */
export type CourseFoundationsActions = { readonly openCategory?: (id: string) => void; readonly search?: (query: string) => void; readonly changeLayout?: (layout: FoundationCategoryLayout) => void; readonly page?: (page: number) => void; readonly enroll?: () => void; readonly retry?: () => void }
/** Resolved state, copy and actions for the pure foundations hub. */
export type CourseFoundationsBlockProps = { readonly state: "pending" | "ready" | "empty" | "failed" | "partial"; readonly props: { readonly title: string; readonly description: string; readonly empty: string; readonly failed: string; readonly retry: string; readonly search: string; readonly clearSearch: string; readonly count: string; readonly open: string; readonly pager: string; readonly previous: string; readonly next: string; readonly resultsTitle: string; readonly resultsDescription: string; readonly layoutLabel: string; readonly gridLabel: string; readonly lineLabel: string; readonly activeGrid: string; readonly activeLine: string; readonly layout: FoundationCategoryLayout; readonly page: number; readonly totalPages: number; readonly trialMessage?: string; readonly trialAction?: string; readonly categories: ReadonlyArray<FoundationCategoryRow> }; readonly on?: CourseFoundationsActions }

/** Draw the live foundation category catalog in all transport states. */
export const CourseFoundationsBlockBase = (props: CourseFoundationsBlockProps) => {
    const loading = props.state === "pending"
    const categories = loading && props.props.categories.length === 0 ? Array.from({ length: 10 }, (_unused, index) => ({ id: `pending-${index}`, title: "", description: null, thumbnailUrl: null })) : props.props.categories
    return <main aria-label={props.props.title}>
        <header><Heading props={{ content: props.props.title, level: 1 }} isLoading={loading} /><Text props={{ content: props.props.description, size: "sm", tone: "muted" }} isLoading={loading} /></header>
        {props.props.trialMessage === undefined ? null : <section><Text props={{ content: props.props.trialMessage, size: "sm" }} /><Button props={{ label: props.props.trialAction ?? "", variant: "secondary", size: "sm" }} on={{ press: props.on?.enroll }} /></section>}
        <section aria-label={props.props.search}><SearchBox props={{ label: props.props.search, placeholder: props.props.search, clearLabel: props.props.clearSearch }} on={{ search: props.on?.search }} /><Text props={{ content: props.props.count, size: "sm", tone: "muted" }} isLoading={loading} /><ChoiceTabs props={{ label: props.props.layoutLabel, selectedKey: props.props.layout, variant: "primary", tabs: [{ id: "grid", label: props.props.gridLabel, icon: "viewGrid" }, { id: "line", label: props.props.lineLabel, icon: "viewList" }] }} on={{ select: (layout) => props.on?.changeLayout?.(layout === "line" ? "line" : "grid") }} /></section>
        <section aria-label={props.props.resultsTitle}><Heading props={{ content: props.props.resultsTitle, level: 2 }} /><Text props={{ content: props.props.resultsDescription, size: "sm", tone: "muted" }} /><Text props={{ content: props.props.layout === "grid" ? props.props.activeGrid : props.props.activeLine, size: "xs", tone: "muted", live: "polite" }} />
            {props.state === "empty" || props.state === "failed" ? <EmptyNotice props={{ message: props.state === "failed" ? props.props.failed : props.props.empty, actionLabel: props.state === "failed" ? props.props.retry : undefined }} on={{ act: props.on?.retry }} /> : props.props.layout === "line" ? <SurfaceListCard props={{ label: props.props.resultsTitle, isLabelHidden: true }} isLoading={loading}><ul>{categories.map((category) => <li key={category.id}><CoverImage props={{ src: category.thumbnailUrl, alt: "", ratio: "thumb" }} isLoading={loading} /><Text props={{ content: category.title, size: "sm", weight: "medium" }} isLoading={loading} />{category.description === null ? null : <Text props={{ content: category.description, size: "sm", tone: "muted" }} isLoading={loading} />} {!loading && <Button props={{ label: props.props.open, variant: "ghost", size: "sm" }} on={{ press: () => props.on?.openCategory?.(category.id) }} />}</li>)}</ul></SurfaceListCard> : <div>{categories.map((category) => <SurfaceCard key={category.id} isLoading={loading}><CoverImage props={{ src: category.thumbnailUrl, alt: "", ratio: "wide" }} isLoading={loading} /><Text props={{ content: category.title, size: "sm", weight: "medium" }} isLoading={loading} />{category.description === null ? null : <Text props={{ content: category.description, size: "sm", tone: "muted" }} isLoading={loading} />} {!loading && <Button props={{ label: props.props.open, variant: "ghost", size: "sm", icon: "next", iconPlacement: "trailing" }} on={{ press: () => props.on?.openCategory?.(category.id) }} />}</SurfaceCard>)}</div>}
            {(props.state === "ready" || props.state === "partial") && props.props.totalPages > 1 ? <Pagination props={{ label: props.props.pager, total: props.props.totalPages, page: props.props.page, previousLabel: props.props.previous, nextLabel: props.props.next }} on={{ change: props.on?.page }} /> : null}
        </section>
    </main>
}
