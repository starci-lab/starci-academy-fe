import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import {
    Breadcrumbs,
    type BreadcrumbStep,
} from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
/** One company or consultant directory row. */
export type HeadhuntingDirectoryRow = {
  readonly id: string;
  readonly label: string;
  readonly meta?: string;
  readonly actionLabel?: string;
  readonly isActionAvailable?: boolean;
};
type PageData = {
  readonly companies: ReadonlyArray<HeadhuntingDirectoryRow>;
  readonly consultants: ReadonlyArray<HeadhuntingDirectoryRow>;
  readonly title: string;
  readonly trail: ReadonlyArray<BreadcrumbStep>;
  readonly searchPlaceholder: string;
  readonly searchLabel: string;
  readonly clearSearchLabel: string;
  readonly companiesLabel: string;
  readonly consultantsLabel: string;
  readonly emptyMessage: string;
  readonly errorMessage: string;
  readonly retryLabel: string;
};
/** Headhunting page state, data and actions. */
export type CourseHeadhuntingsPageProps = {
  readonly blockState: "pending" | "ready" | "empty" | "failed";
  readonly props: PageData;
  readonly on?: {
    readonly [key: string]:
      (() => void) | ((query: string) => void) | undefined;
  };
};
type DirectoryProps = {
  readonly label: string;
  readonly rows: ReadonlyArray<HeadhuntingDirectoryRow>;
  readonly on?: CourseHeadhuntingsPageProps["on"];
  readonly loading: boolean;
};
const Directory = (props: DirectoryProps) => {
    const rows: ReadonlyArray<HeadhuntingDirectoryRow> = props.loading
        ? Array.from({ length: 4 }, (_, index) => ({
            id: `pending-${index}`,
            label: "",
        }))
        : props.rows

    return (
        <SurfaceListCard props={{ label: props.label }} isLoading={props.loading}>
            {rows.map((row) => {
                const label = [row.label, row.meta, row.actionLabel]
                    .filter(Boolean)
                    .join(" · ")
                const handler =
        row.actionLabel === undefined
            ? props.on?.[`open:${row.id}`]
            : row.isActionAvailable
                ? props.on?.[`contact:${row.id}`]
                : undefined
                return handler === undefined ? (
                    <Text
                        key={row.id}
                        props={{ content: label, size: "md" }}
                        isLoading={props.loading}
                    />
                ) : (
                    <TextLink
                        key={row.id}
                        props={{ label, size: "md" }}
                        on={{ press: handler as () => void }}
                    />
                )
            })}
        </SurfaceListCard>
    )
}
/** Draw the company and consultant directory. */
export const CourseHeadhuntingsBlockBase = (
    props: CourseHeadhuntingsPageProps,
) => {
    const loading = props.blockState === "pending"
    if (props.blockState === "empty" || props.blockState === "failed")
        return (
            <EmptyNotice
                props={{
                    message:
            props.blockState === "failed"
                ? props.props.errorMessage
                : props.props.emptyMessage,
                    actionLabel:
            props.blockState === "failed" ? props.props.retryLabel : undefined,
                }}
                on={{ act: props.on?.retry as (() => void) | undefined }}
            />
        )
    return (
        <div>
            <Breadcrumbs
                props={{ steps: props.props.trail, label: props.props.title }}
                on={{ course: props.on?.course as (() => void) | undefined }}
            />
            <Heading props={{ content: props.props.title, level: 1 }} />
            <SearchBox
                props={{
                    placeholder: props.props.searchPlaceholder,
                    label: props.props.searchLabel,
                    clearLabel: props.props.clearSearchLabel,
                }}
                on={{ search: props.on?.search as (query: string) => void }}
            />
            <Directory
                label={props.props.companiesLabel}
                rows={props.props.companies}
                on={props.on}
                loading={loading}
            />
            {props.props.consultants.length === 0 && !loading ? null : (
                <Directory
                    label={props.props.consultantsLabel}
                    rows={props.props.consultants}
                    on={props.on}
                    loading={loading}
                />
            )}
        </div>
    )
}
