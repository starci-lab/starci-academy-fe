import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { CoverImage } from "@/components/leaves/CoverImage"
import { Heading } from "@/components/leaves/Heading"
import { Pagination } from "@/components/leaves/Pagination"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
/** Presentation-owned category row; API response shapes stop at the connected mapper. */
export type FoundationCategoryRow = { readonly id: string; readonly title: string; readonly description: string | null; readonly thumbnailUrl: string | null }

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
        readonly page: number
        readonly totalPages: number
        readonly trialMessage?: string
        readonly trialAction?: string
        readonly categories: ReadonlyArray<FoundationCategoryRow>
    }
    readonly on?: { readonly openCategory?: (id: string) => void; readonly search?: (query: string) => void; readonly page?: (page: number) => void; readonly enroll?: () => void; readonly retry?: () => void }
}

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

    return (
        <Tree contract={"course-foundations-page"} render={defineContractComponent("course-foundations-page", {
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
            query: defineContractComponent("catalog-query-with-count", {
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
            results: defineContractComponent("foundation-category-result-run", {
                list: categories.length === 0 ? undefined : defineContractComponent("foundation-category-destination-list", {
                    category: categories.map((category) => defineContractComponent("foundation-category-destination-row", {
                        artwork: defineLeafComponent("cover-image", {}, () => (
                            <CoverImage props={{ src: category.thumbnailUrl, alt: "", ratio: "thumb" }} isLoading={loading} />
                        )),
                        identity: defineContractComponent("foundation-category-identity", {
                            title: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                                <Text props={{ content: category.title, size: "sm", weight: "medium" }} isLoading={loading} />
                            )),
                            description: category.description === null ? undefined : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                                <Text props={{ content: category.description ?? "", size: "sm", tone: "muted" }} isLoading={loading} />
                            )),
                        }),
                        action: loading ? undefined : defineLeafComponent("button", {}, () => (
                            <Button props={{ label: input.props.open, variant: "ghost", size: "sm" }} on={{ press: () => input.on?.openCategory?.(category.id) }} />
                        )),
                    })),
                }),
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
