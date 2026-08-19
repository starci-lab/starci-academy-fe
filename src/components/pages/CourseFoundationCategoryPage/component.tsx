import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { SearchBox } from "@/components/leaves/SearchBox"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import type { Foundation } from "@/modules/api/graphql/queries/query-foundations"

type FoundationRow = Pick<Foundation, "id" | "displayId" | "title" | "description">

/** Resolved states, resources and actions for one foundation category. */
export type CourseFoundationCategoryPageProps = {
    readonly state: "pending" | "ready" | "empty" | "failed"
    readonly props: {
        readonly title: string
        readonly search: string
        readonly clearSearch: string
        readonly empty: string
        readonly failed: string
        readonly retry: string
        readonly foundations: ReadonlyArray<Foundation>
    }
    readonly on?: { readonly search?: (value: string) => void; readonly openResource?: (id: string) => void; readonly retry?: () => void }
}

/** Draw one searchable foundation category and all query result states. */
export const CourseFoundationCategoryPageBase = (input: CourseFoundationCategoryPageProps) => {
    const loading = input.state === "pending"
    const rows: ReadonlyArray<FoundationRow> = loading && input.props.foundations.length === 0
        ? Array.from({ length: 6 }, (_, index) => ({ id: `pending-${index}`, displayId: `pending-${index}`, title: "", description: null }))
        : input.props.foundations
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
        <Tree contract="course-foundation-category-page" render={defineContractComponent("course-foundation-category-page", {
            header: defineContractComponent("page-header-stack", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />
                )),
            }),
            search: defineLeafComponent("search-box", {}, () => (
                <SearchBox
                    props={{ label: input.props.search, placeholder: input.props.search, clearLabel: input.props.clearSearch }}
                    on={{ search: input.on?.search }}
                />
            )),
            resource: rows.map((foundation) => defineLeafComponent("nav-link", { kind: "section" }, () => (
                <NavLink
                    props={{
                        label: foundation.description === null ? foundation.title : `${foundation.title} · ${foundation.description}`,
                        kind: "section",
                    }}
                    on={{ press: () => input.on?.openResource?.(foundation.displayId) }}
                    isLoading={loading}
                />
            ))),
            notice,
        })} />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
