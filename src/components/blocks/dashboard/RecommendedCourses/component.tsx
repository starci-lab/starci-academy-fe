import { CONTRACTS } from "@/components/contracts"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { RecommendedCourseRow, type RecommendedCourseRowData } from "@/components/composites/RecommendedCourseRow"
import { defineCompositeComponent, defineContractComponent, type LeafProps } from "@/components/contracts/props"
/** Resolved frame and rows for course recommendations. */
export type RecommendedCoursesData = SurfaceListCardData & { readonly rows: ReadonlyArray<RecommendedCourseRowData>; readonly errorMessage?: string; readonly retryLabel?: string }
/** Retry and per-course navigation actions. */
export type RecommendedCoursesActions = { readonly [key: string]: (() => void) | undefined }
/** Situation-discriminated props for recommendations. */
export type RecommendedCoursesProps = { readonly state: "pending" | "hidden" | "failed" | "ready"; readonly props: RecommendedCoursesData; readonly on?: RecommendedCoursesActions }
const COUNT = CONTRACTS["recommended-course-list"].children.course.restingCount
const View = ({ props, on, isLoading = false }: LeafProps<RecommendedCoursesData, RecommendedCoursesActions>) => { const rows = isLoading ? Array.from({ length: COUNT }, (_, i) => ({ id: `resting-${i}` })) : props.rows; return <Tree contract="recommended-course-list" render={defineContractComponent("recommended-course-list", { course: rows.map((row) => defineCompositeComponent("recommended-course-row", {}, () => <RecommendedCourseRow props={row} on={{ open: on?.[`open:${row.id}`], openPriceDetail: on?.[`priceDetail:${row.id}`] }} isLoading={isLoading} />)) })} /> }
const List = defineContractComponent("recommended-course-list", View)
/** Draw recommendations and their local request outcomes. */
export const RecommendedCoursesBase = (input: RecommendedCoursesProps) => input.state === "hidden" ? null : input.state === "failed" ? <SurfaceCard props={{ label: input.props.label }} contract="empty-notice-card" render={defineContractComponent("empty-notice-card", { notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ icon: "course", message: input.props.errorMessage ?? "", actionLabel: input.props.retryLabel }} on={{ act: input.on?.retry }} />) })} /> : <SurfaceListCard contract="recommended-course-list" render={List} props={input.props} on={input.on} isLoading={input.state === "pending"} />
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
