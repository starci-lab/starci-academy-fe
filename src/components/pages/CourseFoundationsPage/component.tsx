import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import type { FoundationCategory } from "@/modules/api/graphql/queries/query-foundation-categories"

type FoundationCategoryRow = Pick<FoundationCategory, "id" | "title" | "description">

/** Resolved states, copy and actions for the pure foundations hub. */
export type CourseFoundationsPageProps = {
    readonly state: "pending" | "ready" | "empty" | "failed"
    readonly props: {
        readonly title: string
        readonly description: string
        readonly empty: string
        readonly failed: string
        readonly retry: string
        readonly search: string
        readonly clearSearch: string
        readonly categories: ReadonlyArray<FoundationCategory>
    }
    readonly on?: { readonly openCategory?: (id: string) => void; readonly search?: (query: string) => void; readonly retry?: () => void }
}

/** Draw the live foundation category catalog in pending, ready, empty and failed states. */
export const CourseFoundationsPageBase = (input: CourseFoundationsPageProps) => {
    const loading = input.state === "pending"
    const categories: ReadonlyArray<FoundationCategoryRow> = loading && input.props.categories.length === 0
        ? Array.from({ length: 4 }, (_, index) => ({ id: `pending-${index}`, title: "", description: null }))
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
        <Tree contract="course-foundations-page" render={defineContractComponent("course-foundations-page", {
            header: defineContractComponent("page-header-stack", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />
                )),
            }),
            description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: input.props.description, size: "sm", tone: "muted" }} isLoading={loading} />
            )),
            search: defineLeafComponent("search-box", {}, () => (
                <SearchBox
                    props={{ label: input.props.search, placeholder: input.props.search, clearLabel: input.props.clearSearch }}
                    on={{ search: input.on?.search }}
                />
            )),
            category: categories.map((category) => defineLeafComponent("nav-link", { kind: "section" }, () => (
                <NavLink
                    props={{
                        label: category.description === null ? category.title : `${category.title} · ${category.description}`,
                        kind: "section",
                    }}
                    on={{ press: () => input.on?.openCategory?.(category.id) }}
                    isLoading={loading}
                />
            ))),
            notice,
        })} />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
