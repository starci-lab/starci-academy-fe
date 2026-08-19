import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
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
import type { HeadhuntingDirectoryRow } from "@/components/pages/CourseHeadhuntingsPage/component"

type CourseHeadhuntingCompanyPageData = {
    readonly title: string
    readonly trail: ReadonlyArray<BreadcrumbStep>
    readonly description?: string
    readonly address?: string
    readonly contactLabel?: string
    readonly consultantsLabel: string
    readonly consultants: ReadonlyArray<HeadhuntingDirectoryRow>
    readonly backLabel: string
    readonly notFoundMessage: string
    readonly emptyMessage: string
    readonly errorMessage: string
    readonly retryLabel: string
}

type CourseHeadhuntingCompanyPageActions = {
    readonly [key: string]: (() => void) | undefined
    readonly back?: () => void
    readonly retry?: () => void
    readonly course?: () => void
    readonly companyContact?: () => void
}

type CourseHeadhuntingCompanyPageProps = BlockProps<
    "pending" | "ready" | "not-found" | "failed",
    CourseHeadhuntingCompanyPageData
> & { readonly on?: CourseHeadhuntingCompanyPageActions }

type ConsultantListData = SurfaceListCardData & {
    readonly rows: ReadonlyArray<HeadhuntingDirectoryRow>
    readonly emptyMessage: string
}

const PENDING_CONSULTANT_ROWS: ReadonlyArray<HeadhuntingDirectoryRow> = Array.from(
    { length: 3 },
    (_unused, index) => ({ id: `pending-${index}`, label: "" }),
)

const ConsultantList = ({ props, on, isLoading = false }: LeafProps<ConsultantListData, CourseHeadhuntingCompanyPageActions>) => {
    const steps = !isLoading && props.rows.length === 0
        ? [defineContractProjection("next-action-row", () => <EmptyNotice props={{ message: props.emptyMessage }} />)]
        : (isLoading ? PENDING_CONSULTANT_ROWS : props.rows).map((row) => defineContractProjection("next-action-row", () => {
            const label = [row.label, row.meta, row.actionLabel].filter((part) => part !== undefined).join(" · ")
            const handler = row.isActionAvailable === true ? on?.[`contact:${row.id}`] : undefined
            return handler === undefined ? (
                <Text props={{ content: label, size: "md" }} isLoading={isLoading} />
            ) : (
                <TextLink props={{ label, size: "md" }} on={{ press: handler }} />
            )
        }))
    return <Tree contract="next-action-list" render={defineContractComponent("next-action-list", { step: steps })} />
}

const ConsultantListContent = defineContractComponent("next-action-list", ConsultantList)

/** Pure company profile with real consultant contact actions and no company-level apply. */
export const _CourseHeadhuntingCompanyPage = (input: CourseHeadhuntingCompanyPageProps) => {
    const isLoading = input.state === "pending"
    const header = defineContractComponent("page-header-stack", {
        trail: defineLeafComponent("breadcrumbs", {}, () => (
            <Breadcrumbs props={{ steps: input.props.trail, label: input.props.title }} on={{ course: input.on?.course }} />
        )),
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.title, level: 1 }} isLoading={isLoading} />),
    })
    const toolbar = defineContractProjection("catalog-search-count-view-row", () => (
        <>
            <Button props={{ label: input.props.backLabel, variant: "ghost", size: "sm" }} on={{ press: input.on?.back }} />
            {input.props.contactLabel === undefined ? null : (
                <Button props={{ label: input.props.contactLabel, variant: "primary", size: "sm", icon: "email" }} on={{ press: input.on?.companyContact }} />
            )}
        </>
    ))
    const noticeMessage = input.state === "not-found" ? input.props.notFoundMessage : input.props.errorMessage
    const notice = input.state === "not-found" || input.state === "failed"
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    icon: input.state === "failed" ? "retry" : "talents",
                    message: noticeMessage,
                    actionLabel: input.state === "failed" ? input.props.retryLabel : input.props.backLabel,
                }}
                on={{ act: input.state === "failed" ? input.on?.retry : input.on?.back }}
            />
        ))
        : undefined

    return (
        <Tree contract="course-headhunting-company-page" render={defineContractComponent("course-headhunting-company-page", {
            header,
            actions: toolbar,
            ...(notice === undefined ? {
                profile: defineContractProjection("catalog-section-group", () => (
                    <>
                        {input.props.description === undefined ? null : <Text props={{ content: input.props.description, size: "md" }} isLoading={isLoading} />}
                        {input.props.address === undefined ? null : <Text props={{ content: input.props.address, size: "sm", tone: "muted" }} isLoading={isLoading} />}
                        <SurfaceListCard
                            contract="next-action-list"
                            render={ConsultantListContent}
                            props={{
                                label: input.props.consultantsLabel,
                                rows: input.props.consultants,
                                emptyMessage: input.props.emptyMessage,
                            }}
                            on={input.on}
                            isLoading={isLoading}
                        />
                    </>
                )),
            } : { notice }),
        })} />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
