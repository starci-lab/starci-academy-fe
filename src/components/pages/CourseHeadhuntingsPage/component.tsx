import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type BlockProps,
    type LeafProps,
} from "@/components/contracts/props"

/** One company destination or consultant contact line in the directory. */
export type HeadhuntingDirectoryRow = {
    readonly id: string
    readonly label: string
    readonly meta?: string
    readonly actionLabel?: string
    readonly isActionAvailable?: boolean
}

type CourseHeadhuntingsPageData = {
    readonly title: string
    readonly trail: ReadonlyArray<BreadcrumbStep>
    readonly searchPlaceholder: string
    readonly searchLabel: string
    readonly clearSearchLabel: string
    readonly companiesLabel: string
    readonly consultantsLabel: string
    readonly companies: ReadonlyArray<HeadhuntingDirectoryRow>
    readonly consultants: ReadonlyArray<HeadhuntingDirectoryRow>
    readonly emptyMessage: string
    readonly errorMessage: string
    readonly retryLabel: string
}

type CourseHeadhuntingsPageActions = {
    readonly [key: string]: (() => void) | ((query: string) => void) | undefined
    readonly course?: () => void
    readonly search?: (query: string) => void
    readonly retry?: () => void
}

type CourseHeadhuntingsPageProps = BlockProps<
    "pending" | "ready" | "empty" | "failed",
    CourseHeadhuntingsPageData
> & { readonly on?: CourseHeadhuntingsPageActions }

type DirectoryListData = SurfaceListCardData & { readonly rows: ReadonlyArray<HeadhuntingDirectoryRow> }

const PENDING_DIRECTORY_ROWS: ReadonlyArray<HeadhuntingDirectoryRow> = Array.from(
    { length: 4 },
    (_unused, index) => ({ id: `pending-${index}`, label: "" }),
)

const DirectoryList = ({ props, on, isLoading = false }: LeafProps<DirectoryListData, CourseHeadhuntingsPageActions>) => (
    <Tree contract="content-next-list" render={defineContractComponent("content-next-list", {
        step: (isLoading ? PENDING_DIRECTORY_ROWS : props.rows)
            .map((row) => defineContractProjection("content-next-row", () => {
                const label = [row.label, row.meta, row.actionLabel].filter((part) => part !== undefined).join(" · ")
                const handler = row.actionLabel === undefined
                    ? on?.[`open:${row.id}`]
                    : row.isActionAvailable === true ? on?.[`contact:${row.id}`] : undefined
                return handler === undefined ? (
                    <Text props={{ content: label, size: "md" }} isLoading={isLoading} />
                ) : (
                    <TextLink props={{ label, size: "md" }} on={{ press: handler as (() => void) | undefined }} />
                )
            })),
    })} />
)

const DirectoryListContent = defineContractComponent("content-next-list", DirectoryList)

/** Pure company search plus consultant contact directory. */
export const _CourseHeadhuntingsPage = (input: CourseHeadhuntingsPageProps) => {
    const isLoading = input.state === "pending"
    const header = defineContractComponent("page-header-stack", {
        trail: defineLeafComponent("breadcrumbs", {}, () => (
            <Breadcrumbs props={{ steps: input.props.trail, label: input.props.title }} on={{ course: input.on?.course as (() => void) | undefined }} />
        )),
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.title, level: 1 }} />),
    })
    const toolbar = defineContractProjection("catalog-search-count-view-row", () => (
        <SearchBox
            props={{
                placeholder: input.props.searchPlaceholder,
                label: input.props.searchLabel,
                clearLabel: input.props.clearSearchLabel,
            }}
            on={{ search: input.on?.search as ((query: string) => void) | undefined }}
        />
    ))
    const notice = input.state === "failed" || input.state === "empty"
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    icon: input.state === "failed" ? "retry" : "talents",
                    message: input.state === "failed" ? input.props.errorMessage : input.props.emptyMessage,
                    actionLabel: input.state === "failed" ? input.props.retryLabel : undefined,
                }}
                on={{ act: input.state === "failed" ? input.on?.retry as (() => void) | undefined : undefined }}
            />
        ))
        : undefined

    return (
        <Tree contract="course-headhuntings-page" render={defineContractComponent("course-headhuntings-page", {
            header,
            search: toolbar,
            ...(notice === undefined ? {
                directories: defineContractProjection("catalog-section-group", () => (
                    <>
                        <SurfaceListCard
                            contract="content-next-list"
                            render={DirectoryListContent}
                            props={{ label: input.props.companiesLabel, rows: input.props.companies }}
                            on={input.on}
                            isLoading={isLoading}
                        />
                        {input.props.consultants.length === 0 && !isLoading ? null : (
                            <SurfaceListCard
                                contract="content-next-list"
                                render={DirectoryListContent}
                                props={{ label: input.props.consultantsLabel, rows: input.props.consultants }}
                                on={input.on}
                                isLoading={isLoading}
                            />
                        )}
                    </>
                )),
            } : { notice }),
        })} />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
