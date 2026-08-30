import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Heading } from "@/components/leaves/Heading"
import { Pagination } from "@/components/leaves/Pagination"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import {
    CourseCatalogCard,
    type CourseCatalogCardData,
} from "@/components/blocks/courses/CourseCatalogCard"
import { MyCoursesProgress } from "@/components/blocks/dashboard/MyCoursesProgress"
import { CoursePriceOverlay } from "@/components/overlays/courses/CoursePriceOverlay"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import {
    catalogGridClassName,
    catalogHeaderClassName,
    catalogLineClassName,
    catalogPageClassName,
    catalogSearchClassName,
    catalogSectionClassName,
    catalogToolbarClassName,
    catalogViewClassName,
} from "./classNames"

/** Catalog loading and result states. */
export type CoursesCatalogBlockState =
  "pending" | "ready" | "empty" | "filtered-empty" | "failed";
/** Localized catalog labels. */
export type CoursesCatalogBlockLabels = {
  readonly navHome: string;
  readonly navCourses: string;
  readonly title: string;
  readonly searchPlaceholder: string;
  readonly searchLabel: string;
  readonly searchClearLabel: string;
  readonly viewLabel: string;
  readonly viewGrid: string;
  readonly viewLine: string;
  readonly discoverTitle: string;
  readonly pageLabel: string;
  readonly previousPageLabel: string;
  readonly nextPageLabel: string;
};
/** Label set reused by catalog page integrations. */
export type CoursesCatalogPageLabels = CoursesCatalogBlockLabels;
/** Resolved catalog content. */
export type CoursesCatalogBlockData = {
  readonly labels: CoursesCatalogBlockLabels;
  readonly countLabel?: string;
  readonly query?: string;
  readonly view?: "grid" | "line";
  readonly hasOwned?: boolean;
  readonly discover?: ReadonlyArray<CourseCatalogCardData>;
  readonly page?: number;
  readonly totalPages?: number;
  readonly noticeMessage?: string;
  readonly noticeActionLabel?: string;
  readonly pricedCourseId?: string;
  readonly pricedCourseTitle?: string;
};
/** Catalog callbacks. */
export type CoursesCatalogBlockActions = {
  readonly search?: (query: string) => void;
  readonly changeView?: (view: string) => void;
  readonly changePage?: (page: number) => void;
  readonly recover?: () => void;
  readonly goHome?: () => void;
  readonly dismissPrice?: () => void;
  readonly [key: string]: ((...args: Array<never>) => void) | undefined;
};
/** Traditional catalog props. */
export type CoursesCatalogBlockProps = {
  readonly blockState: CoursesCatalogBlockState;
  readonly props: CoursesCatalogBlockData;
  readonly on?: CoursesCatalogBlockActions;
};

/** Draw the searchable course catalog with owned and discoverable groups. */
export const CoursesCatalogBlockBase = (props: CoursesCatalogBlockProps) => {
    const { labels } = props.props
    const loading = props.blockState === "pending"
    const notice =
    props.blockState === "empty" ||
    props.blockState === "filtered-empty" ||
    props.blockState === "failed"
    const courses = props.props.discover ?? []
    return (
        <div className={catalogPageClassName}>
            <div className={catalogHeaderClassName}>
                <Breadcrumbs
                    props={{
                        steps: [
                            { id: "home", label: labels.navHome },
                            { id: "courses", label: labels.navCourses },
                        ],
                        label: labels.title,
                    }}
                    on={{ home: props.on?.goHome }}
                />
                <Heading props={{ content: labels.title, level: 1 }} />
            </div>
            <div className={catalogToolbarClassName}>
                <div className={catalogSearchClassName}>
                    <SearchBox
                        props={{
                            placeholder: labels.searchPlaceholder,
                            label: labels.searchLabel,
                            clearLabel: labels.searchClearLabel,
                        }}
                        on={{ search: props.on?.search }}
                    />
                    {props.props.countLabel && (
                        <Text
                            props={{
                                content: props.props.countLabel,
                                size: "sm",
                                tone: "muted",
                            }}
                        />
                    )}
                </div>
                <div className={catalogViewClassName}>
                    <ChoiceTabs
                        props={{
                            label: labels.viewLabel,
                            selectedKey: props.props.view ?? "grid",
                            variant: "primary",
                            tabs: [
                                { id: "grid", label: labels.viewGrid, icon: "viewGrid" },
                                { id: "line", label: labels.viewLine, icon: "viewList" },
                            ],
                        }}
                        on={{ select: props.on?.changeView }}
                    />
                </div>
            </div>
            {!notice && props.props.hasOwned && <MyCoursesProgress />}
            {notice ? (
                <EmptyNotice
                    props={{
                        icon: "course",
                        message: props.props.noticeMessage ?? "",
                        actionLabel: props.props.noticeActionLabel,
                    }}
                    on={{ act: props.on?.recover }}
                />
            ) : (
                <section className={catalogSectionClassName}>
                    <Heading props={{ content: labels.discoverTitle, level: 2 }} />
                    {props.props.view === "line" ? (
                        <SurfaceCard props={{ inset: "none" }}>
                            <div className={catalogLineClassName}>
                                {courses.map((course) => (
                                    <CourseCatalogCard
                                        key={course.id}
                                        state={loading ? "pending" : "ready"}
                                        course={{ ...course, layout: "line" }}
                                        onView={props.on?.[`view:${course.id}`]}
                                        onOpenPriceDetail={props.on?.[`priceDetail:${course.id}`]}
                                    />
                                ))}
                            </div>
                        </SurfaceCard>
                    ) : (
                        <div className={catalogGridClassName}>
                            {courses.map((course) => (
                                <CourseCatalogCard
                                    key={course.id}
                                    state={loading ? "pending" : "ready"}
                                    course={{ ...course, layout: "grid" }}
                                    onView={props.on?.[`view:${course.id}`]}
                                    onOpenPriceDetail={props.on?.[`priceDetail:${course.id}`]}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}
            {!notice && !loading && props.props.totalPages !== undefined && (
                <Pagination
                    props={{
                        label: labels.pageLabel,
                        total: props.props.totalPages,
                        page: props.props.page ?? 1,
                        previousLabel: labels.previousPageLabel,
                        nextLabel: labels.nextPageLabel,
                    }}
                    on={{ change: props.on?.changePage }}
                />
            )}
            {props.props.pricedCourseId && (
                <CoursePriceOverlay
                    courseId={props.props.pricedCourseId}
                    title={props.props.pricedCourseTitle}
                    isOpen
                    onDismiss={props.on?.dismissPrice ?? (() => undefined)}
                />
            )}
        </div>
    )
}
