import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { CoverImage } from "@/components/leaves/CoverImage"
import { Heading } from "@/components/leaves/Heading"
import { Pagination } from "@/components/leaves/Pagination"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type LeafProps,
} from "@/components/contracts/props"

/** Presentation-owned category row; API response shapes stop at the connected mapper. */
export type FoundationCategoryRow = { readonly id: string; readonly title: string; readonly description: string | null; readonly thumbnailUrl: string | null }
/** Reader-selected presentation for the same category collection. */
export type FoundationCategoryLayout = "grid" | "line"

/** Resolved actions for the pure foundation catalog. */
export type CourseFoundationsBlockActions = {
    readonly openCategory?: (id: string) => void
    readonly search?: (query: string) => void
    readonly changeLayout?: (layout: FoundationCategoryLayout) => void
    readonly page?: (page: number) => void
    readonly enroll?: () => void
    readonly retry?: () => void
    readonly [key: string]: ((...args: Array<never>) => void) | undefined
}

/** Resolved states, copy and actions for the pure foundations hub. */
export type CourseFoundationsBlockProps = {
    readonly state: "pending" | "ready" | "empty" | "failed" | "partial"
    readonly props: {
        readonly title: string
        readonly description: string
        readonly empty: string
        readonly failed: string
        readonly retry: string
        readonly search: string
        readonly clearSearch: string
        readonly count: string
        readonly open: string
        readonly pager: string
        readonly previous: string
        readonly next: string
        readonly resultsTitle: string
        readonly resultsDescription: string
        readonly layoutLabel: string
        readonly gridLabel: string
        readonly lineLabel: string
        readonly activeGrid: string
        readonly activeLine: string
        readonly layout: FoundationCategoryLayout
        readonly page: number
        readonly totalPages: number
        readonly trialMessage?: string
        readonly trialAction?: string
        readonly categories: ReadonlyArray<FoundationCategoryRow>
    }
    readonly on?: CourseFoundationsBlockActions
}

type FoundationCategoryListData = SurfaceListCardData & {
    readonly categories: ReadonlyArray<FoundationCategoryRow>
    readonly openLabel: string
}

/** One surface-free category row run mounted inside the single list-card ground. */
const FoundationCategoryListView = ({ props, on, isLoading = false }: LeafProps<FoundationCategoryListData, CourseFoundationsBlockActions>) => (
    <Tree
        contract="foundation-category-destination-list"
        render={defineContractComponent("foundation-category-destination-list", {
            category: props.categories.map((category) => defineContractComponent("foundation-category-destination-row", {
                artwork: defineLeafComponent("cover-image", {}, () => (
                    <CoverImage props={{ src: category.thumbnailUrl, alt: "", ratio: "thumb" }} isLoading={isLoading} />
                )),
                identity: defineContractComponent("foundation-category-identity", {
                    title: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                        <Text props={{ content: category.title, size: "sm", weight: "medium" }} isLoading={isLoading} />
                    )),
                    description: category.description === null ? undefined : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text props={{ content: category.description ?? "", size: "sm", tone: "muted" }} isLoading={isLoading} />
                    )),
                }),
                action: isLoading ? undefined : defineLeafComponent("button", {}, () => (
                    <Button props={{ label: props.openLabel, variant: "ghost", size: "sm" }} on={{ press: () => on?.openCategory?.(category.id) }} />
                )),
            })),
        })}
    />
)

const FoundationCategoryList = defineContractComponent("foundation-category-destination-list", FoundationCategoryListView)

/** Draw the live foundation category catalog in pending, ready, empty and failed states. */
export const CourseFoundationsBlockBase = (input: CourseFoundationsBlockProps) => {
    const loading = input.state === "pending"
    const categories: ReadonlyArray<FoundationCategoryRow> = loading && input.props.categories.length === 0
        ? Array.from({ length: 10 }, (_, index) => ({ id: `pending-${index}`, title: "", description: null, thumbnailUrl: null }))
        : input.props.categories
    const notice = input.state === "empty" || input.state === "failed"
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    message: input.state === "failed" ? input.props.failed : input.props.empty,
                    actionLabel: input.state === "failed" ? input.props.retry : undefined,
                }}
                on={{ act: input.on?.retry }}
            />
        ))
        : undefined

    const toolbar = defineContractComponent("catalog-search-count-view-row", {
        search: defineContractComponent("catalog-query-with-count", {
            query: defineLeafComponent("search-box", {}, () => (
                <SearchBox
                    props={{ label: input.props.search, placeholder: input.props.search, clearLabel: input.props.clearSearch }}
                    on={{ search: input.on?.search }}
                />
            )),
            count: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: input.props.count, size: "sm", tone: "muted" }} isLoading={loading} />
            )),
        }),
        view: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs
                props={{
                    label: input.props.layoutLabel,
                    selectedKey: input.props.layout,
                    variant: "primary",
                    tabs: [
                        { id: "grid", label: input.props.gridLabel, icon: "viewGrid" },
                        { id: "line", label: input.props.lineLabel, icon: "viewList" },
                    ],
                }}
                on={{ select: (layout) => input.on?.changeLayout?.(layout === "line" ? "line" : "grid") }}
            />
        )),
    })

    const collection = categories.length === 0
        ? undefined
        : input.props.layout === "line"
            ? defineContractProjection("foundation-category-destination-list", () => (
                <SurfaceListCard
                    contract="foundation-category-destination-list"
                    render={FoundationCategoryList}
                    props={{ label: input.props.resultsTitle, isLabelHidden: true, categories: [...categories], openLabel: input.props.open }}
                    on={input.on}
                    isLoading={loading}
                />
            ))
            : defineContractComponent("foundation-category-card-grid", {
                category: categories.map((category) => defineContractProjection("foundation-category-grid-card", () => (
                    <SurfaceCard
                        contract="foundation-category-grid-card"
                        render={defineContractComponent("foundation-category-grid-card", {
                            artwork: defineLeafComponent("cover-image", {}, () => (
                                <CoverImage props={{ src: category.thumbnailUrl, alt: "", ratio: "wide" }} isLoading={loading} />
                            )),
                            body: defineContractComponent("foundation-category-grid-card-body", {
                                identity: defineContractComponent("foundation-category-identity", {
                                    title: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                                        <Text props={{ content: category.title, size: "sm", weight: "medium" }} isLoading={loading} />
                                    )),
                                    description: category.description === null ? undefined : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                                        <Text props={{ content: category.description ?? "", size: "sm", tone: "muted" }} isLoading={loading} />
                                    )),
                                }),
                                action: loading ? undefined : defineLeafComponent("button", {}, () => (
                                    <Button props={{ label: input.props.open, variant: "ghost", size: "sm", icon: "next", iconPlacement: "trailing" }} on={{ press: () => input.on?.openCategory?.(category.id) }} />
                                )),
                            }),
                        })}
                        isLoading={loading}
                    />
                ))),
            })

    return (
        <Tree contract="course-foundations-workspace" render={defineContractComponent("course-foundations-workspace", {
            header: defineContractComponent("page-header-stack", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />
                )),
            }),
            description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: input.props.description, size: "sm", tone: "muted" }} isLoading={loading} />
            )),
            trial: input.props.trialMessage === undefined ? undefined : defineContractComponent("foundation-trial-enrollment-nudge", {
                message: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: input.props.trialMessage ?? "", size: "sm" }} />),
                action: input.props.trialAction === undefined ? undefined : defineLeafComponent("button", {}, () => (
                    <Button props={{ label: input.props.trialAction ?? "", variant: "secondary", size: "sm" }} on={{ press: input.on?.enroll }} />
                )),
            }),
            toolbar,
            results: defineContractComponent("foundation-category-result-run", {
                header: defineContractComponent("foundation-category-results-header", {
                    identity: defineContractComponent("foundation-category-results-identity", {
                        title: defineLeafComponent("heading", {}, () => (
                            <Heading props={{ content: input.props.resultsTitle, level: 2 }} />
                        )),
                        description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                            <Text props={{ content: input.props.resultsDescription, size: "sm", tone: "muted" }} />
                        )),
                    }),
                    status: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text
                            props={{ content: input.props.layout === "grid" ? input.props.activeGrid : input.props.activeLine, size: "xs", tone: "muted", live: "polite" }}
                        />
                    )),
                }),
                collection,
                notice,
                pager: (input.state === "ready" || input.state === "partial") && input.props.totalPages > 1 ? defineLeafComponent("pagination", {}, () => (
                    <Pagination
                        props={{ label: input.props.pager, total: input.props.totalPages, page: input.props.page, previousLabel: input.props.previous, nextLabel: input.props.next }}
                        on={{ change: input.on?.page }}
                    />
                )) : undefined,
            }),
        })} />
    )
}
