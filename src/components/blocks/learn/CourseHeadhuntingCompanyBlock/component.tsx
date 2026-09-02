import { SurfaceListCard } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Button } from "@starci/grammar/common"
import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import type { HeadhuntingDirectoryRow } from "@/components/blocks/learn/CourseHeadhuntingsBlock/component"
import { TextAction } from "@starci/grammar/common"


type CourseHeadhuntingCompanyPageData = {
    readonly description?: string; readonly address?: string; readonly contactLabel?: string; readonly consultantsLabel: string
    readonly consultants: ReadonlyArray<HeadhuntingDirectoryRow>; readonly title: string; readonly trail: ReadonlyArray<BreadcrumbStep>
    readonly backLabel: string; readonly notFoundMessage: string; readonly emptyMessage: string; readonly errorMessage: string; readonly retryLabel: string
}
type CourseHeadhuntingCompanyPageActions = { readonly [key: string]: (() => void) | undefined; readonly back?: () => void; readonly retry?: () => void; readonly course?: () => void; readonly companyContact?: () => void }
/** Pure renderer input for the company profile surface. */
export type CourseHeadhuntingCompanyPageProps = { readonly blockState: "pending" | "ready" | "not-found" | "failed"; readonly props: CourseHeadhuntingCompanyPageData; readonly on?: CourseHeadhuntingCompanyPageActions }
type ConsultantListData = { readonly label: string; readonly rows: ReadonlyArray<HeadhuntingDirectoryRow>; readonly emptyMessage: string }
const PENDING_CONSULTANT_ROWS: ReadonlyArray<HeadhuntingDirectoryRow> = Array.from({ length: 3 }, (_unused, index) => ({ id: `pending-${index}`, label: "" }))

type ConsultantListProps = { readonly props: ConsultantListData; readonly on?: CourseHeadhuntingCompanyPageActions; readonly isLoading?: boolean }

const ConsultantList = (props: ConsultantListProps) => {
    const rows = props.isLoading === true ? PENDING_CONSULTANT_ROWS : props.props.rows
    if (props.isLoading !== true && rows.length === 0) return <EmptyNotice message={props.props.emptyMessage} />
    return <ul aria-label={props.props.label}>{rows.map((row) => {
        const label = [row.label, row.meta, row.actionLabel].filter((part) => part !== undefined).join(" · ")
        const handler = row.isActionAvailable === true ? props.on?.[`contact:${row.id}`] : undefined
        return <li key={row.id}>{handler === undefined ? <Text size={"md"} isSkeleton={props.isLoading === true}>{label}</Text> : <TextAction size={"md"} appearance="inline" onPress={handler}>{label}</TextAction>}</li>
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
            <Heading level={1} isSkeleton={isLoading}>{props.props.title}</Heading>
        </header>
        <nav aria-label={props.props.backLabel}>
            <Button variant="ghost" size="sm" onPress={props.on?.back}>{props.props.backLabel}</Button>
            {props.props.contactLabel === undefined ? null : <Button variant="primary" size="sm" onPress={props.on?.companyContact}>{props.props.contactLabel}</Button>}
        </nav>
        {notice ? <EmptyNotice message={noticeMessage} actionLabel={props.blockState === "failed" ? props.props.retryLabel : props.props.backLabel} iconSource={iconSourceFor(props.blockState === "failed" ? "retry" : "talents", "leading")} onAction={({ act: props.blockState === "failed" ? props.on?.retry : props.on?.back })?.act} /> : <section>
            {props.props.description === undefined ? null : <Text size={"md"} isSkeleton={isLoading}>{props.props.description}</Text>}
            {props.props.address === undefined ? null : <Text size={"sm"} tone={"muted"} isSkeleton={isLoading}>{props.props.address}</Text>}
            <SurfaceListCard label={props.props.consultantsLabel} isLoading={isLoading}><ConsultantList props={{ label: props.props.consultantsLabel, rows: props.props.consultants, emptyMessage: props.props.emptyMessage }} on={props.on} isLoading={isLoading} /></SurfaceListCard>
        </section>}
    </main>
}
