import { MyCoursesProgress } from "@/components/blocks/dashboard/MyCoursesProgress"
import { RecommendedCourses } from "@/components/blocks/dashboard/RecommendedCourses"
import { UpcomingLivestreamCard } from "@/components/blocks/dashboard/UpcomingLivestreamCard"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"
import { Tree } from "@/components/branches/Tree"
/** Orchestrate the three legacy learning blocks in fixed order. */
export const CoursesTab = () => <Tree contract="dashboard-courses-main" render={defineContractComponent("dashboard-courses-main", { section: [defineContractProjection("label-row-over-card", () => <MyCoursesProgress />), defineContractProjection("label-row-over-card", () => <RecommendedCourses />), defineContractProjection("label-row-over-card", () => <UpcomingLivestreamCard />)] })} />
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
