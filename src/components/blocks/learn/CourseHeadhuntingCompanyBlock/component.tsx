import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
import type { HeadhuntingDirectoryRow } from "@/components/blocks/learn/CourseHeadhuntingsBlock/component"

type CourseHeadhuntingCompanyPageData = {
    readonly description?: string; readonly address?: string; readonly contactLabel?: string; readonly consultantsLabel: string
    readonly consultants: ReadonlyArray<HeadhuntingDirectoryRow>; readonly title: string; readonly trail: ReadonlyArray<BreadcrumbStep>
    readonly backLabel: string; readonly notFoundMessage: string; readonly emptyMessage: string; readonly errorMessage: string; readonly retryLabel: string
}
type CourseHeadhuntingCompanyPageActions = { readonly [key: string]: (() => void) | undefined; readonly back?: () => void; readonly retry?: () => void; readonly course?: () => void; readonly companyContact?: () => void }
/** Pure renderer input for the company profile surface. */
export type CourseHeadhuntingCompanyPageProps = { readonly blockState: "pending" | "ready" | "not-found" | "failed"; readonly props: CourseHeadhuntingCompanyPageData; readonly on?: CourseHeadhuntingCompanyPageActions }
type ConsultantListData = SurfaceListCardData & { readonly rows: ReadonlyArray<HeadhuntingDirectoryRow>; readonly emptyMessage: string }
const PENDING_CONSULTANT_ROWS: ReadonlyArray<HeadhuntingDirectoryRow> = Array.from({ length: 3 }, (_unused, index) => ({ id: `pending-${index}`, label: "" }))

type ConsultantListProps = { readonly props: ConsultantListData; readonly on?: CourseHeadhuntingCompanyPageActions; readonly isLoading?: boolean }

const ConsultantList = (props: ConsultantListProps) => {
    const rows = props.isLoading === true ? PENDING_CONSULTANT_ROWS : props.props.rows
    if (props.isLoading !== true && rows.length === 0) return <EmptyNotice props={{ message: props.props.emptyMessage }} />
    return <ul aria-label={props.props.label}>{rows.map((row) => {
        const label = [row.label, row.meta, row.actionLabel].filter((part) => part !== undefined).join(" · ")
        const handler = row.isActionAvailable === true ? props.on?.[`contact:${row.id}`] : undefined
        return <li key={row.id}>{handler === undefined ? <Text props={{ content: label, size: "md" }} isLoading={props.isLoading === true} /> : <TextLink props={{ label, size: "md" }} on={{ press: handler }} />}</li>
    })}</ul>
}

/** Draw the company profile with real consultant contact actions. */
/** Presentational state and company content for the block. */
export type CourseHeadhuntingCompanyBlockProps = CourseHeadhuntingCompanyPageProps
/** Render the company profile block from resolved state and actions. */
export const CourseHeadhuntingCompanyBlockBase = (props: CourseHeadhuntingCompanyBlockProps) => {
    const isLoading = props.blockState === "pending"
    const noticeMessage = props.blockState === "not-found" ? props.props.notFoundMessage : props.props.errorMessage
    const notice = props.blockState === "not-found" || props.blockState === "failed"
    return <main aria-label={props.props.title}>
        <header>
            <Breadcrumbs props={{ steps: props.props.trail, label: props.props.title }} on={{ course: props.on?.course }} />
            <Heading props={{ content: props.props.title, level: 1 }} isLoading={isLoading} />
        </header>
        <nav aria-label={props.props.backLabel}>
            <Button props={{ label: props.props.backLabel, variant: "ghost", size: "sm" }} on={{ press: props.on?.back }} />
            {props.props.contactLabel === undefined ? null : <Button props={{ label: props.props.contactLabel, variant: "primary", size: "sm", icon: "email" }} on={{ press: props.on?.companyContact }} />}
        </nav>
        {notice ? <EmptyNotice props={{ icon: props.blockState === "failed" ? "retry" : "talents", message: noticeMessage, actionLabel: props.blockState === "failed" ? props.props.retryLabel : props.props.backLabel }} on={{ act: props.blockState === "failed" ? props.on?.retry : props.on?.back }} /> : <section>
            {props.props.description === undefined ? null : <Text props={{ content: props.props.description, size: "md" }} isLoading={isLoading} />}
            {props.props.address === undefined ? null : <Text props={{ content: props.props.address, size: "sm", tone: "muted" }} isLoading={isLoading} />}
            <SurfaceListCard props={{ label: props.props.consultantsLabel }} isLoading={isLoading}><ConsultantList props={{ label: props.props.consultantsLabel, rows: props.props.consultants, emptyMessage: props.props.emptyMessage }} on={props.on} isLoading={isLoading} /></SurfaceListCard>
        </section>}
    </main>
}
