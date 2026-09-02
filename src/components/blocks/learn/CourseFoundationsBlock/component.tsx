import { SurfaceCard } from "@starci/grammar/common"
import { SurfaceListCard } from "@starci/grammar/common"
import { EmptyNotice } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Icon } from "@starci/grammar/common"

import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { CoverImage } from "@/components/leaves/CoverImage"
import { Heading } from "@starci/grammar/common"
import { Pagination } from "@/components/leaves/Pagination"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@starci/grammar/common"

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
        <header><Heading level={1} isSkeleton={loading}>{props.props.title}</Heading><Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.description}</Text></header>
        {props.props.trialMessage === undefined ? null : <section><Text size={"sm"}>{props.props.trialMessage}</Text><Button variant="secondary" size="sm" onPress={props.on?.enroll}>{props.props.trialAction ?? ""}</Button></section>}
        <section aria-label={props.props.search}><SearchBox props={{ label: props.props.search, placeholder: props.props.search, clearLabel: props.props.clearSearch }} on={{ search: props.on?.search }} /><Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.count}</Text><ChoiceTabs props={{ label: props.props.layoutLabel, selectedKey: props.props.layout, variant: "primary", tabs: [{ id: "grid", label: props.props.gridLabel, icon: "viewGrid" }, { id: "line", label: props.props.lineLabel, icon: "viewList" }] }} on={{ select: (layout) => props.on?.changeLayout?.(layout === "line" ? "line" : "grid") }} /></section>
        <section aria-label={props.props.resultsTitle}><Heading level={2}>{props.props.resultsTitle}</Heading><Text size={"sm"} tone={"muted"}>{props.props.resultsDescription}</Text><Text size={"xs"} tone={"muted"} live={"polite"}>{props.props.layout === "grid" ? props.props.activeGrid : props.props.activeLine}</Text>
            {props.state === "empty" || props.state === "failed" ? <EmptyNotice message={props.state === "failed" ? props.props.failed : props.props.empty} actionLabel={props.state === "failed" ? props.props.retry : undefined} onAction={({ act: props.on?.retry })?.act} /> : props.props.layout === "line" ? <SurfaceListCard label={props.props.resultsTitle} labelHidden={true} isLoading={loading}><ul>{categories.map((category) => <li key={category.id}><CoverImage props={{ src: category.thumbnailUrl, alt: "", ratio: "thumb" }} isLoading={loading} /><Text size={"sm"} weight={"medium"} isSkeleton={loading}>{category.title}</Text>{category.description === null ? null : <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{category.description}</Text>} {!loading && <Button variant="ghost" size="sm" onPress={() => props.on?.openCategory?.(category.id)}>{props.props.open}</Button>}</li>)}</ul></SurfaceListCard> : <div>{categories.map((category) => <SurfaceCard key={category.id} composition="joined" state={loading ? "pending" : "neutral"}><CoverImage props={{ src: category.thumbnailUrl, alt: "", ratio: "wide" }} isLoading={loading} /><Text size={"sm"} weight={"medium"} isSkeleton={loading}>{category.title}</Text>{category.description === null ? null : <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{category.description}</Text>} {!loading && <Button variant={"ghost"} size={"sm"} onPress={({ press: () => props.on?.openCategory?.(category.id) })?.press} endContent={"next" === "next" && "trailing" === "trailing" ? <Icon source={iconSourceFor("next", "chip")} role="chip" /> : undefined}>{props.props.open}</Button>}</SurfaceCard>)}</div>}
            {(props.state === "ready" || props.state === "partial") && props.props.totalPages > 1 ? <Pagination props={{ label: props.props.pager, total: props.props.totalPages, page: props.props.page, previousLabel: props.props.previous, nextLabel: props.props.next }} on={{ change: props.on?.page }} /> : null}
        </section>
    </main>
}
